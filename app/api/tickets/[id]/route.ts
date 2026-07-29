import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { getDb } from "@/src";
import { tickets as ticketsTable } from "@/src/db/schema";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const db = getDb();
  const rows = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.id, id))
    .limit(1);
  const item = rows[0];

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      id: item.id,
      image: item.image,
      event_id: item.eventId,
      title: item.title,
      no_of_attendees: item.noOfAttendees,
      attendees: item.attendees,
      event_date: item.eventDate,
      event_time_in_utc: item.eventTimeInUtc,
      event_location: item.eventLocation,
      anonymous: item.anonymous,
      paid: item.paid,
      price_in_usd: Number(item.priceInUsd),
      event_verified: item.eventVerified,
      onchain_event_id: item.onchainEventId,
      metadata_hash: item.metadataHash,
      organizer_address: item.organizerAddress,
    },
  });
}

