import Image from "next/image";
import Link from "next/link";
import { 
    CareerIcon, 
    ArtIcon, 
    CryptoIcon, 
    MusicIcon, 
    PanelIcon, 
    VibeIcon, 
    WellnessIcon, 
    WorkshopIcon 
} from "@/components/svgs/SVG";
import { Typography } from "@/components/web/typography";
import { Button } from "@/components/ui/button";
import TicketCard from "@/components/web/ticket";
import { FAQ } from "@/components/web/faq";
import { NewsCard } from "@/components/web/news-card";
import { getTickets, getNewsItems } from "@/lib/db/queries";

export default async function Page() {
    const trendingTickets = await getTickets({ limit: 12, orderByPopularity: true });
    const trendingNews = await getNewsItems({ limit: 10 });

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
        { icon: CryptoIcon, text: "Web3 & Crypto Meetups" },
        { icon: CareerIcon, text: "Career & Innovation" },
        { icon: ArtIcon, text: "Art & Digital Culture" },
        { icon: MusicIcon, text: "Music & Nightlife" },
        { icon: WellnessIcon, text: "Wellness & Retreats" },
        { icon: PanelIcon, text: "Talks & Panels" },
        { icon: WorkshopIcon, text: "Workshops & Builder Labs" },
        { icon: VibeIcon, text: "Social & Underground Vibes" },
    ];
    
    return <main className="bg-[#F6F0FB]" data-page-bg="purple">
        <section className="relative overflow-hidden h-[86dvh] bg-[url('/images/bg.png')] bg-cover bg-center">
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

                <Link href="/explore">
                    <Button showIcon hasShadow className="md:text-lg">
                        Explore Events Anonymously
                    </Button>
                </Link>

                <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-8 px-4 py-2 rounded-lg">
                        <span className="text-sm bg-[#D1B7E6] px-3 py-1.5 text-[#2C0A4A] font-bold">Trust markers</span>
                        <div className="flex items-center gap-4">
                            <Image src="/images/starknet.png" alt="Starknet's logo" width={105} height={24}/>
                            <Image src="/images/aztec.png" alt="Aztec's logo" width={93.32} height={24}/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section className="py-16">
            <div className="mx-auto px-4 lg:px-8 xl:px-12 container flex flex-col items-center justify-center">
                <Typography variant="h2">
                    How it Works
                </Typography>
                <Typography className="font-medium mb-12 tracking-tight" variant="p">Privacy-Powered Events in 3 steps </Typography>
                <div className="flex flex-col md:flex-row justify-between gap-y-4 gap-x-6">
                    { howItWorksCard.map((how, index) => (
                         <div key={index} className="bg-[#FBFAF9] sm:max-w-[396px] rounded-[16px] p-5">
                            <Image alt="" src={how.icon} className="w-[40px] h-[40px] lg:w-[80px] lg:h-[80px]" width={80} height={80}/>
                            <Typography className="capitalize mt-2" variant="h4">{how.title}</Typography>
                            <Typography className="font-medium pb-0 mb-0 mt-0" variant="p">{how.desc}</Typography>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full flex justify-center items-center">
                <div className="inline-flex text-center pt-6 lg:py-24 mt-10 text-[#2C0A4A] w-[14ch] text-[40px] lg:text-[80px]">
                    <span className="tracking-tighter leading-[100%]">No Signups <Image className="inline w-[40px] h-[40px] lg:w-[80px] lg:h-[80px]" alt="" src="/images/shield_blur.png"  width={80} height={80}/> required to explore events </span>
                </div>
            </div>
        </section>
        <section className="bg-white rounded-[32px] py-16">
            <div className="px-4 container mx-auto lg:px-8 xl:px-12 mb-6 xl:mb-8 flex justify-between items-center">
                <Typography variant="h3">Trending Now <span className="hidden ld:inherit">on Zicket</span></Typography>
                <Link className="cursor-pointer" href="/explore"><Button variant="link">Browse Events</Button></Link>
            </div>
            <div className="max-w-full overflow-hidden">
                <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="snap-start shrink-0 w-0 md:w-[calc((100vw-768px)/2+1rem-1.5rem)] lg:w-[calc((100vw-1024px)/2+2rem-1.5rem)] xl:w-[calc((100vw-1280px)/2+3rem-1.5rem)] 2xl:w-[calc((100vw-1536px)/2+3rem-1.5rem)]" />
                    
                    {trendingTickets.map((ticket) => (
                        <div 
                            key={ticket.id} 
                            className="snap-start shrink-0 w-[280px]"
                        >
                            <TicketCard ticket={ticket} />
                        </div>
                    ))}

                    <div className="shrink-0 w-0 md:w-[calc((100vw-768px)/2+1rem-1.5rem)] lg:w-[calc((100vw-1024px)/2+2rem-1.5rem)] xl:w-[calc((100vw-1280px)/2+3rem-1.5rem)] 2xl:w-[calc((100vw-1536px)/2+3rem-1.5rem)]" />
                </div>
            </div>
            <div className="container mx-auto px-4 lg:px-8 xl:px-12 py-20 flex flex-col md:flex-row lg:items-center gap-12 lg:gap-20">
                <div className="max-w-2xl md:basis-5/12 space-y-5">
                    <Typography variant="h3">
                        Powerful Tools for <br /> Public or Private Events.
                    </Typography>
                    <Typography className="font-medium tracking-tight" variant="p">
                        Privacy-first event hosting and ticketing. Built on Aztec Network, Zicket keeps you in control of your identity.
                    </Typography>
                    <Link href="/explore"><Button showIcon variant="outline">Explore Events</Button></Link>
                </div>
                <div className="flex-1 flex justify-end">
                    <div className="grid grid-cols-4 place-items-start gap-4 max-w-[620px]">
                        {toolsCard.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                                <div 
                                    key={index} 
                                    className="flex flex-col group items-center justify-center"
                                >
                                    <div className="flex border-[0.56px] w-[69.16px] h-[69.16px] lg:w-[134.03px] lg:h-[134.03px] border-[#797979] group-hover:bg-[#F5E6D3] rounded-[8.94px] flex-col items-center justify-center transition-colors duration-100 text-[#404040] group-hover:text-[#6917AF]">
                                        <div className="transition-transform duration-100 group-hover:scale-125">
                                            <Icon color="currentColor" />
                                        </div>
                                    </div>
                                    <Typography className="font-bold mt-2 tracking-tight text-xs text-center text-[#1E1E1E]" variant="p">{tool.text}</Typography>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
        <FAQ />
        <section className="bg-white py-12 lg:py-24 mb-10">
            <div className="container mx-auto px-4 flex flex-col items-center text-center gap-6">
                <div className="max-w-3xl space-y-4 mb-5">
                    <Typography variant="h2">
                        Host in Peace. No <br /> Spreadsheets or Stalkers.
                    </Typography>
                    <Typography variant="p" className="tracking-tight max-w-lg mx-auto font-medium">
                        Zicket gives creators and organizers tools to launch, ticket, and manage events without compromising guest privacy.
                    </Typography>
                </div>
                <Button variant="outline">
                    Host An Event
                </Button>
            </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8 xl:px-12">
                <div className="flex justify-between items-center mb-10">
                    <Typography variant="h3" className="tracking-tighter">Trending News</Typography>
                    <Link className="cursor-pointer" href="/news"><Button variant="link">See All <span className="hidden lg:inherit">News</span></Button></Link>
                </div>
            </div>
            <div className="w-full">
                <div className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="snap-start shrink-0 w-0 md:w-[calc((100vw-768px)/2+1rem-1.5rem)] lg:w-[calc((100vw-1024px)/2+2rem-1.5rem)] xl:w-[calc((100vw-1280px)/2+3rem-1.5rem)] 2xl:w-[calc((100vw-1536px)/2+3rem-1.5rem)]" />
                    
                    {trendingNews.map((news) => (
                        <div key={news.id} className="snap-start shrink-0 w-[300px] md:w-[380px]">
                            <Link href={`/news/${news.id}`} className="block h-full">
                                <NewsCard news={news} />
                            </Link>
                        </div>
                    ))}
                    
                    <div className="shrink-0 w-0 md:w-[calc((100vw-768px)/2+1rem-1.5rem)] lg:w-[calc((100vw-1024px)/2+2rem-1.5rem)] xl:w-[calc((100vw-1280px)/2+3rem-1.5rem)] 2xl:w-[calc((100vw-1536px)/2+3rem-1.5rem)]" />
                </div>
            </div>
        </section>
    </main>
}
