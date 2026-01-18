"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { NewsCard } from "@/components/web/news-card";
import { Typography } from "@/components/web/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/web/pagination";
import type { NewsItem } from "@/lib/types";

type Props = {
  newsItems: NewsItem[];
};

const ITEMS_PER_PAGE = 3;

export function NewsPageClient({ newsItems }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState<string>("");

  async function subscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, source: "news-page" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNewsletterStatus("error");
        setNewsletterMessage(data?.error || "Subscription failed. Please try again.");
        return;
      }

      setNewsletterStatus("success");
      setNewsletterMessage(data?.status === "already_subscribed" ? "You're already subscribed." : "Subscribed! See you in your inbox.");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Subscription failed. Please try again.");
    }
  }

  const categories = [
    "All",
    "Announcements",
    "Community",
    "Product Updates",
    "Events",
    "Behind the Scenes",
    "Tech & ZK"
  ];

  const featuredNews = newsItems[0];
  
  // Filter news by category (excluding featured)
  const filteredNews = useMemo(() => {
    const rest = newsItems.slice(1);
    if (activeCategory === "All") return rest;
    return rest.filter((n) => n.category.toLowerCase() === activeCategory.toLowerCase());
  }, [newsItems, activeCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredNews, currentPage]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  if (!featuredNews) {
    return (
      <main className="min-h-screen bg-[#FCFDFD] pt-30 lg:pt-40 2xl:pt-48 pb-20">
        <div className="container mx-auto px-4 text-center">
          <Typography variant="h2">No news available</Typography>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFDFD] pt-30 lg:pt-40 2xl:pt-48 pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 text-center mb-16">
        <Typography variant="h1" className="mb-4 text-[#000000]">Newsroom</Typography>
        <Typography variant="p" className="text-black tracking-tight text-[20px] max-w-2xl mx-auto mb-10">
          The latest news and views from Zicket
        </Typography>

        {/* Newsletter Subscription */}
        <div className="max-w-md lg:max-w-[600px] flex flex-col items-center justify-center mx-auto mb-20 space-y-4">
          <form onSubmit={subscribeNewsletter} className="w-full flex flex-col items-center gap-4">
            <div className="w-full relative">
              <svg width="22" height="22" className="absolute left-6 top-1/2 -translate-y-1/2" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.77002 5.31055L7.88888 8.77754C10.1447 10.0557 11.0978 10.0557 13.3536 8.77754L19.4725 5.31055" stroke="#2C0A4A" strokeWidth="1.32768" strokeLinejoin="round"/>
                <path d="M1.78398 11.9278C1.84184 14.6412 1.87077 15.9978 2.87196 17.0029C3.87314 18.0078 5.26654 18.0428 8.05335 18.1128C9.7709 18.156 11.4716 18.156 13.1892 18.1128C15.976 18.0428 17.3693 18.0078 18.3706 17.0029C19.3717 15.9978 19.4007 14.6412 19.4585 11.9278C19.4771 11.0553 19.4771 10.1881 19.4585 9.31559C19.4007 6.60222 19.3717 5.24553 18.3706 4.24054C17.3693 3.23554 15.976 3.20054 13.1892 3.13051C11.4716 3.08736 9.7709 3.08736 8.05334 3.13051C5.26654 3.20052 3.87314 3.23553 2.87195 4.24053C1.87076 5.24552 1.84184 6.60221 1.78397 9.31559C1.76536 10.1881 1.76537 11.0553 1.78398 11.9278Z" stroke="#2C0A4A" strokeWidth="1.32768" strokeLinejoin="round"/>
              </svg>
              <Input
                type="email"
                placeholder="Enter Email Address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-transparent h-[57px] xl:w-[600px] rounded-full border-[#B2B2B2] border w-full outline-none grow text-sm lg:text-base pl-16 text-[#172233] placeholder:text-[#B2B2B2]"
              />
            </div>
            <Button type="submit" disabled={newsletterStatus === "loading" || !newsletterEmail.trim()} className="text-base disabled:opacity-100">
              {newsletterStatus === "loading" ? "Subscribing..." : "Subscribe!"}
            </Button>
            {newsletterMessage ? (
              newsletterStatus === "error" ? (
                <p className="text-sm text-red-600" role="alert">
                  {newsletterMessage}
                </p>
              ) : (
                <p className="text-sm text-black/70" aria-live="polite">
                  {newsletterMessage}
                </p>
              )
            ) : null}
          </form>
        </div>

        {/* Featured Article */}
        <Link href={`/news/${featuredNews.id}`}>
          <div className="bg-transparent py-6 lg:py-12 font-inter overflow-hidden flex flex-col gap-y-4 lg:flex-row items-start text-left group cursor-pointer transition-all">
            <div className="lg:w-1/2 w-full relative min-h-[252.42px] lg:min-h-[300px] rounded-[10px] xl:h-[483px] overflow-hidden">
              <Image 
                src={featuredNews.image}
                alt={featuredNews.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="lg:w-1/2 lg:px-24 flex gap-y-4 lg:gap-y-6 flex-col justify-center">
              <span className="text-[#6917AF] font-bold text-xs lg:text-[18px] mt-1 uppercase md:mb-4">{featuredNews.category}</span>
              <Typography variant="h2" className="text-[18px] text-[#303030] lg:text-[28px] font-bold transition-colors font-inter leading-tight">
                {featuredNews.title}
              </Typography>
              
              <div className="flex lg:items-center items-start lg:gap-4 gap-2">
                <div className="relative min-w-[60px] w-[60px] h-[60px] min-h-[60px] lg:min-w-[70px] lg:min-h-[70px] lg:w-[70px] lg:h-[70px] rounded-full overflow-hidden border border-[#D9D9D9]">
                  <Image src={featuredNews.author.avatar} alt={featuredNews.author.name} fill className="object-cover" />
                </div>
                <div>
                  <Typography variant="p" className="font-bold text-black leading-none lg:mb-1">{featuredNews.author.name}</Typography>
                  <Typography variant="p" className="text-black text-sm font-satoshi lg:font-inter lg:text-base font-light">Checkout Experiences Product Team</Typography>
                </div>
              </div>
              
              <Typography variant="p" className="text-black font-light text-[12px] font-satoshi lg:text-inter lg:text-base">
                {featuredNews.date}
              </Typography>
            </div>
          </div>
        </Link>
      </div>

      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 cursor-pointer rounded-full text-sm font-semibold transition-all border ${
                activeCategory === cat 
                  ? "bg-[#6917AF] border-[#6917AF] text-white shadow-lg" 
                  : "bg-transparent border-[#6917AF] text-[#6917AF] hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {paginatedNews.length > 0 ? (
            paginatedNews.map((news) => (
              <Link href={`/news/${news.id}`} key={news.id} className="h-full">
                <NewsCard news={news} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Typography variant="p" className="text-[#667185]">No news in this category yet.</Typography>
            </div>
          )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
}
