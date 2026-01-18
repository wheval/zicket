import { Ticket, NewsItem } from "./types";

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

export const newsItems: NewsItem[] = [
    {
        id: "1",
        image: "/images/news/news_1.jpg",
        category: "Tech",
        date: "03 June, 2025",
        title: "Zicket x Builders: A Hack Night Recap",
        description: "How the dev crowd used Zicket for a private demo series.",
        content: `Last month, we partnered with three developer collectives across Lagos, Berlin, and Singapore to run a series of private demo nights. The goal was simple: let builders experiment with privacy-first event ticketing in real-world conditions.

What emerged was fascinating. Teams used Zicket's anonymous attendance feature to create "blind feedback" sessions where presenters couldn't identify their critics. This led to more honest, constructive feedback than traditional demo days.

One team even built a reputation system on top of our ZK-proofs — attendees could prove they'd been to previous events without revealing which ones. The implications for professional networking are huge: imagine proving your expertise through attendance history without doxxing your interests.

We're now working with these communities to formalize the "Hack Night" format. If you're running a builder community and want to try privacy-first demos, reach out.`,
        author: {
            name: "ZKC Node",
            avatar: "/images/avatars/avatar_1.png",
        },
    },
    {
        id: "2",
        image: "/images/news/news_2.jpg",
        category: "Ecosystem",
        date: "10 June, 2025",
        title: "CircleDrop Format Explained",
        description: "Smaller, faster events for high-trust groups.",
        content: `CircleDrop is our new event format designed for intimate gatherings where trust is paramount. Unlike traditional ticketing where anyone with a link can register, CircleDrop events use invitation trees.

Here's how it works: An organizer creates an event and receives 5 invite tokens. Each attendee who claims a token gets 2 more to distribute. This creates organic, trust-based growth where everyone has skin in the game.

The privacy layer means organizers see attendance numbers but not individual identities unless attendees choose to reveal themselves. Perfect for sensitive discussions, recovery groups, or exclusive networking.

Early adopters are using CircleDrop for DAO governance discussions where participation matters more than identity, and for professional masterminds where members want to protect their competitive advantages.

We're seeing 94% show-up rates compared to 60% for traditional free events. When you personally invited someone, you're more likely to show up yourself.`,
        author: {
            name: "Indie Venue Club",
            avatar: "/images/avatars/avatar_2.png",
        },
    },
    {
        id: "3",
        image: "/images/news/news_3.jpg",
        category: "Behind the Scenes",
        date: "15 June, 2025",
        title: "Designing for Private Discovery",
        description: "Why our interface hides what doesn't matter.",
        content: `Most event platforms are designed around extraction — capturing as much user data as possible to optimize for engagement metrics. We took the opposite approach.

When we started designing Zicket's discovery interface, we asked: what's the minimum information someone needs to decide if an event is right for them? The answer was surprisingly small: topic, time, location, and vibe.

You'll notice we don't show attendee lists by default. We don't display "X people are interested" counters. We don't have social proof badges. These features exist to pressure users into decisions, not to help them make better ones.

Instead, we focused on rich event descriptions, clear privacy policies per event, and honest capacity indicators. Organizers can opt into transparency features if they want them, but the default is privacy-preserving.

The result? Higher-quality attendance. People come because they genuinely want to be there, not because their friends are going or because FOMO kicked in. Organizers report more engaged audiences and better post-event connections.

Privacy isn't just about hiding — it's about creating space for authentic participation.`,
        author: {
            name: "Studio Delta",
            avatar: "/images/avatars/avatar_3.png",
        },
    },
    {
        id: "4",
        image: "/images/news/news_1.jpg",
        category: "Product Updates",
        date: "20 June, 2025",
        title: "Anonymous Payments Now Live",
        description: "Pay for events without linking your wallet to your attendance.",
        content: `Today we're launching Anonymous Payments, powered by Aztec's shielded transactions. This is a game-changer for privacy-conscious attendees.

Previously, even with anonymous attendance, payment created a link between your wallet and the event. Anyone analyzing on-chain data could infer your interests, network, and activities. Not anymore.

With Anonymous Payments, your funds route through a privacy pool before reaching the organizer. The organizer receives payment confirmation without any wallet address. You get a ZK-proof ticket that proves payment without revealing payer identity.

Technical details for the curious: we're using Aztec's noir circuits for the proof generation, with a 30-second proving time on modern hardware. Mobile proving is coming Q4 2025.

This feature is opt-in and available for events where organizers enable it. Gas costs are slightly higher due to the privacy overhead, but we're subsidizing the difference during the beta period.

For high-risk attendees — activists, journalists, whistleblowers — this removes a critical vulnerability. For everyone else, it's just good privacy hygiene.`,
        author: {
            name: "ZKC Node",
            avatar: "/images/avatars/avatar_1.png",
        },
    },
    {
        id: "5",
        image: "/images/news/news_2.jpg",
        category: "Community",
        date: "25 June, 2025",
        title: "Zicket Community Grants Program",
        description: "Funding privacy-first event experiments worldwide.",
        content: `We're committing $100,000 to fund experimental event formats that push the boundaries of privacy-first gathering.

The Zicket Community Grants Program will fund 20 projects over the next year. We're looking for organizers who want to try something new: events that couldn't exist without privacy guarantees, formats that challenge conventional ticketing assumptions, communities that need protection.

Grant sizes range from $1,000 for small experiments to $15,000 for ambitious multi-event series. We're especially interested in proposals from underrepresented regions and marginalized communities.

What we're NOT looking for: traditional events that just want free marketing. If your event would work fine on Eventbrite, it's probably not a fit.

What excites us: anonymous professional networks, privacy-preserving cultural gatherings, experimental governance formats, cross-border community building, and anything that makes us say "wait, you can do that?"

Applications open July 1st. We'll announce the first cohort by August 15th. All grantees get technical support from our team and access to beta features.

Privacy is a collective project. Let's build it together.`,
        author: {
            name: "ZKC Node",
            avatar: "/images/avatars/avatar_1.png",
        },
    },
];
