export interface Ticket {
    id: string,
    event_id: string,
    title: string,
    image: string,
    no_of_attendees: number,
    attendees: Attendee[],
    event_date: number,
    event_time_in_utc: string,
    event_location: string,
    anonymous?: boolean,
    paid?: boolean,
    price_in_usd: number,
    event_verified?: boolean,
    /** Id of this listing inside the ZicketEvents contract; null until published. */
    onchain_event_id?: number | null,
    /** The ZicketEvents deployment `onchain_event_id` was issued by. */
    onchain_contract_address?: string | null,
    /** Poseidon commitment to the listing metadata, as published on-chain. */
    metadata_hash?: string | null,
    organizer_address?: string | null,
    publish_tx_hash?: string | null
}

export type PurchaseMode = "public" | "anonymous";

export interface TicketPurchase {
    id: number,
    ticket_id: string,
    onchain_event_id: number,
    onchain_ticket_id: number | null,
    mode: PurchaseMode,
    commitment: string | null,
    buyer_address: string | null,
    tx_hash: string,
    status: "pending" | "confirmed" | "failed",
    created_at: string
}

export interface Attendee {
    name: string,
    walletAddress: WalletAddress,
    avatar_url: string,
}

export interface Event {
    id: string,
    title: string
}

export type WalletAddress = `0x${string}`;

export interface NewsItem {
  id: string;
  image: string;
  category: string;
  date: string;
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
}