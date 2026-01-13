import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { TicketPurchaseCard } from "@/components/web/ticket-purchase-card";
import TicketCard from "@/components/web/ticket";
import { Badge } from "@/components/ui/badge";
import { tickets } from "@/lib/mock_data";
import { formatDate } from "@/lib/utils";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const ticket = tickets.find((t) => t.id === id);

    return {
        title: ticket?.title ? `${ticket.title}` : `Ticket #${id}`,
        description: ticket?.title
            ? `Details for ${ticket.title} on Zicket.`
            : `Details for ticket ${id} on Zicket.`,
    };
}

export default async function TicketDetailPage({ params }: Props) {
    const { id } = await params;
    const ticket = tickets.find((t) => t.id === id) ?? tickets[0];

    const isFree = !ticket.paid || ticket.price_in_usd === 0;
    const priceLabel = isFree ? "FREE" : `$${ticket.price_in_usd.toFixed(2)}`;

    const tags = [
        ticket.anonymous ? "#Anonymous-Friendly" : "#Verified-Access",
        isFree ? "#FreeEntry" : "#PaidEntry",
        ticket.event_location?.toLowerCase().includes("virtual") ? "#Virtual" : "#Outdoor",
    ];

    const related = tickets.filter((t) => t.id !== ticket.id).slice(0, 4);

    return (
        <main className="min-h-screen bg-[#FCFDFD] pt-30 lg:pt-40 2xl:pt-48 pb-20">
            <div className="container mx-auto font-inter px-4 lg:px-8 xl:px-12">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#2C0A4A] font-medium mb-8">
                    <Link href="/explore" className="hover:text-[#6917AF] transition-colors">
                        Explore
                    </Link>
                    <span className="text-[#98A2B3] font-bold">/</span>
                    <span className="text-[#667185]">Events</span>
                    <span className="text-[#98A2B3] font-bold">/</span>
                    <span className="truncate max-w-[260px] sm:max-w-[420px] text-[#667185]">
                        {ticket.title ?? `Ticket #${id}`}
                    </span>
                </div>

                {/* Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left: image */}
                    <div className="w-full">
                        <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-black/5 border border-[#E4E4E4]">
                            <Image
                                src={ticket.image ?? "/images/tickets/ticket_1.jpg"}
                                alt={ticket.title ?? "Event"}
                                fill
                                priority
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Right: header + details */}
                    <div className="space-y-5">
                        <div className="flex lg:mb-8 items-start justify-between gap-4">
                            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.1] tracking-tight text-[#101928]">
                                {ticket.title ?? `Ticket #${id}`}
                            </h1>
                            <button
                                aria-label="Share event"
                                className="shrink-0 size-[34px] rounded-full bg-[#FBE7D3] hover:bg-[#F6F0FB] transition-colors flex items-center justify-center"
                                type="button"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.9507 4.62754C14.9507 5.80712 13.9945 6.76335 12.8149 6.76335C11.6353 6.76335 10.6791 5.80712 10.6791 4.62754C10.6791 3.44797 11.6353 2.49174 12.8149 2.49174C13.9945 2.49174 14.9507 3.44797 14.9507 4.62754Z" stroke="#2C0A4A" strokeWidth="1.0679"/>
                                    <path d="M6.40748 8.54328C6.40748 9.72288 5.45124 10.6791 4.27167 10.6791C3.0921 10.6791 2.13586 9.72288 2.13586 8.54328C2.13586 7.36367 3.0921 6.40747 4.27167 6.40747C5.45124 6.40747 6.40748 7.36367 6.40748 8.54328Z" stroke="#2C0A4A" strokeWidth="1.0679"/>
                                    <path d="M14.9507 12.4587C14.9507 13.6384 13.9945 14.5946 12.8149 14.5946C11.6353 14.5946 10.6791 13.6384 10.6791 12.4587C10.6791 11.2791 11.6353 10.3229 12.8149 10.3229C13.9945 10.3229 14.9507 11.2791 14.9507 12.4587Z" stroke="#2C0A4A" strokeWidth="1.0679"/>
                                    <path d="M6.21423 7.65282L10.8418 5.51737M6.21423 9.43302L10.8418 11.5685" stroke="#2C0A4A" strokeWidth="1.0679"/>
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-wrap lg:flex-col items-start gap-x-6 xl:gap-x-8 xl:gap-y-6 gap-y-2 text-sm xl:text-base text-[#5C6170]">
                            <div className="flex flex-wrap gap-x-6 gap-y-2 xl:gap-x-8 ">
                                <span className="flex items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.833 1.979V5.93725M7.9165 1.979V5.93725" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12.8644 3.95811H10.8853C7.15338 3.95811 5.28744 3.95811 4.12809 5.11746C2.96875 6.27681 2.96875 8.14274 2.96875 11.8746V13.8537C2.96875 17.5856 2.96875 19.4516 4.12809 20.6109C5.28744 21.7703 7.15338 21.7703 10.8853 21.7703H12.8644C16.5962 21.7703 18.4622 21.7703 19.6215 20.6109C20.7809 19.4516 20.7809 17.5856 20.7809 13.8537V11.8746C20.7809 8.14274 20.7809 6.27681 19.6215 5.11746C18.4622 3.95811 16.5962 3.95811 12.8644 3.95811Z" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2.96875 9.89546H20.7809" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M11.8703 13.8537H11.8792M11.8703 17.8119H11.8792M15.8241 13.8537H15.833M7.9165 13.8537H7.92538M7.9165 17.8119H7.92538" stroke="#5C6170" strokeWidth="1.97913" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                    {formatDate(ticket.event_date as unknown as number)}
                                </span>
                                <span className="flex flex-wrap items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.8748 21.7703C17.34 21.7703 21.7704 17.3399 21.7704 11.8747C21.7704 6.40946 17.34 1.97903 11.8748 1.97903C6.40955 1.97903 1.97913 6.40946 1.97913 11.8747C1.97913 17.3399 6.40955 21.7703 11.8748 21.7703Z" stroke="#5C6170" strokeWidth="1.48434"/>
                                    <path d="M11.8748 7.91638V11.8746L13.8539 13.8538" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                    {ticket.event_time_in_utc}
                                </span>
                            </div>
                        
                            <div className="flex flex-wrap gap-x-6 xl:gap-x-8 ">
                                <span className="flex items-center gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.3487 8.90604C14.3487 10.2723 13.2411 11.3799 11.8748 11.3799C10.5085 11.3799 9.40088 10.2723 9.40088 8.90604C9.40088 7.53974 10.5085 6.43213 11.8748 6.43213C13.2411 6.43213 14.3487 7.53974 14.3487 8.90604Z" stroke="#5C6170" strokeWidth="1.48434"/>
                                    <path d="M13.119 17.311C12.7852 17.6324 12.3391 17.8121 11.8749 17.8121C11.4106 17.8121 10.9645 17.6324 10.6307 17.311C7.57435 14.3494 3.47844 11.041 5.47589 6.23787C6.55589 3.64085 9.14839 1.97905 11.8749 1.97905C14.6013 1.97905 17.1938 3.64086 18.2738 6.23787C20.2688 11.0349 16.1829 14.3596 13.119 17.311Z" stroke="#5C6170" strokeWidth="1.48434"/>
                                    <path d="M17.8121 19.7911C17.8121 20.8842 15.1539 21.7702 11.8748 21.7702C8.59563 21.7702 5.93738 20.8842 5.93738 19.7911" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round"/>
                                </svg>
                                    {ticket.event_location}
                                </span>
                                <span className="flex items-center gap-2">
                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.1046 6.63959C17.241 6.5032 17.4761 6.4893 17.6142 6.64007C18.4237 7.52297 18.8717 8.17671 19.0192 8.90068C19.1041 9.31726 19.1162 9.74122 19.0549 10.1536C18.8893 11.2682 17.9863 12.1712 16.1802 13.9772L13.9773 16.1802C12.1713 17.9862 11.2682 18.8892 10.1537 19.0548C9.7413 19.1161 9.31734 19.104 8.90076 19.0192C8.17686 18.8716 7.52319 18.4237 6.64044 17.6144C6.48949 17.4761 6.50344 17.2408 6.63998 17.1043C7.4004 16.3438 7.36426 15.0748 6.55928 14.2698C5.75429 13.4648 4.48529 13.4287 3.72486 14.1892C3.58833 14.3257 3.35305 14.3397 3.21465 14.1887C2.40537 13.3059 1.95746 12.6523 1.80995 11.9284C1.72507 11.5118 1.713 11.0878 1.77428 10.6754C1.9399 9.56088 2.84291 8.65784 4.64892 6.85182L6.8519 4.64885C8.65791 2.84283 9.56095 1.93983 10.6755 1.77419C11.0879 1.71292 11.5118 1.72499 11.9284 1.80987C12.6524 1.9574 13.3062 2.40539 14.1891 3.21486C14.3398 3.35309 14.3259 3.58809 14.1895 3.72447C13.4291 4.48489 13.4653 5.7539 14.2702 6.55889C15.0752 7.36388 16.3443 7.40001 17.1046 6.63959Z" stroke="#5C6170" strokeWidth="1.30181" strokeLinejoin="round"/>
                                    <path d="M16.4895 13.0182L7.81079 4.33945" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>

                                    <span className="font-semibold text-[#101928]">{priceLabel}</span>
                                </span>
                                {ticket.anonymous && (
                                    <span className="flex items-center font-inter text-xs bg-[#FFFFFF99] rounded-[8px] py-[6px] px-[12px] gap-1 border text-[#1E1E1E] font-medium">
                                        <Image src="/images/shield_blur.png" alt="Anonymous" width={18} height={18} />
                                        Anonymous
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-b border-[#E9E9E9] py-6">
                            <p className="text-sm font-semibold text-[#7D7D7D]">About Event</p>
                            <p className="text-sm text-[#454545] leading-relaxed">
                                An open-air indie screening under the stars. Grab a blanket, bring a friend, and enjoy a curated selection of award-winning indie films.
                                No registration or wallet required — just show up.
                            </p>
                        </div>

                        <div className="space-y-2 pb-6  border-b border-[#E9E9E9]">
                            <p className="text-base gap-2 inline-flex text-[#5C6170]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.3174 4.94806C18.1371 4.94806 18.8017 5.61262 18.8017 6.4324C18.8017 7.25218 18.1371 7.91675 17.3174 7.91675C16.4976 7.91675 15.833 7.25218 15.833 6.4324C15.833 5.61262 16.4976 4.94806 17.3174 4.94806Z" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2.74528 11.0276C1.7526 12.1363 1.73124 13.809 2.6423 14.9856C4.45018 17.3206 6.42894 19.2994 8.7639 21.1072C9.94056 22.0183 11.6132 21.9969 12.7219 21.0043C15.732 18.3091 18.4885 15.4925 21.1489 12.3971C21.4119 12.0912 21.5763 11.7161 21.6133 11.3143C21.7765 9.53739 22.112 4.41807 20.7218 3.02781C19.3314 1.63754 14.2121 1.97296 12.4352 2.13623C12.0334 2.17316 11.6583 2.33767 11.3523 2.60068C8.25704 5.26097 5.44043 8.01755 2.74528 11.0276Z" stroke="#5C6170" strokeWidth="1.48434"/>
                                <path d="M6.927 13.8541L9.89567 16.8228" stroke="#5C6170" strokeWidth="1.48434" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                                Tags:
                                </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((t) => (
                                    <Badge
                                        key={t}
                                        variant="outline"
                                        className="rounded-[6px] bg-[#EEEFF2] text-[#5C6170] text-sm h-[25px] px-2"
                                    >
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower sections */}
                <div className="mt-10 font-inter grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-y-12 lg:gap-x-6 items-start">
                    <div className="flex-col lg:col-span-8 flex justify-between h-full">
                        <div className="rounded-[8px] border border-[#E9E9E9] bg-white p-6">
                            <h2 className="text-[18px] font-semibold text-[#1F1F1F] pb-4 border-b border-[#E9E9E9] mb-4">
                                Privacy Info
                            </h2>
                            <ul className="space-y-4 text-sm xl:text-base font-medium text-[#454545]">
                                <li className="flex items-center gap-3">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.353646" y="0.353646" width="31.2927" height="31.2927" rx="15.6464" stroke="#2C0A4A" strokeWidth="0.707293"/>
                                        <path d="M17.0815 10.6437L18.1832 12.8653C18.3335 13.1746 18.7341 13.4712 19.0721 13.528L21.069 13.8625C22.3459 14.0771 22.6464 15.0112 21.7262 15.9327L20.1738 17.4979C19.9109 17.763 19.767 18.2742 19.8483 18.6403L20.2928 20.5779C20.6433 22.1116 19.8358 22.7049 18.49 21.9033L16.6183 20.7862C16.2803 20.5842 15.7232 20.5842 15.3789 20.7862L13.5072 21.9033C12.1677 22.7049 11.3539 22.1052 11.7044 20.5779L12.1489 18.6403C12.2303 18.2742 12.0863 17.763 11.8234 17.4979L10.271 15.9327C9.35705 15.0112 9.65126 14.0771 10.9282 13.8625L12.9251 13.528C13.2569 13.4712 13.6575 13.1746 13.8077 12.8653L14.9094 10.6437C15.5103 9.43819 16.4868 9.43819 17.0815 10.6437Z" stroke="#2C0A4A" strokeWidth="0.93906" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    No account required
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.353646" y="0.353646" width="31.2927" height="31.2927" rx="15.6464" stroke="#2C0A4A" strokeWidth="0.707293"/>
                                        <path d="M17.0815 10.6437L18.1832 12.8653C18.3335 13.1746 18.7341 13.4712 19.0721 13.528L21.069 13.8625C22.3459 14.0771 22.6464 15.0112 21.7262 15.9327L20.1738 17.4979C19.9109 17.763 19.767 18.2742 19.8483 18.6403L20.2928 20.5779C20.6433 22.1116 19.8358 22.7049 18.49 21.9033L16.6183 20.7862C16.2803 20.5842 15.7232 20.5842 15.3789 20.7862L13.5072 21.9033C12.1677 22.7049 11.3539 22.1052 11.7044 20.5779L12.1489 18.6403C12.2303 18.2742 12.0863 17.763 11.8234 17.4979L10.271 15.9327C9.35705 15.0112 9.65126 14.0771 10.9282 13.8625L12.9251 13.528C13.2569 13.4712 13.6575 13.1746 13.8077 12.8653L14.9094 10.6437C15.5103 9.43819 16.4868 9.43819 17.0815 10.6437Z" stroke="#2C0A4A" strokeWidth="0.93906" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    No wallet needed
                                </li>
                                <li className="flex items-center gap-3">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.353646" y="0.353646" width="31.2927" height="31.2927" rx="15.6464" stroke="#2C0A4A" strokeWidth="0.707293"/>
                                        <path d="M17.0815 10.6437L18.1832 12.8653C18.3335 13.1746 18.7341 13.4712 19.0721 13.528L21.069 13.8625C22.3459 14.0771 22.6464 15.0112 21.7262 15.9327L20.1738 17.4979C19.9109 17.763 19.767 18.2742 19.8483 18.6403L20.2928 20.5779C20.6433 22.1116 19.8358 22.7049 18.49 21.9033L16.6183 20.7862C16.2803 20.5842 15.7232 20.5842 15.3789 20.7862L13.5072 21.9033C12.1677 22.7049 11.3539 22.1052 11.7044 20.5779L12.1489 18.6403C12.2303 18.2742 12.0863 17.763 11.8234 17.4979L10.271 15.9327C9.35705 15.0112 9.65126 14.0771 10.9282 13.8625L12.9251 13.528C13.2569 13.4712 13.6575 13.1746 13.8077 12.8653L14.9094 10.6437C15.5103 9.43819 16.4868 9.43819 17.0815 10.6437Z" stroke="#2C0A4A" strokeWidth="0.93906" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    No verification
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-[8px] xl:min-h-[200px] max-h-full  border border-[#E9E9E9] bg-white p-6">
                            <h2 className="text-[18px] font-bold text-[#1F1F1F] pb-4  border-b border-[#E9E9E9] mb-4">
                                Organized By
                            </h2>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-[#101928]">Zinema Nights</p>
                                <p className="text-sm text-[#667185]">Organizer verified via zkID</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:sticky lg:col-span-4 h-full lg:top-32">
                        <TicketPurchaseCard ticket={ticket} />
                    </div>
                </div>

                {/* Explore Other Events */}
                <div className="mt-14 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[18px] sm:text-[22px] font-bold text-[#101928]">
                            Explore Other Events
                        </h2>
                        <Link href="/explore" className="text-sm font-semibold text-[#6917AF] hover:underline">
                            All Events
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {related.map((t) => (
                            <Link key={t.id} href={`/ticket/${t.id}`} className="h-full">
                                <TicketCard ticket={t} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
