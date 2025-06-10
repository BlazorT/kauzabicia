import { USER_ROLE } from "@/constants/constants";
import { useAuth } from "@/context/auth-context";
import { getOrCreateSessionId } from "@/lib/utils";
import { orderService } from "@/services/orderService";
import { QUERY_KEYS } from "@/utils/queryKeys";
import { useMutation, useQuery } from "@tanstack/react-query";
import moment from "moment";

export const useVerifyVoucher = () => {
  return useMutation({
    mutationFn: orderService.verifyVoucher,
  });
};

export const useGetPoints = () => {
  return useMutation({
    mutationFn: orderService.getPoints,
  });
};

export const usePaymentGateways = (storeId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_GATEWAYS, storeId],
    queryFn: () => orderService.getPaymentGateways({ storeId }),
    enabled: Boolean(storeId),
    staleTime: 1 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 1 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const getOrdersQueryKey = (createdBy: string, storeId: string) => {
  const appuserid = getOrCreateSessionId();

  return [QUERY_KEYS.ORDERS, createdBy, appuserid, storeId];
};

export const useFetchOrders = (createdBy: string) => {
  const appuserid = getOrCreateSessionId();
  const { user } = useAuth();
  const body = {
    id: "0",
    createdBy: user?.roleId == USER_ROLE.USER ? createdBy : "0",
    storeid: user?.roleId == USER_ROLE.USER ? "0" : user?.storeId?.toString(),
    appuserid,
    city: "",
    currencycode: "",
    remarks: "",
    salesinvoicecode: "",
    dateFrom: moment().utc().subtract(24, "hour").format(),
    dateTo: moment().utc().format(),
    keyword: "",
  };
  // console.log({ body, user });
  return useQuery({
    queryKey: getOrdersQueryKey(createdBy, body.storeid ?? "0"),
    queryFn: () => orderService.getOrders(body),
    enabled: !!appuserid,
    staleTime: 1 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 1 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const useFetchOrderDetails = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_DETAIL, id],
    queryFn: () => orderService.getOrderDetails(id),
    enabled: Boolean(id),
    staleTime: 1 * 60 * 1000, // 5 minutes: data is fresh for this duration
    refetchInterval: 1 * 60 * 1000, // refetch every 5 minutes
    refetchIntervalInBackground: true, // optional for React web; no effect on mobile when app is in background
  });
};

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: orderService.placeOrder,
  });
};

export const useUpdateOrder = () => {
  return useMutation({
    mutationFn: orderService.updateOrder,
  });
};

export const usePostReview = () => {
  return useMutation({
    mutationFn: orderService.postReview,
  });
};

export const useJazzCashPayment = () => {
  return useMutation({
    mutationFn: orderService.jazzCashPayment,
  });
};

export const useJazzCashInquiry = () => {
  return useMutation({
    mutationFn: orderService.jazzCashInquiry,
  });
};
