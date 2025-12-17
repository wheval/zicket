import { Button } from "@/components/ui/button";
import { Typography } from "@/components/web/typography";
import TicketCard from "@/components/web/ticket";
import type { Metadata } from "next";
import Image from "next/image";
import { tickets } from "@/lib/mock_data";

export const metadata: Metadata = {
    title: "Home",
    description: "Zicket - The anonymous ticketing platform.",
};


export default function Page() {
    
    return <main>
        <section className="relative overflow-hidden h-[87vh]">
            <div className="rounded-full w-[140%] absolute z-10 inset-1/2 -translate-x-1/2 -translate-y-[90%] bg-[#000213] blur-[100px] h-full"></div>
            <div className="rounded-full w-[120%] absolute inset-1/2 -translate-x-1/2 -translate-y-[85%] bg-[#693DED] blur-[100px] h-full"></div>
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto px-4 gap-8 pt-20">
                <div className="space-y-4">
                    <Typography className="text-white drop-shadow-xl" variant="h1">
                        Public or Private Events.<br />
                        Host Freely. Attend Silently.
                    </Typography>
                    <Typography variant="lead" className="max-w-2xl mx-auto">
                        Empowering hosts. Shielding guests. Reinventing event privacy.
                    </Typography>
                </div>

                <Button showIcon className="rounded-full bg-linear-to-r from-[#693DED] to-[#9D7AFF] hover:opacity-90 transition-opacity px-8 py-6 text-lg">
                    Explore Events Anonymously
                </Button>

                <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                        <span className="text-sm font-medium text-gray-400">Trust markers</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            {/* Starknet Placeholder */}
                            <Image src="/images/starknet.png" alt="Starknet's logo" width={105} height={24}/>
                            <Image src="/images/aztec.png" alt="Aztec's logo" width={93.32} height={24}/>
                            {/* Aztec Placeholder */}
                            <div className="flex items-center gap-2 text-white/80 font-bold">
                                <div className="w-5 h-5 bg-purple-500 rotate-45"></div>
                                Aztec
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section>
            <div>
                <Typography variant="h2">
                    How it Works
                </Typography>
                <Typography variant="p">Privacy-Powered Events in 3 steps </Typography>
                <div>
                    {/* <Image /> */}
                    <Typography variant="h3">Discover Without Logins</Typography>
                    <Typography variant="p">Guests can explore public or private events without creating accounts or being tracked.</Typography>
                </div>
            </div>
            <div>
                No Signups required to explore events
            </div>
        </section>
        <section className="scroll-pb-16">
            <div className="px-6">
                <Typography variant="h2">Trending Now on Zicket</Typography>
                <Button variant="link">Browse Events</Button>
            </div>
            <div className="max-w-full overflow-hidden px-6">
                <div className="flex flex-col sm:flex-row sm:overflow-x-scroll sm:scroll-smooth gap-x-6 gap-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            </div>
        </section>
    </main>
}