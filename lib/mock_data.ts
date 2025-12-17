import { Ticket } from "./types";

export const tickets: Ticket[] = [
    {
        id: "234",
        image: "/images/tickets/ticket_1.jpg",
        event_id: "23444",
        title: "Zlatan in Lagos",
        no_of_attendees: 143,
        attendees: [
            {
                name: "tunde",
                walletAddress: "0x1238900001",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "ade",
                walletAddress: "0x1238900002",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "bola",
                walletAddress: "0x1238900003",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "chidi",
                walletAddress: "0x1238900004",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1748995200,
        event_time_in_utc: "4pm (UTC +01:00)",
        event_location: "Lagos, Nigeria",
        anonymous: true,
        paid: true,
        price_in_usd: 100,
        event_verified: true
    },
    {
        id: "235",
        image: "/images/tickets/ticket_2.jpg",
        event_id: "23445",
        title: "Tech Summit 2025",
        no_of_attendees: 256,
        attendees: [
            {
                name: "john",
                walletAddress: "0x2345678901",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "sarah",
                walletAddress: "0x2345678902",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "mike",
                walletAddress: "0x2345678903",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1751587200,
        event_time_in_utc: "10am (UTC +00:00)",
        event_location: "London, UK",
        anonymous: false,
        paid: true,
        price_in_usd: 250,
        event_verified: true
    },
    {
        id: "236",
        image: "/images/tickets/ticket_3.jpg",
        event_id: "23446",
        title: "Music Festival",
        no_of_attendees: 5000,
        attendees: [
            {
                name: "alex",
                walletAddress: "0x3456789012",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "emma",
                walletAddress: "0x3456789013",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "david",
                walletAddress: "0x3456789014",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "lisa",
                walletAddress: "0x3456789015",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "tom",
                walletAddress: "0x3456789016",
                avatar_url: "/images/avatars/avatar_2.png"
            },
        ],
        event_date: 1754179200,
        event_time_in_utc: "6pm (UTC -05:00)",
        event_location: "New York, USA",
        anonymous: true,
        paid: false,
        price_in_usd: 0,
        event_verified: true
    },
    {
        id: "237",
        image: "/images/tickets/ticket_4.jpg",
        event_id: "23447",
        title: "Art Exhibition",
        no_of_attendees: 89,
        attendees: [
            {
                name: "maria",
                walletAddress: "0x4567890123",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "peter",
                walletAddress: "0x4567890124",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1756771200,
        event_time_in_utc: "2pm (UTC +02:00)",
        event_location: "Berlin, Germany",
        anonymous: false,
        paid: true,
        price_in_usd: 50,
        event_verified: false
    },
    {
        id: "238",
        image: "/images/tickets/ticket_5.jpg",
        event_id: "23448",
        title: "Blockchain Conference",
        no_of_attendees: 1200,
        attendees: [
            {
                name: "ryan",
                walletAddress: "0x5678901234",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "sophia",
                walletAddress: "0x5678901235",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "james",
                walletAddress: "0x5678901236",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1759363200,
        event_time_in_utc: "9am (UTC +08:00)",
        event_location: "Singapore",
        anonymous: true,
        paid: true,
        price_in_usd: 300,
        event_verified: true
    },
]