import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

export interface Ticket {
    id: string,
    event_id: string,
    title: string,
    image: string,
    no_of_attendees: number,
    attendees: Attendee[],
    event_date: Timestamp,
    event_time_in_utc: string,
    event_location: string,
    anonymous?: boolean,
    paid?: boolean,
    price_in_usd: number,
    event_verified?: boolean
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