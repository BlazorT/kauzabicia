// context/RestaurantFiltersContext.tsx
"use client";
import { MAX_PRICE, MIN_PRICE } from "@/constants/constants";
import { RestaurantFilters } from "@/utils/types";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

const defaultFilters: RestaurantFilters = {
  country: null,
  address: "",
  lat: null,
  lng: null,
  searchRange: null,
  productId: null,
  unitId: null,
  storeTypeId: null,
  offerId: null,
  priceRange: {
    min: MIN_PRICE,
    max: MAX_PRICE,
  },
  sortBy: 1,
};

type RestaurantFiltersContextType = {
  filters: RestaurantFilters;
  setFilters: (filters: RestaurantFilters) => void;
  updateFilter: <K extends keyof RestaurantFilters>(
    key: K,
    value: RestaurantFilters[K]
  ) => void;
  clearAllFilters: () => void;
  filterCount: number;
};

const RestaurantFiltersContext = createContext<
  RestaurantFiltersContextType | undefined
>(undefined);

export const RestaurantFiltersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [filters, setFilters] = useState<RestaurantFilters>(defaultFilters);

  const updateFilter = <K extends keyof RestaurantFilters>(
    key: K,
    value: RestaurantFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    updateFilter("storeTypeId", []);
    updateFilter("productId", 0);
    updateFilter("unitId", 0);
    updateFilter("offerId", 0);
    updateFilter("priceRange", { min: MIN_PRICE, max: MAX_PRICE });
  };

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.productId) {
      count++;
    }
    if (filters.offerId) {
      count++;
    }
    if (
      filters.storeTypeId !== null &&
      (Array.isArray(filters.storeTypeId)
        ? filters.storeTypeId.length > 0
        : true)
    ) {
      count++;
    }
    if (
      filters.priceRange.min !== MIN_PRICE ||
      filters.priceRange.max !== MAX_PRICE
    ) {
      count++;
    }
    return count;
  }, [filters]);

  return (
    <RestaurantFiltersContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        clearAllFilters,
        filterCount,
      }}
    >
      {children}
    </RestaurantFiltersContext.Provider>
  );
};

export const useRestaurantFilters = (): RestaurantFiltersContextType => {
  const context = useContext(RestaurantFiltersContext);
  if (!context) {
    throw new Error(
      "useRestaurantFilters must be used within a RestaurantFiltersProvider"
    );
  }
  return context;
};
