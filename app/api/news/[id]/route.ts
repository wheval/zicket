import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { getDb } from "@/src";
import { newsItems as newsItemsTable } from "@/src/db/schema";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const db = getDb();
  const rows = await db
    .select()
    .from(newsItemsTable)
    .where(eq(newsItemsTable.id, id))
    .limit(1);
  const item = rows[0];

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      id: item.id,
      image: item.image,
      category: item.category,
      date: item.date,
      title: item.title,
      description: item.description,
      author: { name: item.authorName, avatar: item.authorAvatar },
    },
  });
}

