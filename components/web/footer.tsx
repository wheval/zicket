"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/web/typography";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.error || "Subscription failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(data?.status === "already_subscribed" ? "You're already subscribed." : "Subscribed! See you in your inbox.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Subscription failed. Please try again.");
    }
  }

  function handleFAQsClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      const faqsSection = document.getElementById("faqs");
      if (faqsSection) {
        faqsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push("/#faqs");
      setTimeout(() => {
        const faqsSection = document.getElementById("faqs");
        if (faqsSection) {
          faqsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }

  return (
    <footer className="bg-[#1E1E1E] mx-4 lg:mx-8 rounded-[24px] p-8 lg:px-[100px] lg:py-[48px] font-inter px-4 mb-8">
      <div className="container mx-auto  text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">          {/* Left Section: Logo and Description */}
          <div className="sm:max-w-xs w-full flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2  mb-3 md:mb-6">
              <Link href="/">
                <Image 
                  src="/logo-light.png" 
                  alt="Zicket logo" 
                  width={106.48} 
                  height={24}
                  className="" 
                />
                </Link>
            </div>
            <Typography variant="p" className="text-[#A8A8A8] text-center sm:text-start text-sm leading">
            Public or Private Events.<br />
            Host Freely. Attend Silently.
            </Typography>
          </div>

          {/* Right Section: Newsletter and Socials */}
          <div className="w-full lg:w-auto space-y-8">
            <div className="space-y-4">
              <form onSubmit={onSubscribe} className="space-y-3">
                <div className="flex items-center p-1 relative pl-6 rounded-full border border-[#606163] w-full lg:w-[450px]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Subscribe to our newsletter..."
                    className="hidden sm:block bg-transparent h-[44px] border-none outline-none grow text-sm text-[#FCFDFD] placeholder:text-[#FCFDFD]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Subscribe"
                    className="block sm:hidden bg-transparent h-[44px] border-none outline-none grow text-sm text-[#FCFDFD] placeholder:text-[#FCFDFD]"
                  />
                  <Button
                    type="submit"
                    showIcon
                    disabled={status === "loading" || !email.trim()}
                    className="absolute top-1/2 -translate-y-1/2 right-px"
                  >
                    {status === "loading" ? "Joining..." : "Join Now"}
                  </Button>
                </div>
                {message && status === "error" ? (
                  <p className="text-xs text-red-300 text-center md:text-start" aria-live="assertive">
                    {message}
                  </p>
                ) : null}
                {message && status !== "error" ? (
                  <p className="text-xs text-[#CECECE] text-center md:text-start" aria-live="polite">
                    {message}
                  </p>
                ) : null}
              </form>
              <Typography variant="small" className="text-[#CECECE] text-center md:text-start text-xs block">
                By subscribing you agree to our{" "}
                <Link href="/privacy" className="underline underline-offset-3">
                  Privacy Policy
                </Link>
              </Typography>
            </div>

            <div className="flex items-center justify-center md:justify-start w-full gap-4">
              <Typography variant="p" className="font-medium text-[15px] font-bricolage text-white">
                Connect With Us:
              </Typography>
              <div className="flex gap-2">
                <Link 
                    href="#" 
                    className="w-6 h-6 flex items-center justify-center rounded-[6px] bg-[#FFFFFF]/10 hover:bg-white/5 transition-colors"
                  >
                  <Image src="/images/svgs/x.svg" alt="" width={12} height={12} />
                </Link>
                <Link 
                  href="#" 
                  className="w-6 h-6 flex items-center justify-center rounded-[6px] bg-[#FFFFFF]/10 hover:bg-white/5 transition-colors"
                >
                  <Image src="/images/svgs/linkedin.svg" alt="" width={12} height={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20 mb-6 mt-16" />

        {/* Bottom Section: Nav and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-[#A8ADBD]">
          <nav className="flex flex-wrap justify-center font-medium text-xs text-white gap-x-8 gap-y-4">
            <Link href="/" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/host" className="hover:text-white transition-colors">Host Event</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/#faqs" onClick={handleFAQsClick} className="hover:text-white transition-colors">FAQs</Link>
          </nav>
          <Typography variant="p" className="text-sm text-white">
            © {new Date().getFullYear()} Zicket. All rights reserved.
          </Typography>
        </div>
      </div>
    </footer>
  );
}

