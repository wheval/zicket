/**
 * End-to-end exercise of the deployed contracts against a live node.
 *
 * Proves the whole ticketing loop works on chain, and — critically — that the
 * commitment the browser computes in `lib/starknet/commitment.ts` is byte-for-byte
 * the value the Cairo contract derives. If that ever drifts, anonymous tickets
 * become unredeemable, so it is asserted first.
 *
 * Usage: pnpm chain:e2e
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Account, CallData, Contract, cairo, type RpcProvider } from "starknet";

import { computeCommitment, computeNullifierHash, generateTicketSecret } from "../../lib/starknet/commitment";
import { provisionBuyers } from "./buyers";
import { assertNodeReachable, getDeployer, getProvider, NETWORK, ROOT } from "./common";


const PRICE = 5n * 10n ** 18n;
const FUNDING = 1000n * 10n ** 18n;

let checks = 0;
function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`assertion failed: ${message}`);
  checks += 1;
  console.log(`  ✓ ${message}`);
}

function loadAbi(name: string): unknown[] {
  const path = join(ROOT, "contracts", "target", "dev", `zicket_${name}.contract_class.json`);
  return JSON.parse(readFileSync(path, "utf8")).abi;
}

function loadDeployment() {
  const path = join(ROOT, "deployments", `${NETWORK}.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`Missing ${path}. Run \`pnpm chain:deploy\` first.`);
  }
}

async function send(account: Account, calls: Parameters<Account["execute"]>[0]) {
  const { transaction_hash } = await account.execute(calls);
  return account.waitForTransaction(transaction_hash);
}

async function main() {
  const provider: RpcProvider = getProvider();
  await assertNodeReachable(provider);

  const deployment = loadDeployment();
  const zicketAddress = deployment.contracts.ZicketEvents.address;
  const tokenAddress = deployment.contracts.PaymentToken.address;

  const { account: admin } = getDeployer(provider);
  const zicketAbi = loadAbi("ZicketEvents");
  const tokenAbi = loadAbi("MockERC20");

  const zicket = new Contract({ abi: zicketAbi, address: zicketAddress, providerOrAccount: provider });
  const token = new Contract({ abi: tokenAbi, address: tokenAddress, providerOrAccount: provider });

  console.log(`\nZicket e2e — ${NETWORK}`);
  console.log(`  zicket ${zicketAddress}`);
  console.log(`  token  ${tokenAddress}\n`);

  // ── 0. Poseidon parity ─────────────────────────────────────────────────────
  console.log("[0] commitment parity (JS ↔ Cairo)");
  const probe = generateTicketSecret();
  const onchainCommitment = BigInt(
    (await zicket.compute_commitment(probe.secret, probe.nullifier)) as bigint,
  );
  const onchainNullifierHash = BigInt(
    (await zicket.compute_nullifier_hash(probe.nullifier)) as bigint,
  );
  assert(
    onchainCommitment === BigInt(probe.commitment),
    "JS computeCommitment matches Cairo compute_commitment",
  );
  assert(
    onchainNullifierHash === BigInt(probe.nullifierHash),
    "JS computeNullifierHash matches Cairo compute_nullifier_hash",
  );

  // ── 1. Fund buyers ─────────────────────────────────────────────────────────
  console.log("\n[1] fund buyers");
  const buyers = await provisionBuyers(provider, 2);

  for (const buyer of buyers) {
    await send(admin, {
      contractAddress: tokenAddress,
      entrypoint: "mint",
      calldata: CallData.compile({ recipient: buyer.address, amount: cairo.uint256(FUNDING) }),
    });
  }
  const buyerBalance = BigInt((await token.balance_of(buyers[0].address)) as bigint);
  assert(buyerBalance >= FUNDING, `buyer funded with ${buyerBalance / 10n ** 18n} tokens`);

  // ── 2. Create the event ────────────────────────────────────────────────────
  console.log("\n[2] create event");
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - 60;
  const endTime = now + 86_400;

  await send(admin, {
    contractAddress: zicketAddress,
    entrypoint: "create_event",
    calldata: CallData.compile({
      metadata_hash: "0x5a49434b4554", // "ZICKET"
      price: cairo.uint256(PRICE),
      max_attendees: 100,
      start_time: startTime,
      end_time: endTime,
      anonymous_allowed: true,
    }),
  });

  const eventId = Number(BigInt((await zicket.events_count()) as bigint));
  assert(eventId >= 1, `event created with id ${eventId}`);

  const created = (await zicket.get_event(eventId)) as Record<string, bigint>;
  assert(BigInt(created.price) === PRICE, "on-chain price matches");
  assert(Number(created.max_attendees) === 100, "capacity is 100");

  // ── 3. Public purchase ─────────────────────────────────────────────────────
  console.log("\n[3] public ticket");
  await send(buyers[0], [
    {
      contractAddress: tokenAddress,
      entrypoint: "approve",
      calldata: CallData.compile({ spender: zicketAddress, amount: cairo.uint256(PRICE) }),
    },
    {
      contractAddress: zicketAddress,
      entrypoint: "buy_ticket",
      calldata: CallData.compile({ event_id: eventId }),
    },
  ]);

  const publicTicketId = Number(BigInt((await zicket.ticket_of(eventId, buyers[0].address)) as bigint));
  assert(publicTicketId >= 1, `public ticket #${publicTicketId} bound to buyer`);

  const publicTicket = (await zicket.get_ticket(publicTicketId)) as Record<string, unknown>;
  assert(
    BigInt(publicTicket.owner as bigint) === BigInt(buyers[0].address),
    "public ticket owner is the buyer",
  );
  assert(BigInt(publicTicket.paid as bigint) === PRICE, "public ticket recorded the price paid");

  // ── 4. Anonymous purchase (relayed) ────────────────────────────────────────
  console.log("\n[4] anonymous ticket");
  const secret = generateTicketSecret();
  assert(
    computeCommitment(secret.secret, secret.nullifier) === secret.commitment,
    "commitment is reproducible from the stored secret pair",
  );

  // buyers[1] pays, but the ticket is bound only to the commitment.
  await send(buyers[1], [
    {
      contractAddress: tokenAddress,
      entrypoint: "approve",
      calldata: CallData.compile({ spender: zicketAddress, amount: cairo.uint256(PRICE) }),
    },
    {
      contractAddress: zicketAddress,
      entrypoint: "buy_ticket_anonymous",
      calldata: CallData.compile({ event_id: eventId, commitment: secret.commitment }),
    },
  ]);

  const anonTicketId = Number(
    BigInt((await zicket.ticket_of_commitment(eventId, secret.commitment)) as bigint),
  );
  assert(anonTicketId >= 1, `anonymous ticket #${anonTicketId} indexed by commitment`);

  const anonTicket = (await zicket.get_ticket(anonTicketId)) as Record<string, unknown>;
  assert(
    BigInt(anonTicket.owner as bigint) === 0n,
    "anonymous ticket has no on-chain owner (payer is not the holder)",
  );
  assert(
    Number(BigInt((await zicket.ticket_of(eventId, buyers[1].address)) as bigint)) === 0,
    "payer address is not indexed against the anonymous ticket",
  );

  // ── 5. Check-in ────────────────────────────────────────────────────────────
  console.log("\n[5] check-in");
  await send(buyers[0], {
    contractAddress: zicketAddress,
    entrypoint: "check_in",
    calldata: CallData.compile({ ticket_id: publicTicketId }),
  });
  const checkedIn = (await zicket.get_ticket(publicTicketId)) as Record<string, unknown>;
  assert(Boolean(checkedIn.checked_in), "public ticket checked in");

  assert(
    !(await zicket.is_nullifier_used(eventId, secret.nullifierHash)),
    "nullifier unused before anonymous check-in",
  );

  // A third wallet that never touched the purchase redeems using only the secret.
  await send(admin, {
    contractAddress: zicketAddress,
    entrypoint: "check_in_anonymous",
    calldata: CallData.compile({
      event_id: eventId,
      secret: secret.secret,
      nullifier: secret.nullifier,
    }),
  });

  assert(
    Boolean(await zicket.is_nullifier_used(eventId, computeNullifierHash(secret.nullifier))),
    "nullifier burned after anonymous check-in (double entry blocked)",
  );

  const anonAfter = (await zicket.get_ticket(anonTicketId)) as Record<string, unknown>;
  assert(Boolean(anonAfter.checked_in), "anonymous ticket checked in by an unrelated wallet");

  // ── 6. Supply accounting ───────────────────────────────────────────────────
  console.log("\n[6] accounting");
  const finalEvent = (await zicket.get_event(eventId)) as Record<string, unknown>;
  assert(Number(finalEvent.tickets_sold as bigint) === 2, "tickets_sold is 2");
  assert(BigInt(finalEvent.escrow as bigint) === PRICE * 2n, "escrow holds both payments");
  assert(
    Number(BigInt((await zicket.tickets_remaining(eventId)) as bigint)) === 98,
    "98 tickets remaining",
  );

  console.log(`\n✓ ${checks} assertions passed — end-to-end flow verified on ${NETWORK}\n`);
}

main().catch((error) => {
  console.error(`\n✗ e2e failed: ${(error as Error).message}\n`);
  process.exit(1);
});
