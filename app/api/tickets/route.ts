import { NextResponse } from "next/server";

import { desc, sql } from "drizzle-orm";

import { getDb } from "@/src";
import { tickets as ticketsTable } from "@/src/db/schema";

function toApiTicket(row: typeof ticketsTable.$inferSelect) {
  return {
    id: row.id,
    image: row.image,
    event_id: row.eventId,
    title: row.title,
    no_of_attendees: row.noOfAttendees,
    attendees: row.attendees,
    event_date: row.eventDate,
    event_time_in_utc: row.eventTimeInUtc,
    event_location: row.eventLocation,
    anonymous: row.anonymous,
    paid: row.paid,
    price_in_usd: Number(row.priceInUsd),
    event_verified: row.eventVerified,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20), 1), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

  const db = getDb();

  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(ticketsTable);

  const rows = await db
    .select()
    .from(ticketsTable)
    .orderBy(desc(ticketsTable.noOfAttendees))
    .limit(limit)
    .offset(offset);
  const items = rows.map(toApiTicket);

  return NextResponse.json({
    items,
    total: countRow?.count ?? 0,
    limit,
    offset,
  });
}

