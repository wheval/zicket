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
    {
        id: "239",
        image: "/images/tickets/ticket_1.jpg",
        event_id: "23449",
        title: "Crypto Night",
        no_of_attendees: 450,
        attendees: [
            {
                name: "nina",
                walletAddress: "0x6789012345",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "carlos",
                walletAddress: "0x6789012346",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "luna",
                walletAddress: "0x6789012347",
                avatar_url: "/images/avatars/avatar_3.png"
            },
        ],
        event_date: 1761955200,
        event_time_in_utc: "8pm (UTC -08:00)",
        event_location: "San Francisco, USA",
        anonymous: false,
        paid: true,
        price_in_usd: 75,
        event_verified: true
    },
    {
        id: "240",
        image: "/images/tickets/ticket_2.jpg",
        event_id: "23450",
        title: "Design Workshop",
        no_of_attendees: 120,
        attendees: [
            {
                name: "olivia",
                walletAddress: "0x7890123456",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "noah",
                walletAddress: "0x7890123457",
                avatar_url: "/images/avatars/avatar_3.png"
            },
        ],
        event_date: 1764547200,
        event_time_in_utc: "11am (UTC +09:00)",
        event_location: "Tokyo, Japan",
        anonymous: true,
        paid: true,
        price_in_usd: 150,
        event_verified: false
    },
    {
        id: "241",
        image: "/images/tickets/ticket_3.jpg",
        event_id: "23451",
        title: "Startup Pitch Night",
        no_of_attendees: 320,
        attendees: [
            {
                name: "ethan",
                walletAddress: "0x8901234567",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "ava",
                walletAddress: "0x8901234568",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "mason",
                walletAddress: "0x8901234569",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "isabella",
                walletAddress: "0x8901234570",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1767139200,
        event_time_in_utc: "7pm (UTC +05:30)",
        event_location: "Mumbai, India",
        anonymous: false,
        paid: false,
        price_in_usd: 0,
        event_verified: true
    },
    {
        id: "242",
        image: "/images/tickets/ticket_4.jpg",
        event_id: "23452",
        title: "Gaming Tournament",
        no_of_attendees: 2500,
        attendees: [
            {
                name: "william",
                walletAddress: "0x9012345678",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "sophia",
                walletAddress: "0x9012345679",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "lucas",
                walletAddress: "0x9012345680",
                avatar_url: "/images/avatars/avatar_2.png"
            },
        ],
        event_date: 1769731200,
        event_time_in_utc: "3pm (UTC +10:00)",
        event_location: "Sydney, Australia",
        anonymous: true,
        paid: true,
        price_in_usd: 200,
        event_verified: true
    },
    {
        id: "243",
        image: "/images/tickets/ticket_5.jpg",
        event_id: "23453",
        title: "Food & Wine Festival",
        no_of_attendees: 800,
        attendees: [
            {
                name: "amelia",
                walletAddress: "0xa012345678",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "henry",
                walletAddress: "0xa012345679",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "charlotte",
                walletAddress: "0xa012345680",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1772323200,
        event_time_in_utc: "12pm (UTC +01:00)",
        event_location: "Paris, France",
        anonymous: false,
        paid: true,
        price_in_usd: 180,
        event_verified: true
    },
    {
        id: "244",
        image: "/images/tickets/ticket_1.jpg",
        event_id: "23454",
        title: "AI Innovation Summit",
        no_of_attendees: 1500,
        attendees: [
            {
                name: "benjamin",
                walletAddress: "0xb012345678",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "harper",
                walletAddress: "0xb012345679",
                avatar_url: "/images/avatars/avatar_2.png"
            },
            {
                name: "evelyn",
                walletAddress: "0xb012345680",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "daniel",
                walletAddress: "0xb012345681",
                avatar_url: "/images/avatars/avatar_1.png"
            },
            {
                name: "mia",
                walletAddress: "0xb012345682",
                avatar_url: "/images/avatars/avatar_2.png"
            },
        ],
        event_date: 1774915200,
        event_time_in_utc: "10am (UTC -07:00)",
        event_location: "Vancouver, Canada",
        anonymous: true,
        paid: true,
        price_in_usd: 350,
        event_verified: true
    },
    {
        id: "245",
        image: "/images/tickets/ticket_2.jpg",
        event_id: "23455",
        title: "Fitness Bootcamp",
        no_of_attendees: 95,
        attendees: [
            {
                name: "alexander",
                walletAddress: "0xc012345678",
                avatar_url: "/images/avatars/avatar_3.png"
            },
            {
                name: "emily",
                walletAddress: "0xc012345679",
                avatar_url: "/images/avatars/avatar_1.png"
            },
        ],
        event_date: 1777507200,
        event_time_in_utc: "6am (UTC +00:00)",
        event_location: "Dublin, Ireland",
        anonymous: false,
        paid: true,
        price_in_usd: 60,
        event_verified: false
    },
]