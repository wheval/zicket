import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

import { sql } from "drizzle-orm";

import { getDb } from "../src/index";
import { newsItems, tickets } from "../lib/mock_data";
import { newsletterSubscribers, newsItems as newsItemsTable, tickets as ticketsTable } from "../src/db/schema";

async function seed() {
  const db = getDb();

  // News - upsert to update existing rows with new content
  for (const n of newsItems) {
    await db
      .insert(newsItemsTable)
      .values({
        id: n.id,
        image: n.image,
        category: n.category,
        date: n.date,
        title: n.title,
        description: n.description,
        content: n.content,
        authorName: n.author.name,
        authorAvatar: n.author.avatar,
      })
      .onConflictDoUpdate({
        target: newsItemsTable.id,
        set: {
          image: n.image,
          category: n.category,
          date: n.date,
          title: n.title,
          description: n.description,
          content: n.content,
          authorName: n.author.name,
          authorAvatar: n.author.avatar,
        },
      });
  }

  // Tickets
  if (tickets.length) {
    // The fixture dates are fixed points in the past. Rebasing them onto the
    // current date keeps every seeded event upcoming, which is what the
    // on-chain sale window requires — a listing whose window has closed cannot
    // be published or bought.
    const earliest = Math.min(...tickets.map((t) => t.event_date));
    const firstEventAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const shift = firstEventAt - earliest;

    await db
      .insert(ticketsTable)
      .values(
        tickets.map((t) => ({
          id: t.id,
          eventId: t.event_id,
          title: t.title,
          image: t.image,
          noOfAttendees: t.no_of_attendees,
          attendees: t.attendees,
          eventDate: t.event_date + shift,
          eventTimeInUtc: t.event_time_in_utc,
          eventLocation: t.event_location,
          anonymous: !!t.anonymous,
          paid: !!t.paid,
          priceInUsd: t.price_in_usd.toFixed(2),
          eventVerified: !!t.event_verified,
        }))
      )
      .onConflictDoUpdate({
        target: ticketsTable.id,
        set: { eventDate: sql`excluded.event_date` },
      });
  }

  // Newsletter: intentionally not seeded (real signups only)
  await db
    .select({ count: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .limit(1);

  console.log("✅ Seed complete");
}

seed().catch((err) => {
  console.error("❌ Seed failed", err);
  process.exit(1);
});

