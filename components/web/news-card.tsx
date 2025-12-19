import Image from "next/image";
import { Typography } from "./typography";
import { NewsItem } from "@/lib/mock_data";

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="flex flex-col gap-4 group font-inter w-fit p-0 m-0 cursor-pointer bg-white rounded-[24px] border border-transparent hover:border-[#E5E5E5] transition-all">
      <div className="relative md:w-[380px] w-full  md:h-[200px]  overflow-hidden rounded-[12px]">
        <Image
          src={news.image}
          alt={news.title}
          fill
          className="object-cover transition-transform group-hover:grayscale-50 duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex py-1 px-4 flex-col gap-2">
        <div className="flex items-center gap-1.5 mb-1 text-xs text-[#5C6170]">
          <span>{news.category}</span>
          <span>•</span>
          <span>{news.date}</span>
        </div>
        <Typography variant="h4" className="font-semibold group-hover:underline text-base text-[#000000] leading-tight line-clamp-2">
          {news.title} 
        </Typography>
        <Typography variant="p" className="text-xs text-[#5C6170] line-clamp-2">
          {news.description}
        </Typography>
      </div>
      <div className="px-4 pb-4 flex items-center gap-2">
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={news.author.avatar}
            alt={news.author.name}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-xs font-semibold text-[#121212]">{news.author.name}</span>
      </div>
    </div>
  );
}

