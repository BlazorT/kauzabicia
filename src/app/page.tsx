"use client";

import HomeFilters from "@/components/home/home-filters";
import HomeHeader from "@/components/home/home-header";
import HomeStores from "@/components/home/home-stores";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Spinner from "@/components/ui/spinner";
import { STATUS } from "@/constants/constants";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useStoreFiltersQuery } from "@/hooks/useStoreFiltersQuery";
import { AlertCircle, RotateCw } from "lucide-react";
import { useState } from "react";

const Home = () => {
  const { clearAllFilters, filterCount } = useRestaurantFilters();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isPending, isError, error } = useStoreFiltersQuery(searchQuery);

  const toggleFilterSheet = () => setIsFilterSheetOpen(!isFilterSheetOpen);

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[80vh] w-full">
        <div className="p-6 text-center flex flex-col items-center text-base text-muted-foreground border border-dashed rounded-xl space-y-4 shadow-md ">
          <AlertCircle size={80} className="text-red-400" />
          <p className="text-2xl font-semibold">{error?.message ?? "Error"}</p>
          <p className="text-lg text-gray-500 max-w-sm">
            {STATUS.SERVER_ERROR}
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              window.location.reload(); // Force full reload
            }}
          >
            <RotateCw />
            Reload
          </Button>
        </div>
      </div>
    );
  if (isPending) return <Spinner />;

  return (
    <div className="container mx-auto my-0">
      {/* Fixed Header */}
      <div className="fixed container mx-auto  my-0 py-2 top-0 left-0 right-0 z-30 bg-background xl:px-0">
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
      <Footer />
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
