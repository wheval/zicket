import "server-only";

import { desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/src";
import {
  tickets as ticketsTable,
  newsItems as newsItemsTable,
  ticketPurchases as ticketPurchasesTable,
} from "@/src/db/schema";
import type { NewsItem, PurchaseMode, Ticket, TicketPurchase } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Ticket Mappers & Queries
// ─────────────────────────────────────────────────────────────────────────────

function mapRowToTicket(row: typeof ticketsTable.$inferSelect): Ticket {
  return {
    id: row.id,
    event_id: row.eventId,
    title: row.title,
    image: row.image,
    no_of_attendees: row.noOfAttendees,
    attendees: (row.attendees ?? []) as Ticket["attendees"],
    event_date: row.eventDate,
    event_time_in_utc: row.eventTimeInUtc,
    event_location: row.eventLocation,
    anonymous: row.anonymous,
    paid: row.paid,
    price_in_usd: Number(row.priceInUsd),
    event_verified: row.eventVerified,
    onchain_event_id: row.onchainEventId,
    onchain_contract_address: row.onchainContractAddress,
    metadata_hash: row.metadataHash,
    organizer_address: row.organizerAddress,
    publish_tx_hash: row.publishTxHash,
  };
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, id))
    .limit(1);
  return rows[0] ? mapRowToTicket(rows[0]) : null;
}

export async function getTickets(options?: {
  limit?: number;
  offset?: number;
  orderByPopularity?: boolean;
}): Promise<Ticket[]> {
  const { limit = 50, offset = 0, orderByPopularity = true } = options ?? {};
  const db = getDb();
  const rows = await db
    .select()
    .from(ticketsTable)
    .orderBy(orderByPopularity ? desc(ticketsTable.noOfAttendees) : desc(ticketsTable.eventDate))
    .limit(limit)
    .offset(offset);
  return rows.map(mapRowToTicket);
}

export async function getRelatedTickets(excludeId: string, limit = 4): Promise<Ticket[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(ticketsTable)
    .where(ne(ticketsTable.id, excludeId))
    .orderBy(desc(ticketsTable.noOfAttendees))
    .limit(limit);
  return rows.map(mapRowToTicket);
}

// ─────────────────────────────────────────────────────────────────────────────
// News Mappers & Queries
// ─────────────────────────────────────────────────────────────────────────────

function mapRowToNewsItem(row: typeof newsItemsTable.$inferSelect): NewsItem {
  return {
    id: row.id,
    image: row.image,
    category: row.category,
    date: row.date,
    title: row.title,
    description: row.description,
    content: row.content,
    author: {
      name: row.authorName,
      avatar: row.authorAvatar,
    },
  };
}

export async function getNewsItemById(id: string): Promise<NewsItem | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(newsItemsTable)
    .where(eq(newsItemsTable.id, id))
    .limit(1);
  return rows[0] ? mapRowToNewsItem(rows[0]) : null;
}

export async function getNewsItems(options?: {
  limit?: number;
  offset?: number;
}): Promise<NewsItem[]> {
  const { limit = 50, offset = 0 } = options ?? {};
  const db = getDb();
  const rows = await db
    .select()
    .from(newsItemsTable)
    .orderBy(desc(newsItemsTable.id))
    .limit(limit)
    .offset(offset);
  return rows.map(mapRowToNewsItem);
}

export async function getRelatedNews(excludeId: string, limit = 3): Promise<NewsItem[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(newsItemsTable)
    .where(ne(newsItemsTable.id, excludeId))
    .orderBy(desc(newsItemsTable.id))
    .limit(limit);
  return rows.map(mapRowToNewsItem);
}

// ─────────────────────────────────────────────────────────────────────────────
// On-chain Linkage
// ─────────────────────────────────────────────────────────────────────────────

