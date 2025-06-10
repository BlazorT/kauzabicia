"use client";

import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import PriceFilters from "./price-filter";
import ProductFilters from "./product-filters";
import SortFilters from "./sort-filters";
import StoreTypeFilter from "./store-type-filter";
import OfferFilter from "./offer-filters";

const HomeFilters = () => {
  const { clearAllFilters, filterCount } = useRestaurantFilters();
  return (
    <div className="space-y-3 h-[calc(100dvh-5rem)]  overflow-x-hidden px-1">
      <div className="flex items-center justify-between">
        <p className="font-bold">Filters</p>
        {filterCount > 0 && (
          <p
            className="text-sm text-muted-foreground cursor-pointer hidden md:block"
            onClick={clearAllFilters}
          >
            Clear all
          </p>
        )}
      </div>
      <SortFilters />
      <OfferFilter />
      <ProductFilters />
      <StoreTypeFilter />
      <PriceFilters />
    </div>
  );
};

export default HomeFilters;
