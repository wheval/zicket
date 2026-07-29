/**
 * Full-stack purchase regression test.
 *
 * Unlike `e2e.ts`, which talks to the contracts directly, this drives the
 * running Next.js server: it publishes a listing through the API, performs the
 * exact multicall the browser hook builds, and then asks the API to verify and
 * record the purchase. It is the closest thing to a headless run of the UI.
 *
 *   pnpm chain:flow            # expects the app on http://localhost:3100
 */
import { Account, RpcProvider, cairo, CallData } from "starknet";

import { computeCommitment, randomFelt } from "../../lib/starknet/commitment";
import { provisionBuyerWallets } from "./buyers";
// Importing common also loads .env.local / .env into process.env.
import { NETWORK, RPC_URL } from "./common";

const APP_URL = process.env.APP_URL ?? "http://localhost:3100";

/**
 * Wallets to provision on a public network. Each costs a fund + deploy
 * transaction on first run, and a public ticket is one-per-address, so this
 * also caps how many times the harness can re-run before it needs more.
 */
const SHOPPER_COUNT = Number(process.env.ZICKET_FLOW_SHOPPERS ?? 3);

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${label}`, detail ?? "");
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const response = await fetch(`${APP_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return { status: response.status, body: (await response.json()) as T };
}

interface DevnetAccount {
  address: string;
  private_key: string;
}

/** Devnet exposes its predeployed accounts over JSON-RPC, not REST. */
async function devnetAccounts(rpcUrl: string): Promise<DevnetAccount[]> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "devnet_getPredeployedAccounts",
      params: { with_balance: false },
    }),
  });
  const body = (await response.json()) as { result?: DevnetAccount[] };
  return body.result ?? [];
}

/**
 * Stand-ins for shoppers' browser wallets. Devnet hands us a pool of ready
 * accounts; on a public network we provision (fund + deploy) a small set.
 */
async function shopperWallets(
  provider: RpcProvider,
  rpcUrl: string,
  adminAddress: string,
): Promise<DevnetAccount[]> {
  if (NETWORK === "devnet") {
    return (await devnetAccounts(rpcUrl)).filter(
      (w) => BigInt(w.address) !== BigInt(adminAddress),
    );
  }
  return provisionBuyerWallets(provider, SHOPPER_COUNT);
}

/** A public ticket binds to one address, so re-runs need a fresh buyer. */
async function firstWalletWithoutTicket(
  provider: RpcProvider,
  zicket: string,
  eventId: number,
  wallets: DevnetAccount[],
): Promise<DevnetAccount | undefined> {
  for (const wallet of wallets) {
    const [held] = await provider.callContract({
      contractAddress: zicket,
      entrypoint: "ticket_of",
      calldata: CallData.compile({ event_id: eventId, account: wallet.address }),
    });
    if (BigInt(held) === 0n) return wallet;
  }
  return undefined;
}

