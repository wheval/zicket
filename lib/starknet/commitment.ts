/**
 * Commitment helpers for anonymous tickets.
 *
 * Mirrors the Cairo implementation in `contracts/src/zicket_events.cairo`:
 *
 * ```cairo
 * commitment     = PoseidonTrait::new().update(secret).update(nullifier).finalize()
 * nullifier_hash = PoseidonTrait::new().update(nullifier).finalize()
 * ```
 *
 * `poseidonHashMany` is the JS equivalent of Cairo's `poseidon_hash_span`, which
 * is what `PoseidonTrait::finalize()` reduces to. `scripts/starknet/e2e.ts`
 * asserts these values against the deployed contract so the two never drift.
 *
 * Safe to import from both server and client code.
 */
import { poseidonHashMany } from "@scure/starknet";

/** Prime modulus of the STARK field. */
const STARK_PRIME = 2n ** 251n + 17n * 2n ** 192n + 1n;

export interface TicketSecret {
  /** Random felt known only to the attendee. */
  secret: string;
  /** Random felt burned at check-in to prevent double entry. */
  nullifier: string;
  /** `poseidon(secret, nullifier)` — the only value published on-chain. */
  commitment: string;
  /** `poseidon(nullifier)` — revealed at check-in. */
  nullifierHash: string;
}

function toBigInt(value: string | bigint): bigint {
  return typeof value === "bigint" ? value : BigInt(value);
}

function toHex(value: bigint): string {
  return `0x${value.toString(16)}`;
}

/** Cryptographically random field element, uniform enough for a 248-bit draw. */
export function randomFelt(): string {
  const bytes = new Uint8Array(31); // 248 bits — always below the STARK prime.
  crypto.getRandomValues(bytes);
  let acc = 0n;
  for (const byte of bytes) acc = (acc << 8n) | BigInt(byte);
  return toHex(acc % STARK_PRIME);
}

export function computeCommitment(
  secret: string | bigint,
  nullifier: string | bigint,
): string {
  return toHex(poseidonHashMany([toBigInt(secret), toBigInt(nullifier)]));
}

export function computeNullifierHash(nullifier: string | bigint): string {
  return toHex(poseidonHashMany([toBigInt(nullifier)]));
}

/** Generates a fresh anonymous-ticket secret bundle. */
export function generateTicketSecret(): TicketSecret {
  const secret = randomFelt();
  const nullifier = randomFelt();
  return {
    secret,
    nullifier,
    commitment: computeCommitment(secret, nullifier),
    nullifierHash: computeNullifierHash(nullifier),
  };
}

/** Re-derives the public values from a stored secret pair. */
export function deriveTicketSecret(secret: string, nullifier: string): TicketSecret {
  return {
    secret,
    nullifier,
    commitment: computeCommitment(secret, nullifier),
    nullifierHash: computeNullifierHash(nullifier),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Local persistence
//
// The secret is the ticket. It is deliberately never sent to the Zicket backend
// for anonymous purchases — losing it means losing the ticket, which is the
// trade-off that makes the ticket unlinkable to an account.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "zicket:ticket-secrets";

export interface StoredTicketSecret extends TicketSecret {
  eventId: string;
  onchainEventId: number;
  txHash?: string;
  createdAt: number;
}

export function loadStoredSecrets(): StoredTicketSecret[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredTicketSecret[]) : [];
  } catch {
    return [];
  }
}

export function storeTicketSecret(entry: StoredTicketSecret): void {
  if (typeof window === "undefined") return;
  const existing = loadStoredSecrets().filter(
    (item) => item.commitment !== entry.commitment,
  );
  existing.push(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function findStoredSecret(commitment: string): StoredTicketSecret | undefined {
  const target = BigInt(commitment);
  return loadStoredSecrets().find((item) => BigInt(item.commitment) === target);
}
