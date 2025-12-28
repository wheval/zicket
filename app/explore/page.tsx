"use client";

import { tickets } from "@/lib/mock_data";
import TicketCard from "@/components/web/ticket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExplorePage() {
  const filterOptions = [
    { label: "Privacy Level", options: ["All", "Anonymous", "Verified Access"] },
    { label: "Pricing", options: ["All", "FREE", "Paid"] },
    { label: "Location", options: ["All", "Lagos", "London", "New York", "Berlin", "Singapore"] },
    { label: "Date Range", options: ["All", "Today", "This Week", "This Month"] },
    { label: "Category", options: ["All", "Tech", "Music", "Art", "Crypto"] },
  ];

  const activeFilters = [
    { id: 1, label: "Verified Access" },
    { id: 2, label: "FREE" },
    { id: 3, label: "This Week" },
  ];

  return (
    <main className="min-h-screen bg-[#F6F0FB] pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        
        {/* Filters Section */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <span className="text-lg lg:text-sm font-bold lg:font-medium text-[#172233] lg:text-[#707070] mr-2">Filter by:</span>
              <div className="lg:hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#707070" strokeWidth="2"/>
                  <path d="M12 16V12" stroke="#707070" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="#707070"/>
                </svg>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-wrap items-center gap-2 md:gap-4">
              {filterOptions.map((filter) => (
                <DropdownMenu key={filter.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-semibold text-[#6917AF] hover:opacity-80 transition-opacity">
                      {filter.label}
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill="#6917AF"/>
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-xl border-[#E4E4E4]">
                    {filter.options.map((option) => (
                      <DropdownMenuItem key={option} className="text-sm hover:bg-[#F6F0FB] cursor-pointer">
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm font-medium text-[#707070]">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#6917AF] hover:opacity-80 transition-opacity">
                    Popular
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill="#6917AF"/>
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-[#E4E4E4]">
                  <DropdownMenuItem className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Popular</DropdownMenuItem>
                  <DropdownMenuItem className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Newest</DropdownMenuItem>
                  <DropdownMenuItem className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Price: Low to High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters and Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E4E4E4] pt-6">
            <div className="flex flex-wrap items-center gap-3">
              {activeFilters.map((filter) => (
                <div 
                  key={filter.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E4E4E4] rounded-lg text-sm font-medium text-[#172233]"
                >
                  {filter.label}
                  <button className="hover:text-[#6917AF] transition-colors" aria-label={`Remove ${filter.label} filter`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="text-sm text-[#707070] font-medium hidden sm:block">
              Showing 1- 15 of 200 results
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-center">
              <TicketCard ticket={ticket} />
            </div>
          ))}
          {/* Re-using tickets to fill the grid for visual representation */}
          {tickets.slice(0, 4).map((ticket) => (
            <div key={`${ticket.id}-dup`} className="flex justify-center">
              <TicketCard ticket={ticket} />
            </div>
          ))}
        </div>

        {/* Load More and Back to Top */}
        <div className="flex flex-col items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E4E4E4] rounded-full text-sm font-semibold text-[#172233] hover:bg-gray-50 transition-colors shadow-sm">
                Show more
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill="currentColor"/>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white rounded-xl shadow-xl border-[#E4E4E4]">
              <DropdownMenuItem className="text-sm cursor-pointer">Show 30</DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer">Show 50</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center bg-white border border-[#E4E4E4] rounded-full text-[#172233] hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Back to top"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
              <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

      </div>
    </main>
  );
}

