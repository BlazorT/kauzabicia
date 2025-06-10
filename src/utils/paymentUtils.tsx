// src/utils/paymentUtils.ts
import { PAYMENT_GATEWAY, User } from "@/utils/types";
import { LOV } from "@/context/lov-context";
import { OrderInfo } from "@/context/order-context";
import { ConfigState } from "@/context/config-context";

export const isPaymentForced = (
  orderInfo: OrderInfo,
  config: ConfigState | null,
  user: User | null
) => {
  if (!config) return false;
  if (!user) return true;
  if (orderInfo.orderType == 1 && config.paidDineInOrdersOnly) return true;
  if (orderInfo.orderType == 2 && config.paidTakeAwayOrdersOnly) return true;
  if (orderInfo.orderType == 3 && config.forceOrderAfterPayment) return true;
  return false;
};

export const filterActiveGateways = (data: {
  data?: unknown;
}): PAYMENT_GATEWAY[] => {
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.filter(
    (gateway: { status: number }): gateway is PAYMENT_GATEWAY =>
      "status" in gateway && gateway.status === 1
  );
};

export const getPaymentMethods = (
  lovs: { paymentmethods?: LOV[] } | null,
  gateways: PAYMENT_GATEWAY[]
) => {
  // console.log({ orderType });
  // const isOrderType3 = orderType === 3;
  // const allowedIds = isOrderType3 ? [3] : [1];

  // const lovPaymentMethods =
  //   lovs?.paymentmethods?.filter((method) => allowedIds.includes(method.id)) ??
  //   [];

  return [...gateways];
};

export const getLovsPaymentMethods = (
  lovs: { paymentmethods?: LOV[] } | null,
  orderType: number
) => {
  const isOrderType3 = orderType === 3;
  const allowedIds = isOrderType3 ? [2, 3] : [1, 2];

  const lovPaymentMethods =
    lovs?.paymentmethods?.filter((method) => allowedIds.includes(method.id)) ??
    [];
  return lovPaymentMethods;
};
