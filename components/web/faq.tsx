"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Typography } from "./typography";

const faqData = [
  {
    question: "What makes Zicket unique?",
    answer:
      "Zicket is a privacy-first event platform built on Aztec. It lets you discover and attend events anonymously, while keeping your personal data secure. You only share what you choose.",
  },
  {
    question: "Do I need an account to get tickets?",
    answer:
      "No, you can explore all public and private events without connecting a wallet or creating an account. Wallets are only required when you're ready to purchase a paid ticket or claim a verified-access pass.",
  },
  {
    question: "Is my identity hidden when I attend events?",
    answer:
      "Yes. When you attend events on Zicket, your identity is protected by privacy technologies such as zk-proofs. You can prove eligibility (for example, being part of a DAO or owning an NFT) without exposing your wallet address or transaction history to the event host or other attendees.",
  },
  {
    question: "What kind of events are on Zicket?",
    answer:
      "Zicket hosts a range of events, including public meetups, private gatherings, Web3 & crypto workshops, art shows, music nights, career conferences, and more. Hosts can choose to make their events open to all or restrict access based on privacy and verification settings.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className=" py-20 lg:py-30">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12 max-w-4xl">
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            FAQs
          </Typography>
          <Typography variant="p" className="text-foreground tracking-tighter w-[45ch] mx-auto font-medium">
            Everything you need to know about using Zicket—how it works, what makes it private, and how you can join or host your next event.
          </Typography>
        </div>
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-[#000000] bg-white px-6 rounded-[16px] overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-5 cursor-pointer text-left"
                >
                  <Typography variant="h4" className="text-[20px] text-[#121212] font-bold">
                    {item.question}
                  </Typography>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary shrink-0">
                    <div className="relative w-3.5 h-3.5">
                      {/* Horizontal line */}
                      <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-white -translate-y-1/2 rounded-full" />
                      {/* Vertical line that rotates */}
                      <div className={`absolute top-0 left-1/2 w-[1.5px] h-full bg-white -translate-x-1/2 rounded-full transition-transform duration-300 ease-in-out ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pt-3 border-t border-[#E5E5E5]">
                      <Typography variant="p" className="text-[#121212]">
                        {item.answer}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center w-full py-6">
            <Button variant="outline">View Docs</Button>
        </div>
      </div>
    </section>
  );
}