/** Records the ZicketEvents event id assigned to a listing when it is published. */
export async function markTicketPublished(params: {
  ticketId: string;
  onchainEventId: number;
  onchainContractAddress: string;
  metadataHash: string;
  organizerAddress: string;
  publishTxHash: string;
}): Promise<Ticket | null> {
  const db = getDb();
  const rows = await db
    .update(ticketsTable)
    .set({
      onchainEventId: params.onchainEventId,
      onchainContractAddress: params.onchainContractAddress,
      metadataHash: params.metadataHash,
      organizerAddress: params.organizerAddress,
      publishTxHash: params.publishTxHash,
    })
    .where(eq(ticketsTable.id, params.ticketId))
    .returning();
  return rows[0] ? mapRowToTicket(rows[0]) : null;
}

function mapRowToPurchase(
  row: typeof ticketPurchasesTable.$inferSelect,
): TicketPurchase {
  return {
    id: row.id,
    ticket_id: row.ticketId,
    onchain_event_id: row.onchainEventId,
    onchain_ticket_id: row.onchainTicketId,
    mode: row.mode as TicketPurchase["mode"],
    commitment: row.commitment,
    buyer_address: row.buyerAddress,
    tx_hash: row.txHash,
    status: row.status as TicketPurchase["status"],
    created_at: row.createdAt,
  };
}

/**
 * Records a purchase. Idempotent on `tx_hash` so a client retry — or the user
 * refreshing mid-confirmation — cannot create duplicate rows.
 */
/**
 * Records a purchase, keyed on the transaction hash.
 *
 * Returns `created: false` when the hash had already been recorded, so callers
 * can avoid re-applying side effects (such as bumping the attendee count) when
 * a client retries.
 */
export async function recordPurchase(params: {
  ticketId: string;
  onchainEventId: number;
  onchainTicketId?: number | null;
  mode: PurchaseMode;
  commitment?: string | null;
  buyerAddress?: string | null;
  txHash: string;
  status?: "pending" | "confirmed" | "failed";
  email?: string | null;
}): Promise<{ purchase: TicketPurchase; created: boolean }> {
  const db = getDb();
  const existing = await db
    .select()
    .from(ticketPurchasesTable)
    .where(eq(ticketPurchasesTable.txHash, params.txHash))
    .limit(1);

  const rows = await db
    .insert(ticketPurchasesTable)
    .values({
      ticketId: params.ticketId,
      onchainEventId: params.onchainEventId,
      onchainTicketId: params.onchainTicketId ?? null,
      mode: params.mode,
      commitment: params.commitment ?? null,
      buyerAddress: params.buyerAddress ?? null,
      txHash: params.txHash,
      status: params.status ?? "pending",
      email: params.email ?? null,
    })
    .onConflictDoUpdate({
      target: ticketPurchasesTable.txHash,
      set: {
        onchainTicketId: params.onchainTicketId ?? null,
        status: params.status ?? "pending",
      },
    })
    .returning();

  return { purchase: mapRowToPurchase(rows[0]), created: existing.length === 0 };
}

export async function updatePurchaseStatus(params: {
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  onchainTicketId?: number | null;
}): Promise<TicketPurchase | null> {
  const db = getDb();
  const rows = await db
    .update(ticketPurchasesTable)
    .set({
      status: params.status,
      ...(params.onchainTicketId != null
        ? { onchainTicketId: params.onchainTicketId }
        : {}),
    })
    .where(eq(ticketPurchasesTable.txHash, params.txHash))
    .returning();
  return rows[0] ? mapRowToPurchase(rows[0]) : null;
}

export async function getPurchasesForTicket(ticketId: string): Promise<TicketPurchase[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(ticketPurchasesTable)
    .where(eq(ticketPurchasesTable.ticketId, ticketId))
    .orderBy(desc(ticketPurchasesTable.createdAt));
  return rows.map(mapRowToPurchase);
}

/** Bumps the cached attendee counter shown in the UI. */
export async function incrementAttendeeCount(ticketId: string): Promise<void> {
  const db = getDb();
  await db
    .update(ticketsTable)
    .set({ noOfAttendees: sql`${ticketsTable.noOfAttendees} + 1` })
    .where(eq(ticketsTable.id, ticketId));
}
