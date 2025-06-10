// utils/getOrderDelayColor.ts
import moment from "moment";
import { OrderProduct } from "./types";

export function getOrderDelayColor(
  requireTime?: string,
  deliveryTime?: string
): { color: string; label: string } {
  const now = moment();
  const delivery = moment(deliveryTime);
  const elapsed = now.diff(delivery, "minutes");

  if (elapsed <= 0 || elapsed < 30)
    return { color: "bg-green-500", label: "On Time" };
  if (elapsed < 40) return { color: "bg-yellow-400", label: "10m Delay" };
  if (elapsed < 50) return { color: "bg-orange-500", label: "20m Delay" };
  if (elapsed < 60) return { color: "bg-red-500", label: "30m Delay" };
  return { color: "bg-rose-600", label: "60m+ Delay" };
}

export const calculateTotal = (product: OrderProduct) => {
  //
  const totalPrice =
    (product.saleRate - product.lineDiscount) * product.totalLoadedQty +
    product.tax;

  return totalPrice.toFixed(2);
};

export const getDueAmount = (product: OrderProduct) => {
  //
  const totalPrice =
    product.payableBill - (product.voucherAmount + product.pointsAmount);

  return totalPrice.toFixed(2);
};

export const getDealSubTotal = (product: OrderProduct) => {
  const {
    payableBill = 0,
    taxAmount = 0,
    voucherAmount = 0,
    pointsAmount = 0,
    serviceCharges = 0,
    deliveryCharges = 0,
    tipAmount = 0,
    netDiscount = 0,
  } = product;

  return (
    payableBill -
    voucherAmount -
    pointsAmount -
    serviceCharges -
    deliveryCharges -
    taxAmount -
    tipAmount +
    netDiscount
  );
};

export const getItemsTotal = (orderItems: OrderProduct[]) => {
  let total = 0;
  if (orderItems.length > 0) {
    orderItems?.forEach((item) => {
      total += parseFloat(calculateTotal(item));
    });
    return total.toFixed(2);
  }
  return total.toFixed(2);
};
