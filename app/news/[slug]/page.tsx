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
    <main className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-[#707070] mb-12">
          <Link href="/news" className="hover:text-[#6917AF] transition-colors">News</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span className="text-[#6917AF] font-medium">{news.category}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span className="truncate max-w-[200px]">{news.title}</span>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-[#6917AF] font-bold text-sm uppercase tracking-widest mb-6 block">
            {news.category}
          </span>
          <Typography variant="h1" className="text-3xl lg:text-6xl font-bold mb-8 leading-[1.1] text-[#172233]">
            ZK and Access Control: What We&apos;ve Learned
          </Typography>
          
          <div className="flex flex-col items-center gap-4">
            <Typography variant="p" className="text-[#707070] font-medium">
              December 7, 2022
            </Typography>
            <div className="flex items-center gap-3 bg-[#F1EEF9] px-4 py-2 rounded-full border border-[#E5E0F3]">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image src={news.author.avatar} alt={news.author.name} fill className="object-cover" />
              </div>
              <span className="font-bold text-[#172233] text-sm">{news.author.name}</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full aspect-[21/9] rounded-[40px] overflow-hidden mb-20 shadow-2xl">
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
          <div className="space-y-10 text-[#172233]">
            <Typography variant="p" className="text-xl lg:text-2xl leading-relaxed text-[#172233]">
              In the current digital landscape, privacy is no longer a luxury — it&apos;s an expectation. As more systems move on-chain, the transparency that blockchain offers begins to clash with users&apos; desire for discretion. At Zicket, we&apos;ve made it our mission to challenge this tension, especially within the event space. Ticketing, at its core, is about access — to spaces, ideas, people, and moments. Yet the way most platforms manage access today is both invasive and outdated. This is why we&apos;ve been building on Aztec&apos;s privacy-first infrastructure, leveraging zero-knowledge proofs (ZKPs) to reshape the foundation of event verification. What follows is a detailed account of what we&apos;ve learned so far and how ZK is changing the way we think about event participation, access rights, and anonymity.
            </Typography>

            <div className="space-y-6 pt-4">
              <Typography variant="h2" className="text-2xl lg:text-4xl font-bold text-[#172233] leading-tight">
                Why Privacy Needs to Be Baked into Events
              </Typography>
              <Typography variant="p" className="text-lg lg:text-xl leading-relaxed text-[#5C6170]">
                Traditional ticketing systems prioritize convenience over privacy. When users register for events, their personal and wallet information is often logged, indexed, and made publicly accessible. While this might seem harmless in the context of a concert or festival, it poses serious concerns for more sensitive events — like governance meetings, DAO community gatherings, private workshops, or culturally-specific spaces that thrive in intimacy. What we often forget is that access control is not just about letting the right people in; it&apos;s about keeping visibility controlled, preserving the intent behind an experience, and protecting both hosts and attendees.
              </Typography>
              <Typography variant="p" className="text-lg lg:text-xl leading-relaxed text-[#5C6170]">
                Zero-knowledge technology offers a unique opportunity to invert this model. Instead of needing to reveal data to prove legitimacy, ZK allows users to prove ownership, identity, or membership without disclosing the underlying details. For Zicket, this means that someone can prove they&apos;re allowed into an event without ever revealing their wallet address or token holdings. It redefines the baseline for trust — you don&apos;t need to see my credentials, only know that they&apos;re valid.
              </Typography>
            </div>

            <div className="space-y-6 pt-4">
              <Typography variant="h2" className="text-2xl lg:text-4xl font-bold text-[#172233] leading-tight">
                What ZK Unlocks for Access Control on Zicket
              </Typography>
              <Typography variant="p" className="text-lg lg:text-xl leading-relaxed text-[#5C6170]">
                Zicket is designed from the ground up to be privacy-native. Thanks to Aztec&apos;s encrypted smart contracts, we&apos;ve developed a system where tickets function as private credentials — invisible to third parties, verifiable to hosts. The core capability here is selective disclosure. For example, a user attending a private retreat can receive a ticket that only becomes visible to the host for verification purposes. From the user&apos;s perspective, they maintain complete control over what is shared and when.
              </Typography>
            </div>
          </div>
        </div>

        {/* Related News / See More */}
        <div className="mt-32 pt-20 border-t border-[#E4E4E4]">
          <div className="flex justify-between items-center mb-12">
            <Typography variant="h2" className="text-3xl font-bold">See More</Typography>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full bg-[#F1EEF9] border border-[#E5E0F3] flex items-center justify-center hover:bg-[#E5E0F3] transition-all group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6917AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <button className="w-12 h-12 rounded-full bg-[#6917AF] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-[0_8px_16px_rgba(105,23,175,0.24)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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

