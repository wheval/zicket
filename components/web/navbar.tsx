import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-30 font-inter font-medium tracking-tight pt-4">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between rounded-full bg-[#FFFFFF]/80 border border-[#E4E4E4] px-4 lg:px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src="/zicket.png" alt="Zicket logo" width={80} height={18} />
            </div>
            <nav className="hidden md:flex items-center gap-4 text-sm text-[#172233]">
              <Link href="/" >Explore</Link>
              <Link href="/" >News</Link>
              <Link href="/" >Plans</Link>
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Anonymously"
                className="h-9 w-64 rounded-full bg-white/5 border border-white/10 px-4 pr-9 text-xs text-[#172233] placeholder:text-white/60 outline-none"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-white/70 text-sm">
                ⌕
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#606163]">
              <span>Anonymous Browsing</span>
              <div className="relative w-9 h-5 rounded-full bg-white/15 border border-white/20 flex items-center px-0.5">
                <div className="w-4 h-4 rounded-full bg-white translate-x-3" />
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


