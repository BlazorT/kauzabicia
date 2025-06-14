import { menuService } from "@/services/menuService";
import { QUERY_KEYS } from "@/utils/queryKeys";
import { STORE_FILTERS_BODY } from "@/utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useMenu = (
  storeId: string,
  dateFrom?: string,
  productDetailId?: string,
  status: string = "1"
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MENU, storeId, productDetailId ?? "0"],
    queryFn: () =>
      menuService.getMenu({
        storeId,
        dateFrom: dateFrom ?? new Date().toISOString(),
        id: productDetailId ?? "0",
        status,
      }),
    enabled: Boolean(storeId),
    staleTime: 1 * (productDetailId ? 10 : 60) * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 1 * (productDetailId ? 10 : 60) * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useStore = (storeId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.STORE, storeId],
    queryFn: () => menuService.getStore(storeId),
    enabled: Boolean(storeId),
    staleTime: 5 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useFilterStores = (storeFilterBody: STORE_FILTERS_BODY) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FILTERED_STORES, storeFilterBody],
    queryFn: () => menuService.getFilterStores(storeFilterBody),
    enabled: Boolean(storeFilterBody),
    staleTime: 1 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 1 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetTable = (storeId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TABLES, storeId],
    queryFn: () => menuService.getTables(storeId),
    enabled: Boolean(storeId),
    staleTime: 0.5 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 0.5 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetDealz = (storeId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DEALS, storeId],
    queryFn: () => menuService.getDeals(storeId),
    enabled: Boolean(storeId),
    staleTime: 5 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetStoreReviews = (storeId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, storeId],
    queryFn: () => menuService.getStoreReviews(storeId),
    enabled: Boolean(storeId),
    staleTime: 5 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 5 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetDealDetail = (dealId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DEAL_DETAIL, dealId],
    queryFn: () => menuService.getDealDetail(dealId),
    enabled: Boolean(dealId),
    staleTime: Infinity, // Never stale, so no background refetches
    refetchOnMount: false, // Optional: don’t refetch when component remounts
    refetchOnWindowFocus: true, // Optional: avoid refetch on focus (web only)
  });
};

export const useGetAllMenus = (storeId?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALL_MENUS],
    queryFn: () => menuService.getAllMenus(storeId),
    staleTime: 30 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 30 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetStoreProducts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.STORE_PRODUCTS],
    queryFn: () => menuService.getStoreProducts(),
    staleTime: 30 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 30 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useGetStoreMenus = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.STORE_MENUS],
    queryFn: () => menuService.getStoreMenu(),
    staleTime: 60 * 60 * 1000, // 1 hour: data is fresh for this duration
    refetchInterval: 60 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};
export const useGetUnits = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNITS],
    queryFn: () => menuService.getUnits(),
    staleTime: 60 * 60 * 1000, // 1 hour: data is fresh for this duration
    refetchInterval: 60 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useAddToFavorite = () => {
  return useMutation({
    mutationFn: menuService.addStoreProductToFavorite,
  });
};
export const useAddUpdateProduct = () => {
  return useMutation({
    mutationFn: menuService.addUpdateProduct,
  });
};

export const useCancelTableBooking = () => {
  return useMutation({
    mutationFn: menuService.cancelTableBookings,
  });
};
