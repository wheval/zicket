import "server-only";

/**
 * Server-side Starknet access.
 *
 * Holds the platform account used to publish listings on behalf of organizers
 * (a convenience so hosts don't need a funded wallet to list an event) and to
 * verify transactions submitted by users. The private key never leaves the
 * server — nothing in this module may be imported from a client component.
 */
import { Account, RpcProvider } from "starknet";

import { STARKNET_RPC_URL, ZICKET_CONTRACT_ADDRESS } from "@/lib/starknet/config";
import { getZicketContract, type OnchainEvent, readEvent } from "@/lib/starknet/zicket";

let cachedProvider: RpcProvider | undefined;
let cachedAdmin: Account | undefined;

export function getServerProvider(): RpcProvider {
  cachedProvider ??= new RpcProvider({
    nodeUrl: process.env.STARKNET_RPC_URL ?? STARKNET_RPC_URL,
  });
  return cachedProvider;
}

/** True when the server is able to submit transactions itself. */
export function hasAdminAccount(): boolean {
  return Boolean(
    process.env.STARKNET_ADMIN_ADDRESS && process.env.STARKNET_ADMIN_PRIVATE_KEY,
  );
}

export function getAdminAccount(): Account {
  if (cachedAdmin) return cachedAdmin;

  const address = process.env.STARKNET_ADMIN_ADDRESS;
  const privateKey = process.env.STARKNET_ADMIN_PRIVATE_KEY;
  if (!address || !privateKey) {
    throw new Error(
      "STARKNET_ADMIN_ADDRESS / STARKNET_ADMIN_PRIVATE_KEY are not set. " +
        "Run `pnpm chain:deploy` to populate .env.local.",
    );
  }

  cachedAdmin = new Account({
    provider: getServerProvider(),
    address,
    signer: privateKey,
  });
  return cachedAdmin;
}

export function getServerZicketContract(withAdmin = false) {
  return getZicketContract(withAdmin ? getAdminAccount() : getServerProvider());
}

export async function readEventFromServer(eventId: number): Promise<OnchainEvent> {
  return readEvent(eventId, getServerZicketContract());
}

export interface VerifiedPurchase {
  onchainTicketId: number;
  eventId: number;
  price: bigint;
  /** Present for public purchases. */
  buyer: string | null;
  /** Present for anonymous purchases. */
  commitment: string | null;
  mode: "public" | "anonymous";
}

const EVENT_PREFIX = "zicket::zicket_events::ZicketEvents::";

/**
 * Confirms a purchase actually happened on-chain before it is trusted in the
 * database. A client could otherwise POST an arbitrary tx hash; here the
 * receipt is accepted only if the transaction succeeded and our contract
 * emitted a purchase event in it.
 */
export async function verifyPurchaseTx(txHash: string): Promise<VerifiedPurchase | null> {
  const provider = getServerProvider();
  const receipt = await provider.waitForTransaction(txHash);
  if (!receipt.isSuccess()) return null;

  const zicketAddress = BigInt(ZICKET_CONTRACT_ADDRESS);
  const rawEvents =
    (receipt as unknown as { events?: { from_address: string }[] }).events ?? [];
  if (!rawEvents.some((event) => BigInt(event.from_address) === zicketAddress)) {
    return null;
  }

  const parsed = getServerZicketContract().parseEvents(receipt as never);

  for (const entry of parsed) {
    const anonymous = entry[`${EVENT_PREFIX}AnonymousTicketPurchased`] as
      | Record<string, bigint>
      | undefined;
    if (anonymous) {
      return {
        onchainTicketId: Number(anonymous.ticket_id),
        eventId: Number(anonymous.event_id),
        price: BigInt(anonymous.price),
        buyer: null,
        commitment: `0x${BigInt(anonymous.commitment).toString(16)}`,
        mode: "anonymous",
      };
    }

    const publicPurchase = entry[`${EVENT_PREFIX}TicketPurchased`] as
      | Record<string, bigint>
      | undefined;
    if (publicPurchase) {
      return {
        onchainTicketId: Number(publicPurchase.ticket_id),
        eventId: Number(publicPurchase.event_id),
        price: BigInt(publicPurchase.price),
        buyer: `0x${BigInt(publicPurchase.buyer).toString(16)}`,
        commitment: null,
        mode: "public",
      };
    }
  }

  return null;
}

/** Extracts the new event id from a `create_event` receipt. */
export async function eventIdFromReceipt(txHash: string): Promise<number | null> {
  const provider = getServerProvider();
  const receipt = await provider.waitForTransaction(txHash);
  if (!receipt.isSuccess()) return null;

  for (const entry of getServerZicketContract().parseEvents(receipt as never)) {
    const created = entry[`${EVENT_PREFIX}EventCreated`] as
      | Record<string, bigint>
      | undefined;
    if (created) return Number(created.event_id);
  }
  return null;
}
