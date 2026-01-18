"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwitchToggle } from "@/components/ui/switch-toggle";
import Link from "next/link";

export function Navbar() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
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
                <Link href="/news" >News</Link>
                <Link href="/" >Plans</Link>
              </nav>
              <div className="relative hidden lg:flex items-center ml-4">
                <input
                  type="text"
                  placeholder="Search Anonymously"
                  className="h-[44px] focus-visible:ring-2 xl:w-[300px] text-sm rounded-full bg-[#EEECF1] border-none  pl-6 pr-14 text-[#172233] placeholder:text-[#B6BAC2] outline-none"
                />
                <button 
                  aria-label="Search"
                  className="absolute focus-visible:ring-2 focus-visible:ring-[#6917AF] focus-visible:ring-offset-2 right-1.5 w-9 h-9 rounded-full bg-[#2C0A4A] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-5">
              <SwitchToggle
                checked={isAnonymous}
                onChange={setIsAnonymous}
                label="Anonymous Browsing"
              />
              <Button showIcon>
                Host Event
              </Button>
            </div>
            <div className="md:hidden flex items-center gap-x-2">
              <button aria-label="search" className="items-center h-[32px] w-[32px] rounded-full flex justify-center bg-[#EEECF1] focus:bg-[#EEECF1]/50">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.3335 11.3335L14.0002 14.0002" stroke="#2C0A4A" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333Z" stroke="#2C0A4A" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
{isMobileMenuOpen ? (
                <button
                  aria-label="Close menu"
                  aria-expanded="true"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              ) : (
                <button
                  aria-label="Open menu"
                  aria-expanded="false"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1 cursor-pointer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 5H20" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12H20" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 19H20" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 pointer-events-none invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Drawer */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E4E4E4]">
            <Image src="/logo-dark.png" alt="Zicket logo" width={80} height={18} />
            <button 
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-6 space-y-2">
            <Link 
              href="/explore" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 rounded-xl text-[#172233] font-semibold hover:bg-[#F6F0FB] transition-colors"
            >
              Explore
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
            <Link 
              href="/news" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 rounded-xl text-[#172233] font-semibold hover:bg-[#F6F0FB] transition-colors"
            >
              News
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 rounded-xl text-[#172233] font-semibold hover:bg-[#F6F0FB] transition-colors"
            >
              Plans
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </nav>

          {/* Anonymous Toggle */}
          <div className="p-6 border-t border-[#E4E4E4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#707070] font-medium">Anonymous Browsing</span>
              <SwitchToggle
                checked={isAnonymous}
                onChange={setIsAnonymous}
              />
            </div>
            <Button showIcon className="w-full justify-center">
              Host Event
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
