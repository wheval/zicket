"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  const [isAnonymous, setIsAnonymous] = useState(true);

  return (
    <header className="fixed top-4 left-0 right-0 z-30 font-inter font-medium tracking-tight pt-4">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between rounded-full bg-[#FFFFFF]/80 border border-[#E4E4E4] px-4 lg:pl-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="flex items-center gap-2 mr-4 2xl:mr-12">
                <Image src="/logo-dark.png" alt="Zicket logo" className="min-w-[80px] min-h-[18px]" width={80} height={18} />
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#172233]">
              <Link href="/explore" className="flex items-center gap-1.5">
                Explore 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </Link>
              <Link href="/" >News</Link>
              <Link href="/" >Plans</Link>
            </nav>
            <div className="relative hidden lg:flex items-center ml-4">
              <input
                type="text"
                placeholder="Search Anonymously"
                className="h-[44px] xl:w-[300px] text-sm rounded-full bg-[#EEECF1] border-none  pl-6 pr-14 text-[#172233] placeholder:text-[#B6BAC2] outline-none"
              />
              <button 
                aria-label="Search"
                className="absolute right-1.5 w-9 h-9 rounded-full bg-[#2C0A4A] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-xs xl:text-sm text-[#707070] font-medium">Anonymous Browsing</span>
              <div 
                className="flex items-center gap-1.5 cursor-pointer select-none"
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                <div className={`relative w-[40px] h-[24px] rounded-full transition-colors duration-200 flex items-center px-[2px] ${isAnonymous ? 'bg-[#6917AF]' : 'border border-black/20 bg-[#E4E4E4]'}`}>
                  <div className={`w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 ${isAnonymous ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                </div>
                <span className="text-[11px] font-black text-[#172233] w-5">
                  {isAnonymous ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            <Button showIcon>
              Host Event
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
