"use client";

/**
 * Drives a ticket purchase from the browser: resolves the on-chain listing,
 * builds the approve + buy multicall, submits it through the connected wallet,
 * and records the confirmed purchase against the backend.
 */
import { useCallback, useState } from "react";

import { RpcProvider } from "starknet";

import { useWallet } from "@/components/web/wallet-provider";
import {
  generateTicketSecret,
  storeTicketSecret,
  type TicketSecret,
} from "@/lib/starknet/commitment";
import { STARKNET_RPC_URL } from "@/lib/starknet/config";
import { buildPurchaseCalls } from "@/lib/starknet/zicket";
import type { Ticket } from "@/lib/types";

export type PurchaseStage =
  | "idle"
  | "preparing"
  | "awaiting-signature"
  | "confirming"
  | "recording"
  | "done"
  | "error";

export interface PurchaseResult {
  txHash: string;
  mode: "public" | "anonymous";
  /** Only present for anonymous purchases — this is the attendee's ticket. */
  secret?: TicketSecret;
}

interface ChainEventResponse {
  published: boolean;
  event?: { price: string; cancelled: boolean; anonymousAllowed: boolean };
  onchainEventId?: number;
  saleOpen?: boolean;
  soldOut?: boolean;
  error?: string;
}

/** Resolves the on-chain listing, publishing it on first purchase if needed. */
async function resolveOnchainEvent(
  ticket: Ticket,
): Promise<{ eventId: number; price: bigint }> {
  const read = async (): Promise<ChainEventResponse> => {
    const response = await fetch(`/api/chain/events/${ticket.id}`);
    return (await response.json()) as ChainEventResponse;
  };

  let state = await read();

  if (!state.published) {
    const publish = await fetch(`/api/chain/events/${ticket.id}`, { method: "POST" });
    const body = (await publish.json()) as { error?: string };
    if (!publish.ok) {
      throw new Error(body.error ?? "This event is not available on-chain yet.");
    }
    state = await read();
  }

  if (!state.published || !state.event) {
    throw new Error(state.error ?? "This event is not available on-chain yet.");
  }
  if (state.event.cancelled) {
    throw new Error("This event has been cancelled.");
  }
  if (state.soldOut) {
    throw new Error("This event is sold out.");
  }
  if (state.saleOpen === false) {
    throw new Error("Ticket sales for this event have closed.");
  }

  const eventId = state.onchainEventId ?? ticket.onchain_event_id;
  if (!eventId) throw new Error("Missing on-chain event id.");

  return { eventId, price: BigInt(state.event.price) };
}

export function useTicketPurchase(ticket: Ticket) {
  const { account, status } = useWallet();
  const [stage, setStage] = useState<PurchaseStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResult | null>(null);

  const purchase = useCallback(
    async (options?: { email?: string }) => {
      if (!account || status !== "connected") {
        setError("Connect a Starknet wallet to continue.");
        setStage("error");
        return;
      }

      setError(null);
      setResult(null);
      setStage("preparing");

      const anonymous = Boolean(ticket.anonymous);
      let secret: TicketSecret | undefined;

      try {
        const { eventId, price } = await resolveOnchainEvent(ticket);

        if (anonymous) {
          secret = generateTicketSecret();
          // Persisted *before* the transaction: if the tab dies between signing
          // and confirmation the attendee can still redeem, because the secret
          // is the only thing that proves ownership and it exists nowhere else.
          storeTicketSecret({
            ...secret,
            eventId: ticket.id,
            onchainEventId: eventId,
            createdAt: Date.now(),
          });
        }

        const calls = buildPurchaseCalls({
          eventId,
          price,
          anonymous,
          commitment: secret?.commitment,
        });

        setStage("awaiting-signature");
        const { transaction_hash: txHash } = await account.execute(calls);

        setStage("confirming");
        const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });
        await provider.waitForTransaction(txHash);

        if (secret) {
          storeTicketSecret({
            ...secret,
            eventId: ticket.id,
            onchainEventId: eventId,
            txHash,
            createdAt: Date.now(),
          });
        }

        setStage("recording");
        const record = await fetch("/api/chain/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: ticket.id,
            txHash,
            // An email is only ever attached to a non-anonymous purchase.
            email: anonymous ? undefined : options?.email,
          }),
        });

        if (!record.ok) {
          const body = (await record.json()) as { error?: string };
          throw new Error(body.error ?? "The purchase could not be recorded.");
        }

        setResult({ txHash, mode: anonymous ? "anonymous" : "public", secret });
        setStage("done");
      } catch (cause) {
        const message = (cause as Error).message ?? "The purchase failed.";
        setError(
          secret
            ? `${message} Your ticket secret was saved in this browser and can still be redeemed if the transaction succeeded.`
            : message,
        );
        setStage("error");
      }
    },
    [account, status, ticket],
  );

  return { purchase, stage, error, result, isBusy: stage !== "idle" && stage !== "done" && stage !== "error" };
}
