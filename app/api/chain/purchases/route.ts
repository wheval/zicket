import { NextResponse } from "next/server";

import {
  getPurchasesForTicket,
  getTicketById,
  incrementAttendeeCount,
  recordPurchase,
} from "@/lib/db/queries";
import { isPublishedToCurrentDeployment } from "@/lib/starknet/config";
import { verifyPurchaseTx } from "@/lib/starknet/server";

/** `GET /api/chain/purchases?ticketId=…` — purchases recorded for a listing. */
export async function GET(req: Request) {
  const ticketId = new URL(req.url).searchParams.get("ticketId");
  if (!ticketId) {
    return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
  }

  return NextResponse.json({ items: await getPurchasesForTicket(ticketId) });
}

interface PurchaseBody {
  ticketId?: unknown;
  txHash?: unknown;
  mode?: unknown;
  commitment?: unknown;
  buyerAddress?: unknown;
  email?: unknown;
}

const TX_HASH_RE = /^0x[0-9a-fA-F]{1,64}$/;

/**
 * Records a purchase after verifying it on-chain.
 *
 * The client supplies only a transaction hash; every other field is taken from
 * the receipt, so a caller cannot fabricate a ticket. For anonymous purchases
 * the buyer address is discarded even if supplied — storing it would defeat the
 * entire point of the commitment scheme.
 */
export async function POST(req: Request) {
  let body: PurchaseBody;
  try {
    body = (await req.json()) as PurchaseBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ticketId = typeof body.ticketId === "string" ? body.ticketId.trim() : "";
  const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";

  if (!ticketId) {
    return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
  }
  if (!TX_HASH_RE.test(txHash)) {
    return NextResponse.json({ error: "A valid txHash is required" }, { status: 400 });
  }

  const ticket = await getTicketById(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "Unknown ticket" }, { status: 404 });
  }
  if (!isPublishedToCurrentDeployment(ticket)) {
    return NextResponse.json(
      { error: "This listing has not been published on-chain yet" },
      { status: 409 },
    );
  }

  let verified: Awaited<ReturnType<typeof verifyPurchaseTx>>;
  try {
    verified = await verifyPurchaseTx(txHash);
  } catch (error) {
    return NextResponse.json(
      { error: `Could not verify transaction: ${(error as Error).message}` },
      { status: 502 },
    );
  }

  if (!verified) {
    return NextResponse.json(
      { error: "Transaction did not produce a Zicket ticket purchase" },
      { status: 400 },
    );
  }

  if (verified.eventId !== ticket.onchain_event_id) {
    return NextResponse.json(
      { error: "Transaction belongs to a different event" },
      { status: 400 },
    );
  }

  const { purchase, created } = await recordPurchase({
    ticketId,
    onchainEventId: verified.eventId,
    onchainTicketId: verified.onchainTicketId,
    mode: verified.mode,
    commitment: verified.commitment,
    // Deliberately null for anonymous purchases.
    buyerAddress: verified.mode === "public" ? verified.buyer : null,
    txHash,
    status: "confirmed",
    email:
      verified.mode === "public" && typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : null,
  });

  // Only a first sighting of this transaction moves the counter; a client
  // retrying the same hash must not inflate the attendee total.
  if (created) {
    await incrementAttendeeCount(ticketId);
  }

  return NextResponse.json({ purchase, created }, { status: created ? 201 : 200 });
}
