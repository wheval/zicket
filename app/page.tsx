import { Button } from "@/components/ui/button";
import { Typography } from "@/components/web/typography";
import TicketCard from "@/components/web/ticket";
import { Navbar } from "@/components/web/navbar";
import type { Metadata } from "next";
import Image from "next/image";
import { tickets } from "@/lib/mock_data";

export const metadata: Metadata = {
    title: "Home",
    description: "Zicket - The anonymous ticketing platform.",
};


export default function Page() {
    const howItWorksCard = [
        {
            icon: "/images/discover.png",
            title: "Discover without login",
            desc: "Guests can explore public or private events without creating accounts or being tracked."
        },
        {
            icon: "/images/attend.png",
            title: "Attend On Your Terms",
            desc: "Join events anonymously or with zk verification — no personal data exposed."
        },
        {
            icon: "/images/connect.png",
            title: "Only Connect When Needed",
            desc: "Wallets are used only for payment. No guest wallet required for free events."
        },
    ];
    const toolsCard = [
        {
            icon: "/images/svgs/crypto_meetup.svg",
            text: "Web3 & Crypto Meetups"
        },
        {
            icon: "/images/svgs/career.svg",
            text: "Career & Innovation"
        },
        {
            icon: "/images/svgs/art.svg",
            text: "Art & Digital Culture"
        },
        {
            icon: "/images/svgs/music.svg",
            text: "Music & Nightlife"
        },
        {
            icon: "/images/svgs/wellness.svg",
            text: "Wellness & Retreats"
        },
        {
            icon: "/images/svgs/panel.svg",
            text: "Talks & Panels"
        },
        {
            icon: "/images/svgs/workshop.svg",
            text: "Workshops & Builder Labs"
        },
        {
            icon: "/images/svgs/vibe.svg",
            text: "Social & Underground Vibes"
        },
    ]
    
    return <main>
        <section className="relative overflow-hidden h-[86dvh] bg-[url('/images/bg.png')] bg-cover bg-center">
            <Navbar />
            <div className="relative z-20 flex flex-col items-center justify-center h-full text-center max-w-4xl mx-auto px-4 gap-8">
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
                    <div className="flex items-center gap-4 px-4 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-400">Trust markers</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            <Image src="/images/starknet.png" alt="Starknet's logo" width={105} height={24}/>
                            <Image src="/images/aztec.png" alt="Aztec's logo" width={93.32} height={24}/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="bg-[#F6F0FB] py-16">
            <div className="mx-auto flex flex-col items-center justify-center">
                <Typography variant="h2">
                    How it Works
                </Typography>
                <Typography className="font-medium mb-12 tracking-tight" variant="p">Privacy-Powered Events in 3 steps </Typography>
                <div className="flex justify-betweenv gap-x-6">
                    { howItWorksCard.map((how, index) => (
                         <div key={index} className="bg-[#FBFAF9] max-w-[396px] rounded-[16px] p-5">
                            <Image alt="" src={how.icon} width={80} height={80}/>
                            <Typography className="capitalize mt-2" variant="h4">{how.title}</Typography>
                            <Typography className="font-medium pb-0 mb-0 mt-0" variant="p">{how.desc}</Typography>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full flex justify-center items-center">
                <div className="inline-flex text-center py-24 mt-10 text-[#2C0A4A] w-[14ch] text-[80px]">
                    <span className="tracking-tighter leading-[100%]">No Signups <Image className="inline" alt="" src="/images/shield.png"  width={80} height={80}/> required to explore events </span>
                </div>
            </div>
        </section>
        <section className="bg-white py-16">
            <div className="px-4 lg:px-8 xl:px-12 mb-6 xl:mb-8 flex justify-between items-center">
                <Typography variant="h3">Trending Now on Zicket</Typography>
                <Button variant="link">Browse Events</Button>
            </div>
            <div className="max-w-full overflow-hidden pl-8 xl:pl-12">
                <div className="flex flex-col sm:flex-row sm:overflow-x-scroll sm:scroll-smooth sm:snap-x sm:snap-mandatory gap-x-6 gap-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {tickets.map((ticket, index) => (
                        <div 
                            key={ticket.id} 
                            className={`sm:snap-start shrink-0 ${index === 0 ? 'sm:scroll-ml-10' : ''} ${index === tickets.length - 1 ? 'sm:scroll-mr-10 mr-10' : ''}`}
                        >
                            <TicketCard ticket={ticket} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="container mx-auto px-4 lg:px-8 xl:px-12 py-20 flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">
                <div className="max-w-2xl lg:basis-5/12 space-y-5">
                    <Typography variant="h3">
                        Powerful Tools for <br /> Public or Private Events.
                    </Typography>
                    <Typography className="font-medium tracking-tight" variant="p">
                        Privacy-first event hosting and ticketing. Built on Aztec Network, Zicket keeps you in control of your identity.
                    </Typography>
                    <Button showIcon variant="outline">Explore Events</Button>
                </div>
                <div className="flex-1 flex justify-end">
                    <div className="grid grid-cols-4 gap-4 max-w-[620px]">
                        {
                            toolsCard.map((tool, index) => (
                                <div key={index} className="flex flex-col items-center justify-center">
                                    <div className="flex border-[0.56px] w-[134.03px] h-[134.03px] border-[#797979] rounded-[8.94px] flex-col items-center justify-center">
                                        <Image src={tool.icon} alt={tool.text} width={56.67} height={50.26}/>
                                    </div>
                                    <Typography className="font-bold mt-2 tracking-tight text-xs text-center text-[#1E1E1E]" variant="p">{tool.text}</Typography>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </section>
    </main>
}