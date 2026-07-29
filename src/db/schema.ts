import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

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

  // ── On-chain linkage ──────────────────────────────────────────────────────
  // Null until the listing has been published to the ZicketEvents contract by
  // POST /api/chain/events/[id]/publish.
  onchainEventId: integer("onchain_event_id"),
  /** Poseidon commitment to the immutable listing fields (lib/starknet/metadata.ts). */
  metadataHash: varchar("metadata_hash", { length: 66 }),
  organizerAddress: varchar("organizer_address", { length: 66 }),
  publishTxHash: varchar("publish_tx_hash", { length: 66 }),
});

/**
 * A purchase recorded against the chain.
 *
 * Public purchases store the buyer address and the on-chain ticket id.
 * Anonymous purchases store *only* the commitment — never the secret, the
 * nullifier, or the payer. That is the whole point: the backend must not be
 * able to link an attendee to an event, so the row is deliberately unable to
 * identify anyone. The secret lives in the attendee's browser.
 */
export const ticketPurchases = pgTable(
  "ticket_purchases",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ticketId: varchar("ticket_id", { length: 64 })
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    onchainEventId: integer("onchain_event_id").notNull(),
    onchainTicketId: integer("onchain_ticket_id"),
    /** "public" | "anonymous" */
    mode: varchar({ length: 16 }).notNull().default("public"),
    /** Set for anonymous purchases only. */
    commitment: varchar({ length: 66 }),
    /** Set for public purchases only. */
    buyerAddress: varchar("buyer_address", { length: 66 }),
    txHash: varchar("tx_hash", { length: 66 }).notNull(),
    /** "pending" | "confirmed" | "failed" */
    status: varchar({ length: 16 }).notNull().default("pending"),
    /** Optional reminder address. Never collected for anonymous purchases. */
    email: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("ticket_purchases_tx_hash_idx").on(table.txHash),
    index("ticket_purchases_ticket_id_idx").on(table.ticketId),
    index("ticket_purchases_commitment_idx").on(table.commitment),
  ],
);


