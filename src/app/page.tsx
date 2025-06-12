"use client";

import HomeFilters from "@/components/home/home-filters";
import HomeHeader from "@/components/home/home-header";
import HomeStores from "@/components/home/home-stores";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useState } from "react";

const Home = () => {
  const { clearAllFilters, filterCount } = useRestaurantFilters();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFilterSheet = () => setIsFilterSheetOpen(!isFilterSheetOpen);

  return (
    <div className="container mx-auto my-0">
      {/* Fixed Header */}
      <div className="fixed container mx-auto my-0 py-2 top-0 left-0 right-0 z-30 bg-background xl:px-0">
        <HomeHeader setSearchQuery={setSearchQuery} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-10 mt-[6rem] lg:mt-[5rem]">
        {/* Filters (left) - hidden on small screens */}
        <div className="w-full md:max-w-1/6 hidden lg:block">
          <div className="sticky top-16 z-10">
            <HomeFilters />
          </div>
        </div>

        {/* Stores (right) */}
        <div className="w-full lg:w-3/4">
          <HomeStores
            toggleFilterSheet={toggleFilterSheet}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>

      {/* Filter Sheet for small screens */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="left" className="min-w-full">
          <div className="p-3">
            <HomeFilters />
            <div className="flex items-center justify-end gap-2">
              {filterCount > 0 && (
                <Button
                  onClick={() => {
                    clearAllFilters();
                    setIsFilterSheetOpen(false);
                  }}
                  variant={"outline"}
                >
                  Clear All
                </Button>
              )}
              <Button onClick={() => setIsFilterSheetOpen(false)}>Apply</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Home;
