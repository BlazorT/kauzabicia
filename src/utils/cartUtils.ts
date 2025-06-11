import { CartItem } from "@/context/cart-context";
import { ConfigState } from "@/context/config-context";
import { OrderInfo } from "@/context/order-context";

export const getTaxAmount = (price: number, tax: number) => {
  return (price * (tax / 100)).toFixed(2);
};
export const getTotalOrderAmount = (
  price: number,
  config: ConfigState | null,
  orderInfo: OrderInfo
) => {
  if (!config) return "0.00";
  let taxAmount = 0;
  let serviceCharges = 0;
  let deliveryCharges = 0;
  let voucherDiscount = 0;
  let pointsDiscount = 0;
  let tipAmount = 0;
  taxAmount = parseFloat(getTaxAmount(price, config.tax ?? 0));
  if (orderInfo.deliveryCharges > 0) {
    deliveryCharges = orderInfo.deliveryCharges;
  }
  if (orderInfo.serviceCharges > 0) {
    serviceCharges = orderInfo.serviceCharges;
  }
  if (orderInfo.voucherDiscount > 0) {
    voucherDiscount = orderInfo.voucherDiscount;
  }
  if (orderInfo.isRedeemPoints) {
    pointsDiscount = orderInfo.pointsDiscount;
  }
  if (orderInfo.tipAmount > 0) {
    tipAmount = orderInfo.tipAmount;
  }
  // console.log({
  //   price,
  //   taxAmount,
  //   serviceCharges,
  //   voucherDiscount,
  //   tipAmount,
  //   pointsDiscount,
  // });

  return (
    price +
    taxAmount +
    serviceCharges +
    tipAmount +
    deliveryCharges -
    voucherDiscount -
    pointsDiscount
  ).toFixed(2);
};
export const getPayableAmount = (
  price: number,
  config: ConfigState | null,
  orderInfo: OrderInfo
) => {
  if (!config) return "0.00";
  let taxAmount = 0;
  let serviceCharges = 0;
  let deliveryCharges = 0;
  let tipAmount = 0;

  taxAmount = parseFloat(getTaxAmount(price, config.tax ?? 0));
  if (orderInfo.orderType === 1) {
    serviceCharges = parseFloat(
      getTaxAmount(price, config.serviceCharges ?? 0)
    );
  }
  if (orderInfo.orderType === 3 && orderInfo.deliveryCharges > 0) {
    deliveryCharges = orderInfo.deliveryCharges;
  }

  if (orderInfo.tipAmount > 0) {
    tipAmount = orderInfo.tipAmount;
  }

  return (
    price +
    taxAmount +
    serviceCharges +
    tipAmount +
    deliveryCharges
  ).toFixed(2);
};

export const getTotalDiscount = (item: CartItem) => {
  let discount;
  if (item?.offerPerc > 0 && (item?.quantity ?? 1) >= item?.offerQty) {
    discount = (item.unitprice * item?.offerPerc) / 100;
  } else {
    discount = item.linediscount;
  }
  return ((discount ?? 0) * (item.quantity ?? 1))?.toFixed(2);
};
export const getTotalAfterDiscount = (item: CartItem) => {
  const discount = parseFloat(getTotalDiscount(item) ?? "0");
  console.log(discount, item.unitprice - discount);

  return ((item.unitprice - discount) * item.quantity)?.toFixed(2);
};

export const calculateItemTotal = (item: CartItem) => {
  let discount;
  if (item?.offerPerc > 0 && (item?.quantity ?? 1) >= item?.offerQty) {
    discount = (item.unitprice * item?.offerPerc) / 100;
  } else {
    discount = item.linediscount;
  }

  const subtotal =
    (item.unitprice - (discount ?? item.linediscount)) * (item.quantity ?? 1); // Calculate subtotal
  const taxAmount = (item.tax / 100) * subtotal; // Calculate tax based on subtotal
  return (subtotal + taxAmount).toFixed(2); // Return total = Subtotal + Tax, formatted as float
};

export const getMaxKitchenTime = (products: CartItem[]) => {
  if (!Array.isArray(products) || products.length === 0) {
    return 0; // Return 0 if products array is empty or not an array
  }

  return products.reduce((maxTime, product) => {
    const kitchenTime = product.kitchenTimeInMins || 0; // Default to 0 if kitchenTimeInMins is not present
    return Math.max(maxTime, kitchenTime);
  }, 0);
};

export const calculateEachProductTax = (product: CartItem) => {
  let tax = 0;
  if (product.tax > 0) {
    const subtotal =
      (product.unitprice - product.linediscount) * product.quantity; // Calculate subtotal
    const taxAmount = (product.tax / 100) * subtotal; // Calculate tax based on subtotal
    tax = parseFloat(taxAmount.toFixed(2));
  }
  return tax;
};
