import { boolean, integer, jsonb, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  source: varchar({ length: 64 }),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const newsItems = pgTable("news_items", {
  id: varchar({ length: 64 }).primaryKey(),
  image: text().notNull(),
  category: varchar({ length: 64 }).notNull(),
  date: varchar({ length: 64 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  content: text().notNull().default(""),
  authorName: varchar("author_name", { length: 128 }).notNull(),
  authorAvatar: text("author_avatar").notNull(),
});

export const tickets = pgTable("tickets", {
  id: varchar({ length: 64 }).primaryKey(),
  eventId: varchar("event_id", { length: 64 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  image: text().notNull(),
  noOfAttendees: integer("no_of_attendees").notNull().default(0),
  attendees: jsonb().notNull().default([]),
  eventDate: integer("event_date").notNull(),
  eventTimeInUtc: varchar("event_time_in_utc", { length: 64 }).notNull(),
  eventLocation: varchar("event_location", { length: 128 }).notNull(),
  anonymous: boolean().notNull().default(false),
  paid: boolean().notNull().default(false),
  priceInUsd: numeric("price_in_usd", { precision: 10, scale: 2 }).notNull(),
  eventVerified: boolean("event_verified").notNull().default(false),
});

