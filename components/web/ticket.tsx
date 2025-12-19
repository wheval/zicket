import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";
import { type Ticket } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";

export default function TicketCard ({ticket} : {ticket: Ticket}) {
    return <Card className="rounded-[10.96px] border-[1.57px] group p-[3.13px] gap-0 xl:max-w-[280px] sm:min-w-[280px] max-h-[375.32px]">
        <div className="relative overflow-hidden border-[#E9E9E9] border-[0.78px] rounded-[8.7px] w-full h-[194px]">
            <div className="absolute top-[10px] text-xs left-[10px] z-10 bg-blur-[12.51] bg-[#FFFFFF99] px-[9.38px] border-[#E9E9E9] border-[0.39px] rounded-[6.26px] py-[4.69px] flex items-center gap-1.5">
               {ticket.anonymous && (
                   <>
                       <Image src="/images/shield.png" alt="Anonymous" width={12} height={12} />
                       <span>Anonymous</span>
                   </>
               )}
               {!ticket.anonymous && ticket.event_verified && (
                   <>
                       <Image src="/images/lock.png" alt="Verified Access" width={12} height={12} />
                       <span>Verified Access</span>
                   </>
               )}
               {!ticket.anonymous && !ticket.event_verified && ticket.paid && (
                   <>
                       <Image src="/images/key.png" alt="Wallet Required" width={12} height={12} />
                       <span>Wallet Required</span>
                   </>
               )}
            </div>
            <Image 
                alt="Ticket" 
                src={ticket.image ?? "/images/tickets/ticket_1.png"} 
                width={280} 
                height={194}
                className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
        </div> 
        <CardContent className="py-[12px] px-[8px]">
            <CardTitle className="text-[18px] mb-2 font-semibold">{ticket.title?? "Unknown Event"}</CardTitle>
            <div className="flex flex-col font-inter gap-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex font-inter tracking-[0%] gap-x-1 items-center text-xs">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 5.3335C10 6.43806 9.1046 7.3335 8 7.3335C6.8954 7.3335 6 6.43806 6 5.3335C6 4.22893 6.8954 3.3335 8 3.3335C9.1046 3.3335 10 4.22893 10 5.3335Z" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.6667 2.6665C11.7712 2.6665 12.6667 3.56194 12.6667 4.6665C12.6667 5.4819 12.1787 6.18332 11.4789 6.4947" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.14288 9.3335H6.85715C5.27919 9.3335 4 10.6127 4 12.1906C4 12.8218 4.51167 13.3335 5.14285 13.3335H10.8571C11.4883 13.3335 12 12.8218 12 12.1906C12 10.6127 10.7208 9.3335 9.14288 9.3335Z" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.8096 8.6665C13.3875 8.6665 14.6667 9.9457 14.6667 11.5236C14.6667 12.1548 14.155 12.6665 13.5238 12.6665" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.33331 2.6665C4.22875 2.6665 3.33331 3.56194 3.33331 4.6665C3.33331 5.4819 3.82127 6.18332 4.5211 6.4947" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.47617 12.6665C1.84499 12.6665 1.33331 12.1548 1.33331 11.5236C1.33331 9.9457 2.6125 8.6665 4.19045 8.6665" stroke="#1E1E1E" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                        <span className="font-semibold">{ticket?.no_of_attendees ?? 0}</span>

                        <span className="font-light">{ticket?.anonymous ? "(60% Anonymous)" : ""}</span>
                    </div>
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:">
                    {
                        ticket.attendees?.slice(0, 3).map((att, index) => {
                            return (
                                    <Avatar className="w-[24px] h-[24px]" key={`${att.walletAddress || att.avatar_url}-${index}`}>
                                        <AvatarImage src={att.avatar_url} />
                                        <AvatarFallback>{att.name[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                            );
                        })
                    }
                    {
                        ticket.attendees && ticket.attendees.length > 3 && (
                            <Avatar className="w-[24px] h-[24px]">
                                <AvatarFallback className="text-[8px] bg-[#606163] text-white font-inter font-semibold">{ticket.no_of_attendees - 3}</AvatarFallback>
                            </Avatar>
                        )
                    }
                    </div>
                </div>
                <div className="flex flex-wrap gap-y-1.5 gap-x-3">
                   <span className="flex gap-x-1.5">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.6666 1.33301V3.99967M5.33331 1.33301V3.99967" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.66667 2.6665H7.33333C4.81917 2.6665 3.5621 2.6665 2.78105 3.44755C2 4.2286 2 5.48568 2 7.99984V9.33317C2 11.8473 2 13.1044 2.78105 13.8854C3.5621 14.6665 4.81917 14.6665 7.33333 14.6665H8.66667C11.1808 14.6665 12.4379 14.6665 13.2189 13.8854C14 13.1044 14 11.8473 14 9.33317V7.99984C14 5.48568 14 4.2286 13.2189 3.44755C12.4379 2.6665 11.1808 2.6665 8.66667 2.6665Z" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 6.6665H14" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.99698 9.33301H8.00298M7.99698 11.9997H8.00298M10.6606 9.33301H10.6666M5.33331 9.33301H5.33929M5.33331 11.9997H5.33929" stroke="#5C6170" strokeWidth="1.73575" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="text-[12px] text-[#5C6170]">{formatDate(ticket.event_date)}</p>
                    </span> 
                   <span className="flex gap-x-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.00004 14.6663C11.6819 14.6663 14.6667 11.6816 14.6667 7.99967C14.6667 4.31778 11.6819 1.33301 8.00004 1.33301C4.31814 1.33301 1.33337 4.31778 1.33337 7.99967C1.33337 11.6816 4.31814 14.6663 8.00004 14.6663Z" stroke="#5C6170" strokeWidth="1.30181"/>
                        <path d="M7.99994 5.33301V7.99967L9.33327 9.33301" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                        <p className="text-[12px] text-[#5C6170]">{ticket.event_time_in_utc}</p>
                    </span> 
                </div>
                <div className="flex gap-x-3">
                   <div className="flex gap-x-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.66665 6.00016C9.66665 6.92063 8.92045 7.66683 7.99998 7.66683C7.07951 7.66683 6.33331 6.92063 6.33331 6.00016C6.33331 5.07969 7.07951 4.3335 7.99998 4.3335C8.92045 4.3335 9.66665 5.07969 9.66665 6.00016Z" stroke="#5C6170" strokeWidth="1.30181"/>
                        <path d="M8.83818 11.6626C8.61332 11.8791 8.31279 12.0002 8.00005 12.0002C7.68725 12.0002 7.38672 11.8791 7.16185 11.6626C5.10279 9.66736 2.34338 7.4385 3.68906 4.20265C4.41665 2.45304 6.16321 1.3335 8.00005 1.3335C9.83685 1.3335 11.5834 2.45305 12.311 4.20265C13.655 7.43443 10.9023 9.67423 8.83818 11.6626Z" stroke="#5C6170" strokeWidth="1.30181"/>
                        <path d="M11.9999 13.3335C11.9999 14.0699 10.209 14.6668 7.99988 14.6668C5.79074 14.6668 3.99988 14.0699 3.99988 13.3335" stroke="#5C6170" strokeWidth="1.30181" strokeLinecap="round"/>
                    </svg>
                    <p className="text-[12px] text-[#5C6170]">{ticket.event_location}</p>
                    </div>  
                </div>
            </div>
        </CardContent>
        <div className="px-2 -mb-1 font-inter">
            <div className="border-[#E3E3E3] border flex justify-between rounded-[4px] p-1">
                <div className="flex gap-x-1 items-center p-0.5">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.7131 5.32306C13.8225 5.21372 14.0109 5.20257 14.1217 5.32344C14.7706 6.03127 15.1298 6.55539 15.2481 7.13581C15.3161 7.46979 15.3258 7.80968 15.2767 8.14032C15.1439 9.03384 14.42 9.75781 12.972 11.2057L11.2059 12.9719C9.75799 14.4198 9.03403 15.1438 8.1405 15.2765C7.80986 15.3256 7.46997 15.316 7.13599 15.2479C6.55563 15.1296 6.03157 14.7705 5.32386 14.1217C5.20284 14.0108 5.21403 13.8222 5.32349 13.7127C5.93313 13.1031 5.90416 12.0857 5.2588 11.4403C4.61343 10.795 3.59605 10.766 2.98641 11.3757C2.87695 11.4851 2.68832 11.4963 2.57737 11.3752C1.92855 10.6676 1.56946 10.1435 1.4512 9.56313C1.38315 9.22915 1.37347 8.88926 1.4226 8.55862C1.55538 7.66509 2.27934 6.94111 3.72724 5.49321L5.49339 3.72706C6.94129 2.27915 7.66527 1.5552 8.5588 1.42241C8.88944 1.37329 9.22933 1.38297 9.56331 1.45101C10.1437 1.56929 10.6679 1.92845 11.3757 2.57741C11.4966 2.68823 11.4854 2.87663 11.376 2.98598C10.7664 3.59561 10.7954 4.61299 11.4408 5.25836C12.0861 5.90373 13.1035 5.9327 13.7131 5.32306Z" stroke="#5C6170" strokeWidth="1.04368" strokeLinejoin="round"/>
                        <path d="M13.22 10.4369L6.26215 3.479" stroke="#5C6170" strokeWidth="1.04368" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="font-semibold text-sm text-[#1E1E1E]">${ticket.price_in_usd.toFixed(2)}</p>
                </div>
               <Button variant="ticket" showIcon>Get Ticket</Button>
            </div>
        </div>
    </Card>
}