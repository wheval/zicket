import "dotenv/config";

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
          eventDate: t.event_date,
          eventTimeInUtc: t.event_time_in_utc,
          eventLocation: t.event_location,
          anonymous: !!t.anonymous,
          paid: !!t.paid,
          priceInUsd: t.price_in_usd.toFixed(2),
          eventVerified: !!t.event_verified,
        }))
      )
      .onConflictDoNothing();
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

