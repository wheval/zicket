import { NextResponse } from "next/server";

import { eq } from "drizzle-orm";

import { getDb } from "@/src";
import { newsletterSubscribers } from "@/src/db/schema";
import { isValidEmail } from "@/lib/server/validators";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const rawEmail = typeof b.email === "string" ? b.email : undefined;
  const email = rawEmail ? rawEmail.trim().toLowerCase() : undefined;
  const source = typeof b.source === "string" ? b.source.trim().slice(0, 64) : undefined;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const db = getDb();

  const exists = await db
    .select({ email: newsletterSubscribers.email })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (exists.length === 0) {
    await db.insert(newsletterSubscribers).values({ email, source });
  }

  return NextResponse.json({
    ok: true,
    status: exists.length ? "already_subscribed" : "subscribed",
  });
}

