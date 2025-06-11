// hooks/useStoreFiltersQuery.ts
import { DEFAULT_STORE_ID } from "@/constants/constants";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
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
  } = useMenu(
    DEFAULT_STORE_ID?.toString(),
    moment().format("YYYY-MM-DDTHH:mm:ss")
  );

  const storeData = useMemo(
    () => menuResponse?.data ?? [],
    [menuResponse]
  ) as MenuItem[];

  const filteredStores = useMemo(() => {
    // const sortId = filters.sortBy;
    // const offerId = filters.offerId;
    // const hasLocation =
    //   filters.lat && filters.lng && ipInfo?.geoplugin_countryCode;

    // const userCoords = {
    //   latitude: filters.lat ?? 0,
    //   longitude: filters.lng ?? 0,
    // };
    // const countryCode = ipInfo?.geoplugin_countryCode ?? "";

    // Step 1: Filter by search
    let result = storeData;
    if (searchQuery.trim()) {
      const lowerSearch = searchQuery.toLowerCase();
      result = result.filter((product) =>
        `${product.productname} ${product.unitname ?? ""}`
          .toLowerCase()
          .includes(lowerSearch)
      );
    }

    // Step 2: Filter by offer (e.g., has dealId)
    // if (offerId === 1) {
    //   result = result.filter((store) => store.dealId); // Only keep stores with dealId
    // }

    // // Step 3: Sort
    // if (sortId === 1) {
    //   result = result.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    // } else if (sortId === 2 && hasLocation) {
    //   result = result.slice().sort((a, b) => {
    //     const distA = haversineDistance(
    //       extractLatLong(a.gpslocation),
    //       userCoords,
    //       countryCode
    //     );
    //     const distB = haversineDistance(
    //       extractLatLong(b.gpslocation),
    //       userCoords,
    //       countryCode
    //     );
    //     return distA - distB;
    //   });
    // }

    return result;
  }, [
    searchQuery,
    storeData,
    // filters.sortBy,
    // filters.offerId, // Make sure this is included as a dependency
    // filters.lat,
    // filters.lng,
    // ipInfo,
  ]);

  return {
    filters,
    clearAllFilters,
    filterCount,
    isPending,
    isError,
    storeData,
    filteredStores,
    searchQuery,
  };
};
