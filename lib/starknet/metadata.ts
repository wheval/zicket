/**
 * Deterministic commitment to an event's off-chain metadata.
 *
 * The Zicket catalogue lives in Postgres, but the contract stores a
 * `metadata_hash` so anyone can verify the listing they are shown matches what
 * the organizer published on-chain. The hash is computed over a canonical
 * serialization, so the same ticket row always produces the same felt.
 */
import { poseidonHashMany } from "@scure/starknet";

import type { Ticket } from "@/lib/types";

/** Fields that are covered by the on-chain commitment. */
export interface MetadataInput {
  id: string;
  title: string;
  event_location: string;
  event_date: number;
  event_time_in_utc: string;
  image: string;
}

/**
 * Splits UTF-8 bytes into 31-byte chunks (the largest that always fits in a
 * felt252) and Poseidon-hashes the resulting span.
 */
function hashUtf8(value: string): bigint {
  const bytes = new TextEncoder().encode(value);
  const felts: bigint[] = [];

  for (let offset = 0; offset < bytes.length; offset += 31) {
    const chunk = bytes.subarray(offset, offset + 31);
    let acc = 0n;
    for (const byte of chunk) acc = (acc << 8n) | BigInt(byte);
    felts.push(acc);
  }

  // Bind the length so "ab"+"c" and "a"+"bc" can never collide.
  felts.push(BigInt(bytes.length));
  return poseidonHashMany(felts);
}

export function computeMetadataHash(input: MetadataInput): string {
  const canonical = JSON.stringify({
    id: input.id,
    title: input.title,
    location: input.event_location,
    date: input.event_date,
    time: input.event_time_in_utc,
    image: input.image,
  });
  return `0x${hashUtf8(canonical).toString(16)}`;
}

export function metadataHashForTicket(ticket: Ticket): string {
  return computeMetadataHash({
    id: ticket.id,
    title: ticket.title,
    event_location: ticket.event_location,
    event_date: ticket.event_date,
    event_time_in_utc: ticket.event_time_in_utc,
    image: ticket.image,
  });
}
