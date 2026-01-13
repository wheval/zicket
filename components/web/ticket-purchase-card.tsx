"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ticket } from "@/lib/types";
import Image from "next/image";

type TicketType = {
  id: string;
  label: string;
  priceLabel: string;
};

export function TicketPurchaseCard({
  ticket,
  ticketTypes,
}: {
  ticket: Ticket;
  ticketTypes?: TicketType[];
}) {
  const types = useMemo<TicketType[]>(() => {
    if (ticketTypes?.length) return ticketTypes;
    const isFree = !ticket.paid || ticket.price_in_usd === 0;
    return [
      {
        id: "standard",
        label: isFree ? "FREE" : "Standard",
        priceLabel: isFree ? "FREE" : `$${ticket.price_in_usd.toFixed(2)}`,
      },
    ];
  }, [ticket.paid, ticket.price_in_usd, ticketTypes]);

  const [selectedType, setSelectedType] = useState(types[0]?.id ?? "standard");
  const [email, setEmail] = useState("");

  const selected = useMemo(
    () => types.find((t) => t.id === selectedType) ?? types[0],
    [selectedType, types]
  );

  const privacyLabel = ticket.anonymous ? "Anonymous" : ticket.event_verified ? "Verified Access" : "Wallet";

  return (
    <Card className="bg-white border-[#E9E9E9] px-2 py-6 h-full rounded-[8px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[18px] font-semibold text-[#1F1F1F] pb-4 mb-1 border-b border-[#E9E9E9]">
          Ticket Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-[#667185]">Select Ticket Type</p>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger property="special" className="w-full h-12! rounded-[12px] border-[#6917AF] px-4">
              <SelectValue placeholder="Select ticket type" />
            </SelectTrigger>
            <SelectContent className="bg-white ">
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="font-semibold text-[#6917AF]">{t.label}</span>
                    { t.label != t.priceLabel && <span className="text-[#667185] text-sm">{t.priceLabel}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] mr-2 text-[#667185]">Privacy Level:</span>
          <span className="flex items-center font-inter text-xs bg-[#FFFFFF99] rounded-[8px] py-[6px] px-[12px] gap-1 border border-[#6917AF] text-[#1E1E1E] font-medium">
              <Image src="/images/shield_blur.png" alt="Anonymous" width={18} height={18} />
              {privacyLabel}
          </span>
        </div>

        <div className="space-y-2 bg-[#F4F4F4] p-4 rounded-[12px]">
          <p className="text-[12px] font-medium text-[#667185]">
            Want a reminder? (Optional)
          </p>
          <InputGroup className="h-12 rounded-[12px] border-[#E4E4E4] bg-white">
            <InputGroupInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="px-4"
            />
            <InputGroupAddon align="inline-end" className="pr-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.77026 4.4256L7.88913 7.89936C10.1247 9.16852 11.1183 9.16852 13.3538 7.89936L19.4727 4.4256" stroke="#1E1E1E" strokeWidth="1.32768" strokeLinejoin="round"/>
              <path d="M10.6215 17.2599C10.6215 17.2599 8.9124 17.2491 8.05359 17.2275C5.26679 17.1575 3.87338 17.1225 2.8722 16.1176C1.87102 15.1125 1.84208 13.7559 1.78422 11.0424C1.76562 10.17 1.76561 9.30274 1.78421 8.43026C1.84208 5.71689 1.87101 4.36021 2.8722 3.35521C3.87338 2.35021 5.26679 2.3152 8.05358 2.24519C9.77114 2.20204 11.4718 2.20204 13.1894 2.2452C15.9762 2.31522 17.3696 2.35023 18.3708 3.35522C19.372 4.36022 19.4009 5.7169 19.4587 8.43027C19.468 8.86647 19.4727 9.30142 19.4727 9.73636" stroke="#1E1E1E" strokeWidth="1.32768" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4727 15.0471V12.8343C17.7025 12.8343 16.3748 11.9492 16.3748 11.9492C16.3748 11.9492 15.0471 12.8343 13.2769 12.8343V15.0471C13.2769 18.145 16.3748 19.0301 16.3748 19.0301C16.3748 19.0301 19.4727 18.145 19.4727 15.0471Z" stroke="#1E1E1E" strokeWidth="1.32768" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="rounded-[12px] bg-[#F2FFF2] px-4 py-2 text-[12px] font-montserrat font-medium text-[#0ABA2A] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5067 10.6133L10.24 2.93331C9.66665 1.89998 8.87332 1.33331 7.99998 1.33331C7.12665 1.33331 6.33332 1.89998 5.75998 2.93331L1.49332 10.6133C0.953318 11.5933 0.893318 12.5333 1.32665 13.2733C1.75999 14.0133 2.61332 14.42 3.73332 14.42H12.2667C13.3867 14.42 14.24 14.0133 14.6733 13.2733C15.1067 12.5333 15.0467 11.5866 14.5067 10.6133ZM7.49998 5.99998C7.49998 5.72665 7.72665 5.49998 7.99998 5.49998C8.27332 5.49998 8.49998 5.72665 8.49998 5.99998V9.33331C8.49998 9.60665 8.27332 9.83331 7.99998 9.83331C7.72665 9.83331 7.49998 9.60665 7.49998 9.33331V5.99998ZM8.47332 11.8066C8.43998 11.8333 8.40665 11.86 8.37332 11.8866C8.33332 11.9133 8.29332 11.9333 8.25332 11.9466C8.21332 11.9666 8.17332 11.98 8.12665 11.9866C8.08665 11.9933 8.03998 12 7.99998 12C7.95998 12 7.91332 11.9933 7.86665 11.9866C7.82665 11.98 7.78665 11.9666 7.74665 11.9466C7.70665 11.9333 7.66665 11.9133 7.62665 11.8866C7.59332 11.86 7.55998 11.8333 7.52665 11.8066C7.40665 11.68 7.33332 11.5066 7.33332 11.3333C7.33332 11.16 7.40665 10.9866 7.52665 10.86C7.55998 10.8333 7.59332 10.8066 7.62665 10.78C7.66665 10.7533 7.70665 10.7333 7.74665 10.72C7.78665 10.7 7.82665 10.6866 7.86665 10.68C7.95332 10.66 8.04665 10.66 8.12665 10.68C8.17332 10.6866 8.21332 10.7 8.25332 10.72C8.29332 10.7333 8.33332 10.7533 8.37332 10.78C8.40665 10.8066 8.43998 10.8333 8.47332 10.86C8.59332 10.9866 8.66665 11.16 8.66665 11.3333C8.66665 11.5066 8.59332 11.68 8.47332 11.8066Z" fill="#0ABA2A"/>
          </svg>
          Secure &amp; Instant Payment
        </div>

        <Button variant={"secondary"} showIcon className="w-full h-12" >
          {ticket.anonymous ? "Attend Anonymously" : "Get Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
}


