import "server-only";

import { desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/src";
import { tickets as ticketsTable, newsItems as newsItemsTable } from "@/src/db/schema";
import type { Ticket, NewsItem } from "@/lib/types";

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
