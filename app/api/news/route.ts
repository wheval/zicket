import { NextResponse } from "next/server";

import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/src";
import { newsItems as newsItemsTable } from "@/src/db/schema";

function toApiNewsItem(row: typeof newsItemsTable.$inferSelect) {
  return {
    id: row.id,
    image: row.image,
    category: row.category,
    date: row.date,
    title: row.title,
    description: row.description,
    author: {
      name: row.authorName,
      avatar: row.authorAvatar,
    },
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20), 1), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const category = (url.searchParams.get("category") ?? "").trim();

  const db = getDb();
  const whereClause = category ? eq(newsItemsTable.category, category) : undefined;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(newsItemsTable)
    .where(whereClause);

  const rows = await db
    .select()
    .from(newsItemsTable)
    .where(whereClause)
    .orderBy(desc(newsItemsTable.id))
    .limit(limit)
    .offset(offset);

  const items = rows.map(toApiNewsItem);

  return NextResponse.json({
    items,
    total: countRow?.count ?? 0,
    limit,
    offset,
  });
}

