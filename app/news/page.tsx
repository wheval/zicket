"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsItems } from "@/lib/mock_data";
import { NewsCard } from "@/components/web/news-card";
import { Typography } from "@/components/web/typography";
import { Button } from "@/components/ui/button";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Announcements",
    "Community",
    "Product Updates",
    "Events",
    "Behind the Scenes",
    "Tech & ZK"
  ];

  // For demonstration, let's pick the first item as featured
  const featuredNews = newsItems[0];
  const otherNews = newsItems.slice(1);

  return (
    <main className="min-h-screen bg-[#F6F0FB] pt-32 pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 text-center mb-16">
        <Typography variant="h1" className="mb-4 text-[#172233]">Newsroom</Typography>
        <Typography variant="p" className="text-[#707070] text-lg max-w-2xl mx-auto mb-10">
          The latest news and views from Zicket
        </Typography>

        {/* Newsletter Subscription */}
        <div className="max-w-md mx-auto mb-20 space-y-4">
          <div className="flex items-center p-1.5 pl-6 rounded-full bg-white border border-[#E4E4E4] shadow-sm">
            <div className="text-[#707070] mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 8L10.2189 11.1642C11.2651 11.9488 12.7349 11.9488 13.7811 11.1642L18 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="email"
              placeholder="Enter Email Address"
              className="bg-transparent border-none outline-none grow text-sm text-[#172233] placeholder:text-[#A8A8A8]"
            />
          </div>
          <Button className="w-full sm:w-auto px-12 h-12 rounded-full">
            Subscribe!
          </Button>
        </div>

        {/* Featured Article */}
        <Link href={`/news/${featuredNews.id}`}>
          <div className="bg-white rounded-[32px] overflow-hidden border border-[#E4E4E4] flex flex-col lg:flex-row items-stretch text-left group cursor-pointer transition-all hover:shadow-xl">
            <div className="lg:w-1/2 relative min-h-[300px] overflow-hidden">
              <Image 
                src="/images/news/news_1.jpg" // Placeholder for large image
                alt={featuredNews.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <span className="text-[#6917AF] font-bold text-xs uppercase tracking-widest mb-4">Announcements</span>
              <Typography variant="h2" className="text-2xl lg:text-4xl font-bold mb-6 group-hover:text-[#6917AF] transition-colors leading-tight">
                How early adopters used Zicket to host 12 exclusive events in 3 cities.
              </Typography>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#E4E4E4]">
                  <Image src={featuredNews.author.avatar} alt={featuredNews.author.name} fill className="object-cover" />
                </div>
                <div>
                  <Typography variant="p" className="font-bold text-[#172233] leading-none mb-1">John Doe</Typography>
                  <Typography variant="p" className="text-xs text-[#707070]">Checkout Experiences Product Team</Typography>
                </div>
              </div>
              
              <Typography variant="p" className="text-[#707070] text-sm">
                December 7, 2022
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
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeCategory === cat 
                  ? "bg-[#6917AF] border-[#6917AF] text-white shadow-lg" 
                  : "bg-white border-[#E4E4E4] text-[#172233] hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {otherNews.map((news) => (
            <Link href={`/news/${news.id}`} key={news.id} className="h-full">
              <NewsCard news={news} />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 pt-10 border-t border-[#E4E4E4]">
          <button className="px-4 py-2 text-sm font-semibold text-[#707070] hover:text-[#6917AF] transition-colors">
            Next
          </button>
          {[1, 2, 3].map((num) => (
            <button 
              key={num}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                num === 1 ? "bg-[#6917AF] text-white shadow-md" : "bg-[#F1EEF9] text-[#172233] hover:bg-[#E5E0F3]"
              }`}
            >
              {num}
            </button>
          ))}
          <button className="px-4 py-2 text-sm font-semibold text-[#707070] hover:text-[#6917AF] transition-colors">Last</button>
        </div>
      </div>
    </main>
  );
}
