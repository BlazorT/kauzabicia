import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import React from "react";
import { Card, CardContent } from "../ui/card";
import { getTaxAmount } from "@/utils/cartUtils";
import { useOrder } from "@/context/order-context";

const CartSummary = () => {
  const { totalPrice, items } = useCart();
  const { orderInfo } = useOrder();
  const { config } = useConfig();
  return (
    <Card className="px-2 py-2 mt-2">
      <CardContent className="px-0 space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {items?.[0]?.isDeal && (
              <span className="line-through text-sm text-primary">
                {items?.[0]?.schemeAmount?.toFixed(2)}
              </span>
            )}{" "}
            {totalPrice.toFixed(2)}
          </p>
        </div>
        {(config?.tax ?? 0) > 0 && (
          <div className="flex justify-between">
            <p>Tax</p>
            <p> {getTaxAmount(totalPrice, config?.tax ?? 0)}</p>
          </div>
        )}
        {(orderInfo.serviceCharges ?? 0) > 0 && (
          <div className="flex justify-between">
            <p>Service Charges</p>
            <p> {orderInfo.serviceCharges?.toFixed(2)}</p>
          </div>
        )}
        {orderInfo.deliveryCharges > 0 && (
          <div className="flex justify-between">
            <p>Delivery Charges</p>
            <p>{orderInfo.deliveryCharges.toFixed(2)}</p>
          </div>
        )}
        {orderInfo.tipAmount > 0 && (
          <div className="flex justify-between">
            <p>Tip</p>
            <p>{orderInfo.tipAmount.toFixed(2)}</p>
          </div>
        )}
        {orderInfo.voucherDiscount > 0 && (
          <div className="flex justify-between">
            <p>
              Voucher Discount{" "}
              <span className="text-primary text-xs">
                ({orderInfo.voucherCode})
              </span>
            </p>
            <p>- {orderInfo.voucherDiscount.toFixed(2)}</p>
          </div>
        )}
        {orderInfo.isRedeemPoints && (
          <div className="flex justify-between">
            <p>
              Points Balance{" "}
              {orderInfo.pointsRedeemed > 0 && (
                <span className="text-primary text-xs">
                  ({orderInfo.pointsRedeemed} points)
                </span>
              )}
            </p>
            <p>- {orderInfo.pointsDiscount.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
