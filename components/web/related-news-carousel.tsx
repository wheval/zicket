"use client";

import { useRef } from "react";
import Link from "next/link";
import { NewsCard } from "@/components/web/news-card";
import { Typography } from "@/components/web/typography";
import type { NewsItem } from "@/lib/types";

type Props = {
  items: NewsItem[];
  title?: string;
};

export function RelatedNewsCarousel({ items, title = "See More" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Scroll by ~80% of container width for responsive behavior
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const newScrollLeft =
      scrollRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-32 pt-20">
      <div className="flex justify-between items-center mb-12">
        <Typography variant="h3" className="text-[24px]! font-bold">
          {title}
        </Typography>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-black flex items-center justify-center hover:bg-[#E5E0F3] transition-all cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 5C12.5 5 7.5 8.68242 7.5 10C7.5 11.3177 12.5 15 12.5 15"
                stroke="#2C0A4A"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#6917AF] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.50004 5C7.50004 5 12.5 8.68242 12.5 10C12.5 11.3177 7.5 15 7.5 15"
                stroke="white"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((item) => (
          <div key={item.id} className="shrink-0 w-[300px] md:w-[380px]">
            <Link href={`/news/${item.id}`} className="h-full block">
              <NewsCard news={item} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