async function main() {
  const rpcUrl = RPC_URL;
  const zicket = process.env.NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS!;
  const token = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS!;
  const adminAddress = process.env.STARKNET_ADMIN_ADDRESS!;
  const adminKey = process.env.STARKNET_ADMIN_PRIVATE_KEY!;

  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const admin = new Account({ provider, address: adminAddress, signer: adminKey });

  // Devnet's predeployed accounts stand in for shoppers' browser wallets. A
  // public ticket is one-per-address, so each run needs an address that does
  // not already hold one — otherwise the contract correctly rejects the buy.
  const wallets = await shopperWallets(provider, rpcUrl, adminAddress);
  if (wallets.length === 0) throw new Error("No buyer accounts available");

  console.log(`\nApp:      ${APP_URL}`);
  console.log(`RPC:      ${rpcUrl}`);
  console.log(`Zicket:   ${zicket}\n`);

  // ── [0] the app is serving chain config ────────────────────────────────────
  console.log("[0] chain config");
  const config = await api<{ configured: boolean; contracts: { zicket: string } }>(
    "/api/chain/config",
  );
  check("config endpoint reports configured", config.body.configured === true);
  check(
    "config advertises the deployed contract",
    BigInt(config.body.contracts.zicket) === BigInt(zicket),
  );

  // ── [1] fund the buyer ─────────────────────────────────────────────────────
  console.log("\n[1] fund buyers with payment token");
  let mint = { transaction_hash: "" };
  for (const wallet of wallets) {
    mint = await admin.execute({
      contractAddress: token,
      entrypoint: "mint",
      calldata: CallData.compile({
        recipient: wallet.address,
        amount: cairo.uint256(10_000n * 10n ** 18n),
      }),
    });
    await provider.waitForTransaction(mint.transaction_hash);
  }
  check("buyers funded", Boolean(mint.transaction_hash));

  // ── [2] publish through the API ────────────────────────────────────────────
  for (const [ticketId, label] of [
    ["234", "anonymous"],
    ["235", "public"],
  ] as const) {
    console.log(`\n[2:${label}] publish ticket ${ticketId}`);
    const publish = await api<{ published: boolean; error?: string }>(
      `/api/chain/events/${ticketId}`,
      { method: "POST" },
    );
    check(`publish ${ticketId} succeeded`, publish.status === 200, publish.body);

    const state = await api<{
      published: boolean;
      saleOpen: boolean;
      onchainEventId?: number;
      event: { eventId: number; price: string; ticketsSold: number; anonymousAllowed: boolean };
    }>(`/api/chain/events/${ticketId}`);
    const listing = await api<{ item: { no_of_attendees: number } }>(`/api/tickets/${ticketId}`);
    const attendeesBefore = listing.body.item.no_of_attendees;
    check(`${ticketId} is on-chain`, state.body.published === true);
    check(`${ticketId} sale is open`, state.body.saleOpen === true);

    const eventId = state.body.event.eventId;
    const price = BigInt(state.body.event.price);
    const soldBefore = state.body.event.ticketsSold;
    const anonymous = label === "anonymous";
    check(
      `${ticketId} anonymity flag matches the listing`,
      state.body.event.anonymousAllowed === anonymous,
    );

    // ── [3] the multicall the browser signs ──────────────────────────────────
    console.log(`[3:${label}] purchase`);
    const wallet = anonymous
      ? wallets[0]
      : await firstWalletWithoutTicket(provider, zicket, eventId, wallets);
    if (!wallet) throw new Error(`No devnet account left without a ticket for event ${eventId}`);
    const buyer = new Account({
      provider,
      address: wallet.address,
      signer: wallet.private_key,
    });
    console.log(`      buyer ${wallet.address}`);
    const secret = anonymous ? randomFelt() : undefined;
    const nullifier = anonymous ? randomFelt() : undefined;
    const commitment =
      secret && nullifier ? computeCommitment(secret, nullifier) : undefined;

    const calls = [
      ...(price > 0n
        ? [
            {
              contractAddress: token,
              entrypoint: "approve",
              calldata: CallData.compile({ spender: zicket, amount: cairo.uint256(price) }),
            },
          ]
        : []),
      {
        contractAddress: zicket,
        entrypoint: anonymous ? "buy_ticket_anonymous" : "buy_ticket",
        calldata: anonymous
          ? CallData.compile({ event_id: eventId, commitment: commitment! })
          : CallData.compile({ event_id: eventId }),
      },
    ];

    const tx = await buyer.execute(calls);
    await provider.waitForTransaction(tx.transaction_hash);
    check(`${label} purchase transaction accepted`, Boolean(tx.transaction_hash));

    // ── [4] the API verifies the transaction on-chain and records it ─────────
    console.log(`[4:${label}] record purchase`);
    const record = await api<{ purchase?: { mode: string }; created?: boolean; error?: string }>(
      "/api/chain/purchases",
      {
        method: "POST",
        body: JSON.stringify({
          ticketId,
          txHash: tx.transaction_hash,
          email: anonymous ? undefined : "buyer@example.com",
        }),
      },
    );
    check(`${label} purchase recorded`, record.status === 201, record.body);
    check(`${label} recorded as newly created`, record.body.created === true, record.body);
    check(`${label} recorded with the right mode`, record.body.purchase?.mode === label, record.body);

    // Replaying the same hash must not create a second row.
    const replay = await api<{ created?: boolean }>("/api/chain/purchases", {
      method: "POST",
      body: JSON.stringify({ ticketId, txHash: tx.transaction_hash }),
    });
    check(`${label} replay is accepted`, replay.status === 200, replay.body);
    check(`${label} replay is not a new purchase`, replay.body.created === false, replay.body);

    const listingAfter = await api<{ item: { no_of_attendees: number } }>(
      `/api/tickets/${ticketId}`,
    );
    check(
      `${label} replay did not inflate the attendee count`,
      listingAfter.body.item.no_of_attendees === attendeesBefore + 1,
      { before: attendeesBefore, after: listingAfter.body.item.no_of_attendees },
    );

    const listed = await api<{ items: Array<{ tx_hash: string; mode: string }> }>(
      `/api/chain/purchases?ticketId=${ticketId}`,
    );
    const matches = listed.body.items.filter(
      (p) => BigInt(p.tx_hash) === BigInt(tx.transaction_hash),
    );
    check(`${label} stored exactly once`, matches.length === 1, listed.body.items);

    // ── [5] chain state moved ────────────────────────────────────────────────
    const after = await api<{ event: { ticketsSold: number; escrow: string } }>(
      `/api/chain/events/${ticketId}`,
    );
    check(
      `${label} tickets_sold incremented`,
      after.body.event.ticketsSold === soldBefore + 1,
      after.body.event,
    );
    check(
      `${label} escrow holds the ticket price`,
      BigInt(after.body.event.escrow) >= price,
      after.body.event.escrow,
    );
  }

  // ── [6] a forged transaction hash is rejected ──────────────────────────────
  console.log("\n[6] rejects an unrelated transaction");
  const forged = await api<{ error?: string }>("/api/chain/purchases", {
    method: "POST",
    body: JSON.stringify({ ticketId: "234", txHash: mint.transaction_hash }),
  });
  check("mint tx is not accepted as a purchase", forged.status >= 400, forged.body);

  console.log(`\n${failed === 0 ? "✅" : "❌"} ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error("\n❌ flow-e2e failed\n", error);
  process.exit(1);
});
