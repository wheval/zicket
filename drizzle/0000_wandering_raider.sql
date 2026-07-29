CREATE TABLE "news_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"category" varchar(64) NOT NULL,
	"date" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"author_name" varchar(128) NOT NULL,
	"author_avatar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "newsletter_subscribers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"source" varchar(64),
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ticket_purchases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ticket_purchases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ticket_id" varchar(64) NOT NULL,
	"onchain_event_id" integer NOT NULL,
	"onchain_ticket_id" integer,
	"mode" varchar(16) DEFAULT 'public' NOT NULL,
	"commitment" varchar(66),
	"buyer_address" varchar(66),
	"tx_hash" varchar(66) NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"email" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"event_id" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"image" text NOT NULL,
	"no_of_attendees" integer DEFAULT 0 NOT NULL,
	"attendees" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"event_date" integer NOT NULL,
	"event_time_in_utc" varchar(64) NOT NULL,
	"event_location" varchar(128) NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"price_in_usd" numeric(10, 2) NOT NULL,
	"event_verified" boolean DEFAULT false NOT NULL,
	"onchain_event_id" integer,
	"metadata_hash" varchar(66),
	"organizer_address" varchar(66),
	"publish_tx_hash" varchar(66)
);
--> statement-breakpoint
ALTER TABLE "ticket_purchases" ADD CONSTRAINT "ticket_purchases_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_purchases_tx_hash_idx" ON "ticket_purchases" USING btree ("tx_hash");--> statement-breakpoint
CREATE INDEX "ticket_purchases_ticket_id_idx" ON "ticket_purchases" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_purchases_commitment_idx" ON "ticket_purchases" USING btree ("commitment");