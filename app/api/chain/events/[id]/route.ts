import { NextResponse } from "next/server";

import { CallData, cairo } from "starknet";

import { getTicketById, markTicketPublished } from "@/lib/db/queries";
import {
  isPublishedToCurrentDeployment,
  usdToTokenUnits,
  ZICKET_CONTRACT_ADDRESS,
} from "@/lib/starknet/config";
import { metadataHashForTicket } from "@/lib/starknet/metadata";
import {
  eventIdFromReceipt,
  getAdminAccount,
  hasAdminAccount,
} from "@/lib/starknet/server";
import { readEvent } from "@/lib/starknet/zicket";

type Props = { params: Promise<{ id: string }> };

/** Sales stay open for a day past the listed start time. */
const SALE_WINDOW_SECONDS = 24 * 60 * 60;

/** On-chain state for a catalogue listing. */
export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;

  const ticket = await getTicketById(id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isPublishedToCurrentDeployment(ticket)) {
    return NextResponse.json({ published: false, ticketId: id });
  }

  try {
    const event = await readEvent(ticket.onchain_event_id);
    const now = Math.floor(Date.now() / 1000);
    const soldOut = event.ticketsSold >= event.maxAttendees;

    return NextResponse.json({
      published: true,
      ticketId: id,
      contract: ZICKET_CONTRACT_ADDRESS,
      event: {
        ...event,
        price: event.price.toString(),
        escrow: event.escrow.toString(),
      },
      // Mirrors the contract's own `_assert_sale_open` so the UI can disable
      // the buy button instead of letting the transaction revert.
      saleOpen: !event.cancelled && !soldOut && now < event.endTime,
      soldOut,
      ticketsRemaining: Math.max(event.maxAttendees - event.ticketsSold, 0),
      metadataMatches:
        ticket.metadata_hash != null &&
        BigInt(event.metadataHash) === BigInt(ticket.metadata_hash),
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to read chain state: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}

/**
 * Publishes the listing to the ZicketEvents contract.
 *
 * The platform account relays `create_event` so an organizer can list without
 * holding a funded wallet. Idempotent: a listing that already has an
 * `onchain_event_id` is returned untouched.
 */
export async function POST(_req: Request, { params }: Props) {
  const { id } = await params;

  if (!hasAdminAccount()) {
    return NextResponse.json(
      { error: "Server relayer is not configured. Run `pnpm chain:deploy`." },
      { status: 503 },
    );
  }

  const ticket = await getTicketById(id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isPublishedToCurrentDeployment(ticket)) {
    return NextResponse.json({
      published: true,
      alreadyPublished: true,
      onchainEventId: ticket.onchain_event_id,
    });
  }
  const price = ticket.paid ? usdToTokenUnits(ticket.price_in_usd) : 0n;
  const metadataHash = metadataHashForTicket(ticket);
  const startTime = ticket.event_date;
  const endTime = startTime + SALE_WINDOW_SECONDS;
  const capacity = Math.max(ticket.no_of_attendees * 2, 100);

  if (endTime <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json(
      { error: "This event has already taken place, so it cannot be listed on-chain." },
      { status: 409 },
    );
  }

  try {
    const admin = getAdminAccount();
    const { transaction_hash } = await admin.execute({
      contractAddress: ZICKET_CONTRACT_ADDRESS,
      entrypoint: "create_event",
      calldata: CallData.compile({
        metadata_hash: metadataHash,
        price: cairo.uint256(price),
        max_attendees: capacity,
        start_time: startTime,
        end_time: endTime,
        anonymous_allowed: Boolean(ticket.anonymous),
      }),
    });

    const onchainEventId = await eventIdFromReceipt(transaction_hash);
    if (!onchainEventId) {
      return NextResponse.json(
        { error: "create_event did not emit an EventCreated event" },
        { status: 502 },
      );
    }

    await markTicketPublished({
      ticketId: id,
      onchainEventId,
      onchainContractAddress: ZICKET_CONTRACT_ADDRESS,
      metadataHash,
      organizerAddress: admin.address,
      publishTxHash: transaction_hash,
    });

    return NextResponse.json({
      published: true,
      onchainEventId,
      metadataHash,
      txHash: transaction_hash,
      price: price.toString(),
      capacity,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Publish failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
