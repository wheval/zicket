/**
 * Typed access to the deployed `ZicketEvents` contract.
 *
 * Read paths work with a plain RPC provider (no wallet required), so server
 * components and API routes can render on-chain state. Write paths are exposed
 * as `Call[]` builders that a connected wallet — or the server relayer in
 * `lib/starknet/server.ts` — submits.
 */
import { CallData, Contract, RpcProvider, cairo, type Call } from "starknet";

import mockErc20Abi from "@/lib/starknet/abis/mock-erc20.json";
import zicketAbi from "@/lib/starknet/abis/zicket-events.json";
import {
  PAYMENT_TOKEN_ADDRESS,
  STARKNET_RPC_URL,
  ZICKET_CONTRACT_ADDRESS,
} from "@/lib/starknet/config";

export type TicketModeName = "Public" | "Anonymous";

export interface OnchainEvent {
  eventId: number;
  organizer: string;
  metadataHash: string;
  price: bigint;
  maxAttendees: number;
  ticketsSold: number;
  startTime: number;
  endTime: number;
  anonymousAllowed: boolean;
  cancelled: boolean;
  escrow: bigint;
  withdrawn: boolean;
}

export interface OnchainTicket {
  ticketId: number;
  eventId: number;
  owner: string;
  commitment: string;
  mode: TicketModeName;
  paid: bigint;
  purchasedAt: number;
  checkedIn: boolean;
  refunded: boolean;
}

let cachedProvider: RpcProvider | undefined;

export function getProvider(): RpcProvider {
  cachedProvider ??= new RpcProvider({ nodeUrl: STARKNET_RPC_URL });
  return cachedProvider;
}

export function getZicketContract(providerOrAccount = getProvider()): Contract {
  if (!ZICKET_CONTRACT_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS is not set. Run `pnpm chain:deploy`.",
    );
  }
  return new Contract({
    abi: zicketAbi,
    address: ZICKET_CONTRACT_ADDRESS,
    providerOrAccount,
  });
}

export function getPaymentTokenContract(providerOrAccount = getProvider()): Contract {
  if (!PAYMENT_TOKEN_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS is not set. Run `pnpm chain:deploy`.",
    );
  }
  return new Contract({
    abi: mockErc20Abi,
    address: PAYMENT_TOKEN_ADDRESS,
    providerOrAccount,
  });
}

// ── normalisation ────────────────────────────────────────────────────────────

function toHex(value: unknown): string {
  return `0x${BigInt(value as string | bigint | number).toString(16)}`;
}

function toNumber(value: unknown): number {
  return Number(BigInt(value as string | bigint | number));
}

/**
 * starknet.js decodes a unit-only Cairo enum either as a `CairoCustomEnum`
 * (with `activeVariant()`) or as the raw variant index, depending on the parser
 * in play. Handle both so a starknet.js minor bump can't break check-in.
 */
function toTicketMode(value: unknown): TicketModeName {
  if (value && typeof (value as { activeVariant?: unknown }).activeVariant === "function") {
    return (value as { activeVariant: () => string }).activeVariant() as TicketModeName;
  }
  if (typeof value === "object" && value !== null) {
    if ("Anonymous" in value) return "Anonymous";
    if ("Public" in value) return "Public";
  }
  return toNumber(value) === 1 ? "Anonymous" : "Public";
}

export async function readEvent(
  eventId: number,
  contract = getZicketContract(),
): Promise<OnchainEvent> {
  const raw = (await contract.get_event(eventId)) as Record<string, unknown>;
  return {
    eventId,
    organizer: toHex(raw.organizer),
    metadataHash: toHex(raw.metadata_hash),
    price: BigInt(raw.price as bigint),
    maxAttendees: toNumber(raw.max_attendees),
    ticketsSold: toNumber(raw.tickets_sold),
    startTime: toNumber(raw.start_time),
    endTime: toNumber(raw.end_time),
    anonymousAllowed: Boolean(raw.anonymous_allowed),
    cancelled: Boolean(raw.cancelled),
    escrow: BigInt(raw.escrow as bigint),
    withdrawn: Boolean(raw.withdrawn),
  };
}

