// hooks/useStoreFiltersQuery.ts
import { DEFAULT_STORE_ID } from "@/constants/constants";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { organizeMenuByCategoryFlat } from "@/utils/menuUtils";
import { MenuItem } from "@/utils/types";
import moment from "moment";
import { useMemo } from "react";
import { useMenu } from "./useMenu";

export const useStoreFiltersQuery = (searchQuery: string) => {
  const { filters, clearAllFilters, filterCount } = useRestaurantFilters();
  // const { ipInfo } = useLocation();

  // const storeFiltersBody = useMemo((): STORE_FILTERS_BODY => {
  //   const location =
  //     filters?.lat && filters?.lng ? `${filters.lat},${filters.lng}` : "";

  //   const isSameCountry =
  //     filters?.country?.id === 0 ||
  //     filters?.country?.code === ipInfo?.geoplugin_countryCode;

  //   const City =
  //     location !== "" ? "" : isSameCountry ? ipInfo?.geoplugin_city ?? "" : "";

  //   const buffer =
  //     filters?.lat === Number(ipInfo?.geoplugin_latitude)
  //       ? 0
  //       : getCoverageBuffer(
  //           filters.searchRange ?? 0,
  //           filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? ""
  //         );

  //   return {
  //     buffer,
  //     City,
  //     CityId: 0,
  //     Contact: "",
  //     CountryId: filters?.country?.id ?? 0,
  //     Email: "",
  //     Keyword: "",
  //     location,
  //     MinPrice: filters.priceRange.min,
  //     MaxPrice: filters.priceRange.max,
  //     Name: "",
  //     ProductId: filters.productId ?? 0,
  //     State: ipInfo?.geoplugin_regionCode ?? "",
  //     StateId: 0,
  //     StoreId: 0,
  //     StoreTypeId:
  //       Array.isArray(filters?.storeTypeId) && filters.storeTypeId.length > 0
  //         ? filters.storeTypeId.join(",")
  //         : "",
  //     UnitId: filters?.unitId ?? 0,
  //   };
  // }, [
  //   filters?.country?.code,
  //   filters?.country?.id,
  //   filters.lat,
  //   filters.lng,
  //   filters.priceRange.max,
  //   filters.priceRange.min,
  //   filters.productId,
  //   filters.searchRange,
  //   filters.storeTypeId,
  //   filters?.unitId,
  //   ipInfo?.geoplugin_city,
  //   ipInfo?.geoplugin_countryCode,
  //   ipInfo?.geoplugin_latitude,
  //   ipInfo?.geoplugin_regionCode,
  // ]);
  //   console.log({ storeFiltersBody });

  const {
    data: menuResponse,
    isPending,
    isError,
    error,
  } = useMenu(
    DEFAULT_STORE_ID?.toString(),
    moment().format("YYYY-MM-DDTHH:mm:ss")
  );

  const categorizedMenu = useMemo(() => {
    if (!menuResponse?.data || !Array.isArray(menuResponse.data)) return [];
    // Type guard to ensure data is MenuItem[]
    if (!menuResponse.data[0] || !("productId" in menuResponse.data[0]))
      return [];

    const categorized = organizeMenuByCategoryFlat(
      menuResponse.data as MenuItem[]
    );

    return categorized;
  }, [menuResponse?.data]);

  const storeData = useMemo(
    () => menuResponse?.data ?? [],
    [menuResponse]
  ) as MenuItem[];

  const filteredMenu = useMemo(() => {
    if (!categorizedMenu) return []; // Ensure categorizedMenu is available

    // Start with the initial categorized menu
    let result = categorizedMenu;

    // Apply filters to items within each category
    result = result.map((category) => {
      let categoryItems = category.items;

      // --- Apply Search Filter ---
      if (searchQuery.trim()) {
        const lowerSearch = searchQuery.toLowerCase();
        categoryItems = (categoryItems as MenuItem[]).filter((item) => {
          // Type guard to ensure item is MenuItem
          if ("productname" in item) {
            return (
              item.productname.toLowerCase().includes(lowerSearch) ||
              (item.unitname &&
                item.unitname.toLowerCase().includes(lowerSearch)) ||
              (item.description &&
                item.description.toLowerCase().includes(lowerSearch))
            );
          }
          // If there's a DealItemType, you might want to filter by dealCode or other relevant fields

          return false;
        });
      }

      // --- Apply Price Range Filter ---
      const minPrice = filters.priceRange.min;
      const maxPrice = filters.priceRange.max;
      if (minPrice != null && maxPrice != null) {
        categoryItems = categoryItems.filter((item) => {
          // Assuming MenuItemType has unitprice. Adjust if DealItemType has a different price field.
          if ("unitprice" in item && typeof item.unitprice === "number") {
            return item.unitprice >= minPrice && item.unitprice <= maxPrice;
          }
          // Add logic for DealItemType if it has a price, e.g., item.dealPrice
          return true; // Keep if price not applicable or not found
        });
      }

      // --- Apply Category ID Filter (though items are already in categories by definition) ---
      // This filter is mostly redundant here since `categorizedMenu` already groups by category.
      // However, if `filters.storeTypeId` could refer to sub-categories or other item-level categories
      // that aren't the primary `categoryid` used for initial grouping, you might keep it.
      // For now, assuming `filters.storeTypeId` is for the main categories, this filter is applied
      // implicitly by `categorizedMenu` itself. If you only want to show *some* categories,
      // you'd filter the `result` array of categories *after* this map, or before it if you apply
      // it to the `categorizedMenu` directly.

      // Let's assume filters.storeTypeId should filter which top-level categories to display
      // rather than individual items *within* a category (since items already belong to that category).
      // This part should ideally be applied *before* mapping, or as a final filter on `result`.
      // For now, I'll place it outside the inner item filter, but keep it in mind.

      return {
        ...category,
        items: categoryItems,
      };
    });

    // --- Filter out empty categories after item-level filtering ---
    result = result.filter((category) => category.items.length > 0);

    // --- Apply Category ID Filter to top-level categories ---
    // This needs to be done *after* item-level filtering to ensure categories
    // that become empty due to other filters are already removed.
    const categoryIdFilter = filters.storeTypeId;
    if (categoryIdFilter && categoryIdFilter.length > 0) {
      result = result.filter((category) =>
        Array.isArray(categoryIdFilter)
          ? categoryIdFilter.includes(category.id)
          : category.id === categoryIdFilter
      );
    }

    // --- Apply Sorting ---
    // Sorting based on item price should be applied to items *within* each category.
    // Sorting the categories themselves is usually done by name, as in `organizeMenuByCategoryFlat`.
    const sortId = filters.sortBy;
    result = result.map((category) => {
      const sortedItems = category.items.slice(); // Create a shallow copy to sort

      if (sortId === 1) {
        // Sort by price descending (high to low)
        sortedItems.sort((a, b) => {
          const priceA =
            "unitprice" in a && typeof a.unitprice === "number"
              ? a.unitprice
              : 0;
          const priceB =
            "unitprice" in b && typeof b.unitprice === "number"
              ? b.unitprice
              : 0;
          return priceB - priceA;
        });
      } else if (sortId === 2) {
        // Sort by price ascending (low to high)
        sortedItems.sort((a, b) => {
          const priceA =
            "unitprice" in a && typeof a.unitprice === "number"
              ? a.unitprice
              : 0;
          const priceB =
            "unitprice" in b && typeof b.unitprice === "number"
              ? b.unitprice
              : 0;
          return priceA - priceB;
        });
      }
      // Add other sorting criteria here if needed

      return {
        ...category,
        items: sortedItems,
      };
    });

    return result;
  }, [
    categorizedMenu,
    searchQuery,
    filters.priceRange,
    filters.storeTypeId, // Renamed from filters.storeTypeId to be clearer
    filters.sortBy,
  ]);

  return {
    filters,
    clearAllFilters,
    filterCount,
    isPending,
    isError,
    storeData,
    filteredMenu,
    searchQuery,
    categorizedMenu,
    error,
  };
};
