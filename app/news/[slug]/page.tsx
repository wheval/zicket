import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Typography } from "@/components/web/typography";
import { RelatedNewsCarousel } from "@/components/web/related-news-carousel";
import { getNewsItemById, getRelatedNews } from "@/lib/db/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsItemById(slug);
  const title = news?.title || "News Article";

  return {
    title: `${title} | Zicket News`,
    description: news?.description || "Read the latest about Zicket.",
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsItemById(slug);

  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNews(news.id, 6);

  return (
    <main className="min-h-screen bg-[#FCFDFD] pt-30 lg:pt-40 2xl:pt-48 pb-20">
      <div className="container mx-auto font-inter px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumbs */}
        <div className="flex justify-center items-center gap-2 text-sm text-[#2C0A4A] font-medium font-inter mb-12">
          <Link href="/news" className="hover:text-[#6917AF] transition-colors">News</Link>
          <p className="text-[#98A2B3] font-bold">/</p>
          <span className="font-medium truncate">{news.category}</span>
          <p className="text-[#98A2B3] font-bold">/</p>
          <span className="truncate max-w-[300px] text-[#667185]">{news.title}</span>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-10 md:mb-30">
          <span className="text-[#6917AF] font-semibold text-base uppercase mb-6 block">
            {news.category}
          </span>
          <Typography variant="h1" className="text-[32px] xl:max-w-[520px] xl:mx-auto lg:text-[40px] font-bold mb-8 leading-[1.1] tracking-normal text-black">
            {news.title}
          </Typography>
          
          <div className="flex flex-col items-center gap-4">
            <Typography variant="p" className="text-black font-light">
              {news.date}
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
        <div className="relative w-full min-h-[200px] md:aspect-21/9 rounded-[16px] overflow-hidden mb-10 md:mb-20">
          <Image 
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <article className="space-y-6 text-black">
            {news.content.split("\n\n").map((paragraph, index) => (
              <Typography 
                key={index} 
                variant="p" 
                className="font-inter text-black leading-relaxed"
              >
                {paragraph}
              </Typography>
            ))}
          </article>
        </div>

        {/* Related News / See More */}
        <RelatedNewsCarousel items={relatedNews} />
      </div>
    </main>
  );
}
