"use client";

import { useState, useMemo } from "react";
import { tickets } from "@/lib/mock_data";
import TicketCard from "@/components/web/ticket";
import { Typography } from "@/components/web/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExplorePage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({
    "Privacy Level": "All",
    "Pricing": "All",
    "Location": "All",
    "Date Range": "All",
    "Category": "All",
  });
  const [sortBy, setSortBy] = useState("Popular");

  const filterOptions = [
    { label: "Privacy Level", options: ["All", "Anonymous", "Verified Access"] },
    { label: "Pricing", options: ["All", "FREE", "Paid"] },
    { label: "Location", options: ["All", "Lagos", "London", "New York", "Berlin", "Singapore", "Tokyo", "Mumbai", "Sydney", "Paris", "Vancouver", "Dublin"] },
    { label: "Date Range", options: ["All", "Today", "This Week", "This Month"] },
    { label: "Category", options: ["All", "Tech", "Music", "Art", "Crypto", "Workshop", "Startup", "Gaming", "Food", "AI", "Fitness"] },
  ];

  const handleFilterChange = (label: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const removeFilter = (label: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [label]: "All",
    }));
  };

  const activeFilters = useMemo(() => {
    return Object.entries(selectedFilters)
      .filter(([, value]) => value !== "All")
      .map(([label, value]) => ({ label, value }));
  }, [selectedFilters]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Filter by Privacy Level
    if (selectedFilters["Privacy Level"] === "Anonymous") {
      result = result.filter((t) => t.anonymous);
    } else if (selectedFilters["Privacy Level"] === "Verified Access") {
      result = result.filter((t) => t.event_verified);
    }

    // Filter by Pricing
    if (selectedFilters["Pricing"] === "FREE") {
      result = result.filter((t) => !t.paid || t.price_in_usd === 0);
    } else if (selectedFilters["Pricing"] === "Paid") {
      result = result.filter((t) => t.paid && t.price_in_usd > 0);
    }

    // Filter by Location
    if (selectedFilters["Location"] !== "All") {
      result = result.filter((t) => 
        t.event_location.toLowerCase().includes(selectedFilters["Location"].toLowerCase())
      );
    }

    const now = 1734614400; // Fixed "now" for consistency (Dec 19, 2025)
    const oneDay = 24 * 60 * 60;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    // Filter by Date Range (Mock logic as event_date is future timestamps)
    if (selectedFilters["Date Range"] !== "All") {

      if (selectedFilters["Date Range"] === "Today") {
        result = result.filter((t) => t.event_date <= now + oneDay);
      } else if (selectedFilters["Date Range"] === "This Week") {
        result = result.filter((t) => t.event_date <= now + oneWeek);
      } else if (selectedFilters["Date Range"] === "This Month") {
        result = result.filter((t) => t.event_date <= now + oneMonth);
      }
    }

    // Filter by Category (Matching against title since mock data lacks category)
    if (selectedFilters["Category"] !== "All") {
      result = result.filter((t) => 
        t.title.toLowerCase().includes(selectedFilters["Category"].toLowerCase())
      );
    }

    // Sort
    if (sortBy === "Popular") {
      result.sort((a, b) => b.no_of_attendees - a.no_of_attendees);
    } else if (sortBy === "Newest") {
      result.sort((a, b) => a.event_date - b.event_date); // Soonest first
    } else if (sortBy === "Price: Low to High") {
      result.sort((a, b) => a.price_in_usd - b.price_in_usd);
    }

    return result;
  }, [selectedFilters, sortBy]);

  return (
    <main className="min-h-screen bg-white pt-30 lg:pt-40 2xl:pt-48 pb-20">
      <div className="container mx-auto px-4 lg:px-8 xl:px-12">
        {/* Filters Section */}
        <div className="flex flex-col font-inter gap-6 mb-2 lg:mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <span className="text-[#101928] hidden md:block mr-2">Filters:</span>
              <span className="text-[#101928] font-bold font-sans text-lg md:hidden mr-2">Filter by:</span>
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Open filters"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29.3332 15.9998C29.3332 8.63604 23.3636 2.6665 15.9998 2.6665C8.63604 2.6665 2.6665 8.63604 2.6665 15.9998C2.6665 23.3636 8.63604 29.3332 15.9998 29.3332C23.3636 29.3332 29.3332 23.3636 29.3332 15.9998Z" stroke="#141B34" strokeWidth="2"/>
                  <path d="M12 16H20.0001" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.3335 20.6665H18.6668" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.6665 11.3335H21.3332" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="hidden lg:flex flex-wrap items-center gap-2 md:gap-4">
              {filterOptions.map((filter) => (
                <DropdownMenu key={filter.label}>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity ${selectedFilters[filter.label] !== "All" ? 'text-[#6917AF]' : 'text-[#101928]'}`}>
                      {selectedFilters[filter.label] !== "All" ? selectedFilters[filter.label] : filter.label}
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill={selectedFilters[filter.label] !== "All" ? "#6917AF" : "#101928"}/>
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-white rounded-xl shadow-xl border-[#E4E4E4] max-h-60 overflow-y-auto">
                    {filter.options.map((option) => (
                      <DropdownMenuItem 
                        key={option} 
                        className="text-sm hover:bg-[#F6F0FB] cursor-pointer"
                        onClick={() => handleFilterChange(filter.label, option)}
                      >
                        {option}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[#101928]">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#6917AF] hover:opacity-80 transition-opacity">
                    {sortBy}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.34545 7.27366L8.85765 13.4028C9.4994 14.0068 10.5004 14.0068 11.1422 13.4028L17.6544 7.27367C17.9895 6.95824 18.0055 6.43084 17.6901 6.0957C17.3747 5.76055 16.8473 5.74457 16.5121 6.06L9.99992 12.1891L3.48773 6.06C3.15258 5.74457 2.62518 5.76055 2.30975 6.09569C1.99432 6.43084 2.01031 6.95823 2.34545 7.27366Z" fill="#6917AF"/>
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-[#E4E4E4]">
                  <DropdownMenuItem onClick={() => setSortBy("Popular")} className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Popular</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Newest")} className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Price: Low to High")} className="text-sm hover:bg-[#F6F0FB] cursor-pointer">Price: Low to High</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters and Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F0F2F5] pt-6">
            <div className="flex flex-wrap items-center gap-3">
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <div 
                    key={filter.label}
                    className="flex items-center gap-2 px-2 py-1 bg-white border border-[#6917AF] rounded-sm text-sm font-medium text-[#475367]"
                  >
                    {/* <span className="text-[#707070]">{filter.label}:</span> */}
                     {filter.value}
                    <button 
                      className="hover:text-[#6917AF] transition-colors" 
                      aria-label={`Remove ${filter.value} filter`}
                      onClick={() => removeFilter(filter.label)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                ""
              )}
              {activeFilters.length > 0 && (
                <button 
                  onClick={() => setSelectedFilters({
                    "Privacy Level": "All",
                    "Pricing": "All",
                    "Location": "All",
                    "Date Range": "All",
                    "Category": "All",
                  })}
                  className="text-sm font-semibold text-[#6917AF] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="text-sm text-[#101928] hidden sm:block">
              Showing {filteredTickets.length} results
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="flex justify-center">
                <TicketCard ticket={ticket} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Typography variant="h4" className="text-[#707070]">No tickets found matching your filters.</Typography>
              <button 
                onClick={() => setSelectedFilters({
                  "Privacy Level": "All",
                  "Pricing": "All",
                  "Location": "All",
                  "Date Range": "All",
                  "Category": "All",
                })}
                className="mt-4 text-[#6917AF] font-bold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Back to Top */}
        {filteredTickets.length > 4 && (
          <div className="flex flex-col items-center gap-8">
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
        )}

      </div>

      {/* Mobile Filter Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${isMobileFilterOpen ? 'opacity-100 visible' : 'opacity-0 pointer-events-none invisible'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
        <div 
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-white transition-transform duration-300 shadow-2xl flex flex-col ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-6 border-b border-[#F0F2F5]">
            <h2 className="text-xl font-bold text-[#101928]">Filters</h2>
            <button 
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close filters"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#101928" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Filter Groups */}
            {filterOptions.map((filter) => (
              <div key={filter.label} className="space-y-4">
                <h3 className="text-sm font-bold text-[#101928] uppercase tracking-wider">{filter.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange(filter.label, option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedFilters[filter.label] === option
                          ? 'bg-[#6917AF] text-white'
                          : 'bg-[#F0F2F5] text-[#475367] hover:bg-[#E4E7EC]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Sort Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#101928] uppercase tracking-wider">Sort By</h3>
              <div className="flex flex-col gap-2">
                {["Popular", "Newest", "Price: Low to High"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`flex items-center justify-between w-full p-4 rounded-xl text-left text-sm font-semibold transition-all ${
                      sortBy === option
                        ? 'bg-[#F6F0FB] text-[#6917AF] ring-1 ring-inset ring-[#6917AF]/20'
                        : 'bg-white text-[#101928] border border-[#F0F2F5] hover:border-[#6917AF]/20'
                    }`}
                  >
                    {option}
                    {sortBy === option && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6666 5L7.49992 14.1667L3.33325 10" stroke="#6917AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[#F0F2F5] bg-gray-50">
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setSelectedFilters({
                    "Privacy Level": "All",
                    "Pricing": "All",
                    "Location": "All",
                    "Date Range": "All",
                    "Category": "All",
                  });
                  setSortBy("Popular");
                }}
                className="flex-1 px-6 py-3 border border-[#E4E7EC] rounded-xl text-sm font-bold text-[#475367] bg-white hover:bg-gray-50 transition-colors"
              >
                Reset All
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 px-6 py-3 bg-[#6917AF] rounded-xl text-sm font-bold text-white hover:bg-[#581292] transition-colors shadow-lg shadow-[#6917AF]/20"
              >
                Show {filteredTickets.length} Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
