import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { newsItems } from "@/lib/mock_data";
import { NewsCard } from "@/components/web/news-card";
import { Typography } from "@/components/web/typography";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = newsItems.find((item) => item.id === slug);
  const title = news?.title || "News Article";

  return {
    title: `${title} | Zicket News`,
    description: news?.description || "Read the latest about Zicket.",
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = newsItems.find((item) => item.id === slug) || newsItems[0];

  return (
    <main className="min-h-screen bg-[#FCFDFD] pt-30 lg:pt-40 2xl:pt-48 pb-20">
      <div className="container mx-auto font-inter px-4 lg:px-8 xl:px-12">
        {/* Breadcrumbs */}
        <div className="flex justify-center items-center gap-2 text-sm text-[#2C0A4A] font-medium font-inter mb-12">
          <Link href="/news" className="hover:text-[#6917AF] transition-colors">News</Link>
          <p className="text-[#98A2B3] font-bold">/</p>
          <span className="font-medium">{news.category}</span>
          <p className="text-[#98A2B3] font-bold">/</p>
          <span className="truncate max-w-[300px] text-[#667185]">{news.title}</span>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-30">
          <span className="text-[#6917AF] font-semibold text-base uppercase mb-6 block">
            {news.category}
          </span>
          <Typography variant="h1" className="text-[32px] xl:max-w-[520px] xl:mx-auto lg:text-[40px] font-bold mb-8 leading-[1.1] tracking-normal text-black">
            ZK and Access Control: What We&apos;ve Learned
          </Typography>
          
          <div className="flex flex-col items-center gap-4">
            <Typography variant="p" className="text-black font-light">
              December 7, 2022
            </Typography>
            <div className="flex items-center gap-3 ounded-full">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image src={news.author.avatar} alt={news.author.name} fill className="object-cover" />
              </div>
              <span className="font-medium text-[#1E1E1E] text-sm">{news.author.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[21/9] rounded-[16px] overflow-hidden mb-20">
          <Image 
            src="/images/news/news_3.jpg" // Large version of image
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-10 text-black">
            <Typography variant="p" className="font-inter text-black leading-normal">
              In the current digital landscape, privacy is no longer a luxury — it&apos;s an expectation. As more systems move on-chain, the transparency that blockchain offers begins to clash with users&apos; desire for discretion. At Zicket, we&apos;ve made it our mission to challenge this tension, especially within the event space. Ticketing, at its core, is about access — to spaces, ideas, people, and moments. Yet the way most platforms manage access today is both invasive and outdated. This is why we&apos;ve been building on Aztec&apos;s privacy-first infrastructure, leveraging zero-knowledge proofs (ZKPs) to reshape the foundation of event verification. What follows is a detailed account of what we&apos;ve learned so far and how ZK is changing the way we think about event participation, access rights, and anonymity.
            </Typography>

            <div className="space-y-6 pt-4">
              <Typography variant="h2" className="lg:font-inter text-[18px]! lg:text-[24px]! leading-tight text-black">
                Why Privacy Needs to Be Baked into Events
              </Typography>
              <Typography variant="p" className="font-inter text-black leading-normal">
                Traditional ticketing systems prioritize convenience over privacy. When users register for events, their personal and wallet information is often logged, indexed, and made publicly accessible. While this might seem harmless in the context of a concert or festival, it poses serious concerns for more sensitive events — like governance meetings, DAO community gatherings, private workshops, or culturally-specific spaces that thrive in intimacy. What we often forget is that access control is not just about letting the right people in; it&apos;s about keeping visibility controlled, preserving the intent behind an experience, and protecting both hosts and attendees.
              </Typography>
              <Typography variant="p" className="font-inter text-black leading-normal">
                Zero-knowledge technology offers a unique opportunity to invert this model. Instead of needing to reveal data to prove legitimacy, ZK allows users to prove ownership, identity, or membership without disclosing the underlying details. For Zicket, this means that someone can prove they&apos;re allowed into an event without ever revealing their wallet address or token holdings. It redefines the baseline for trust — you don&apos;t need to see my credentials, only know that they&apos;re valid.
              </Typography>
            </div>

            <div className="space-y-6 pt-4">
              <Typography variant="h2" className="lg:font-inter text-[18px]! lg:text-[24px]! leading-tight text-black">
                What ZK Unlocks for Access Control on Zicket
              </Typography>
              <Typography variant="p" className="font-inter text-black leading-normal">
                Zicket is designed from the ground up to be privacy-native. Thanks to Aztec&apos;s encrypted smart contracts, we&apos;ve developed a system where tickets function as private credentials — invisible to third parties, verifiable to hosts. The core capability here is selective disclosure. For example, a user attending a private retreat can receive a ticket that only becomes visible to the host for verification purposes. From the user&apos;s perspective, they maintain complete control over what is shared and when.
              </Typography>
            </div>
          </div>
        </div>

        {/* Related News / See More */}
        <div className="mt-32 pt-20">
          <div className="flex justify-between items-center mb-12">
            <Typography variant="h3" className="text-[24px]! font-bold">See More</Typography>
            <div className="flex gap-2">
              <button aria-label="previous" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-black flex items-center justify-center hover:bg-[#E5E0F3] transition-all group">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 5C12.5 5 7.5 8.68242 7.5 10C7.5 11.3177 12.5 15 12.5 15" stroke="#2C0A4A" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              </button>
              <button aria-label="next" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#6917AF] text-white flex items-center justify-center hover:opacity-90 transition-all">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50004 5C7.50004 5 12.5 8.68242 12.5 10C12.5 11.3177 7.5 15 7.5 15" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, 3).map((item) => (
              <Link href={`/news/${item.id}`} key={item.id} className="h-full">
                <NewsCard news={item} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