export async function readTicket(
  ticketId: number,
  contract = getZicketContract(),
): Promise<OnchainTicket> {
  const raw = (await contract.get_ticket(ticketId)) as Record<string, unknown>;
  return {
    ticketId,
    eventId: toNumber(raw.event_id),
    owner: toHex(raw.owner),
    commitment: toHex(raw.commitment),
    mode: toTicketMode(raw.mode),
    paid: BigInt(raw.paid as bigint),
    purchasedAt: toNumber(raw.purchased_at),
    checkedIn: Boolean(raw.checked_in),
    refunded: Boolean(raw.refunded),
  };
}

export async function ticketsRemaining(
  eventId: number,
  contract = getZicketContract(),
): Promise<number> {
  return toNumber(await contract.tickets_remaining(eventId));
}

export async function ticketOf(
  eventId: number,
  attendee: string,
  contract = getZicketContract(),
): Promise<number> {
  return toNumber(await contract.ticket_of(eventId, attendee));
}

export async function ticketOfCommitment(
  eventId: number,
  commitment: string,
  contract = getZicketContract(),
): Promise<number> {
  return toNumber(await contract.ticket_of_commitment(eventId, commitment));
}

export async function isNullifierUsed(
  eventId: number,
  nullifierHash: string,
  contract = getZicketContract(),
): Promise<boolean> {
  return Boolean(await contract.is_nullifier_used(eventId, nullifierHash));
}

export async function eventsCount(contract = getZicketContract()): Promise<number> {
  return toNumber(await contract.events_count());
}

// ── write-path call builders ─────────────────────────────────────────────────

/**
 * ERC20 `approve` for the exact ticket price. Skipped by callers when the event
 * is free, since the contract short-circuits the transfer in that case.
 */
export function buildApproveCall(amount: bigint): Call {
  return {
    contractAddress: PAYMENT_TOKEN_ADDRESS,
    entrypoint: "approve",
    calldata: CallData.compile({
      spender: ZICKET_CONTRACT_ADDRESS,
      amount: cairo.uint256(amount),
    }),
  };
}

export function buildBuyTicketCall(eventId: number): Call {
  return {
    contractAddress: ZICKET_CONTRACT_ADDRESS,
    entrypoint: "buy_ticket",
    calldata: CallData.compile({ event_id: eventId }),
  };
}

export function buildBuyTicketAnonymousCall(eventId: number, commitment: string): Call {
  return {
    contractAddress: ZICKET_CONTRACT_ADDRESS,
    entrypoint: "buy_ticket_anonymous",
    calldata: CallData.compile({ event_id: eventId, commitment }),
  };
}

/**
 * Full multicall for a purchase: approve (paid events only) followed by the
 * matching buy entrypoint. Starknet executes these atomically, so an approval
 * can never be left dangling.
 */
export function buildPurchaseCalls(params: {
  eventId: number;
  price: bigint;
  anonymous: boolean;
  commitment?: string;
}): Call[] {
  const { eventId, price, anonymous, commitment } = params;
  const calls: Call[] = [];

  if (price > 0n) calls.push(buildApproveCall(price));

  if (anonymous) {
    if (!commitment) throw new Error("An anonymous purchase requires a commitment.");
    calls.push(buildBuyTicketAnonymousCall(eventId, commitment));
  } else {
    calls.push(buildBuyTicketCall(eventId));
  }

  return calls;
}

export function buildCheckInCall(ticketId: number): Call {
  return {
    contractAddress: ZICKET_CONTRACT_ADDRESS,
    entrypoint: "check_in",
    calldata: CallData.compile({ ticket_id: ticketId }),
  };
}

export function buildCheckInAnonymousCall(
  eventId: number,
  secret: string,
  nullifier: string,
): Call {
  return {
    contractAddress: ZICKET_CONTRACT_ADDRESS,
    entrypoint: "check_in_anonymous",
    calldata: CallData.compile({ event_id: eventId, secret, nullifier }),
  };
}
