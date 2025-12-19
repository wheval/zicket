import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/web/typography";

export function Footer() {
  return (
    <footer className="bg-[#1E1E1E] mx-8 rounded-[24px] p-8 lg:px-[100px] lg:py-[48px] font-inter px-4 mb-8">
      <div className=" px-4 lg:px-8 xl:px-12 container mx-auto  text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
          {/* Left Section: Logo and Description */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <Image 
                src="/logo-light.png" 
                alt="Zicket logo" 
                width={106.48} 
                height={24}
                className="" 
              />
            </div>
            <Typography variant="p" className="text-[#A8A8A8] text-sm leading">
            Public or Private Events.<br />
            Host Freely. Attend Silently.
            </Typography>
          </div>

          {/* Right Section: Newsletter and Socials */}
          <div className="w-full lg:w-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center p-1 pl-6 rounded-full bg-[#1C1C1C] border border-white/10 w-full lg:w-[450px]">
                <input
                  type="email"
                  placeholder="Subscribe to our newsletter..."
                  className="bg-transparent border-none outline-none flex-grow text-sm text-white placeholder:text-[#A8ADBD]"
                />
                <Button 
                  showIcon 
                  className="bg-linear-to-r from-[#6322E0] to-[#9B30FF] hover:opacity-90 transition-opacity px-6"
                >
                  Join Now
                </Button>
              </div>
              <Typography variant="small" className="text-[#A8ADBD] block">
                By subscribing you agree to with our{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  Privacy Policy
                </Link>
              </Typography>
            </div>

            <div className="flex items-center gap-4">
              <Typography variant="p" className="font-medium">
                Connect With Us:
              </Typography>
              <div className="flex gap-2">
                <Link 
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1C1C1C] border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link 
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1C1C1C] border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 my-12" />

        {/* Bottom Section: Nav and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#A8ADBD]">
          <nav className="flex flex-wrap justify-center font-medium text-xs text-white gap-x-8 gap-y-4">
            <Link href="/" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/host" className="hover:text-white transition-colors">Host Event</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link>
          </nav>
          <Typography variant="p" className="text-sm text-white">
            © 2025 Zicket. All rights reserved.
          </Typography>
        </div>
      </div>
    </footer>
  );
}

