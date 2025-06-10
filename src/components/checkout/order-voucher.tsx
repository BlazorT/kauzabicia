import { useCart } from "@/context/cart-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useOrder } from "@/context/order-context";
import { useVerifyVoucher } from "@/hooks/useOrder";
import { RESPONSE, VOUCHER_RESPONSE } from "@/utils/types";
import { Loader2, TicketPercent } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CollapsibleCard } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function OrderVoucher() {
  const { orderInfo, setOrderInfo } = useOrder();
  const { items, totalPrice } = useCart();
  const { setError } = useError();
  const { mutate: verifyVoucher, isPending } = useVerifyVoucher();

  const [voucher, setVoucher] = useState<string>("");

  const handleVerifyVoucher = () => {
    if (!voucher) {
      setError({
        title: "Warning",
        message: "Please enter a voucher code",
        variant: ErrorVariant.Warning,
      });
      return;
    }
    verifyVoucher(
      { voucher, storeId: items[0]?.storeId },
      {
        onSuccess: (data) => {
          validateVoucherResponse(data);
        },
      }
    );
  };

  const validateVoucherResponse = (data: RESPONSE) => {
    if (data && data.status !== true) {
      setError({
        title: "Error",
        message: data.message || "Something went wrong",
        variant: ErrorVariant.Error,
      });
      return;
    }
    if (data && !data.data) {
      setError({
        title: "Error",
        message: "Voucher not found",
        variant: ErrorVariant.Error,
      });
      return;
    }
    applyVoucher(data);
  };

  const applyVoucher = (data: RESPONSE) => {
    const {
      minOrderAmount,
      offerPerc,
      offerFixedAmount,
      applicableOnAllProducts,
    } = data.data as VOUCHER_RESPONSE;

    if (totalPrice < minOrderAmount) {
      setError({
        title: "Error",
        message: `For voucher ${voucher} minimum order amount should be ${items[0].currencycode} ${minOrderAmount}`,
        variant: ErrorVariant.Error,
      });
      return;
    }
    if (offerPerc) {
      let calculateVoucher = 0;
      if (applicableOnAllProducts) {
        let total = 0;
        items.map((item) => {
          if (item?.linediscount === 0) {
            const subtotal = item.unitprice * (item.quantity ?? 1); // Calculate subtotal
            const taxAmount = (item.tax / 100) * subtotal; // Calculate tax based on subtotal
            total = total + parseFloat((subtotal + taxAmount).toFixed(2));
          }
        });
        calculateVoucher = (total * offerPerc) / 100;
      } else {
        calculateVoucher = (totalPrice * offerPerc) / 100;
      }
      if (calculateVoucher > totalPrice) {
        setError({
          title: "Error",
          message: `Voucher of amount ${calculateVoucher} is more than total amount.`,
          variant: ErrorVariant.Error,
        });
        return;
      }
      setOrderInfo((prev) => ({
        ...prev,
        voucherDiscount: calculateVoucher,
        paidAmount: calculateVoucher,
        voucherCode: voucher,
      }));
    } else if (offerFixedAmount > 0) {
      if (offerFixedAmount > totalPrice) {
        setError({
          title: "Error",
          message: `Voucher of amount ${offerFixedAmount} is more than total amount.`,
          variant: ErrorVariant.Error,
        });
        return;
      }
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
      setError({
        title: "Success",
        message: `${data.message} <b>Voucher of amount ${items[0].currencycode} ${offerFixedAmount} has been applied successfully</b>`,
        variant: ErrorVariant.Success,
      });
      setOrderInfo((prev) => ({
        ...prev,
        voucherDiscount: offerFixedAmount,
        paidAmount: offerFixedAmount,
        voucherCode: voucher,
      }));
    }
  };
  const handleRemoveVoucher = () => {
    setOrderInfo((prev) => ({
      ...prev,
      voucherDiscount: 0,
      paidAmount: 0,
      voucherCode: "",
    }));
  };

  if (orderInfo.isRedeemPoints) return null;
  if (items?.[0]?.isDeal) return null;

  return (
    <CollapsibleCard
      className="bg-secondary"
      initialOpen={false}
      showHelperText={false}
      header={
        <div className="flex items-center gap-2 bg-secondary">
          <TicketPercent />
          <Label htmlFor="orderVoucher">Have Voucher | Coupon</Label>
          {orderInfo.voucherDiscount > 0 && (
            <span className="text-xs text-primary font-medium">
              Voucher of amount {items[0].currencycode}{" "}
              {orderInfo.voucherDiscount} has been applied successfully
            </span>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-2 bg-secondary">
        {orderInfo.voucherDiscount > 0 ? (
          <p className="text-primary">
            Voucher of amount {items[0].currencycode}{" "}
            {orderInfo.voucherDiscount} has been applied successfully
          </p>
        ) : (
          <Input
            id="orderVoucher"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            placeholder="Voucher e.g. DE123456"
            maxLength={10}
          />
        )}
        {orderInfo.voucherDiscount > 0 ? (
          <Button
            variant="destructive"
            size={"sm"}
            onClick={handleRemoveVoucher}
          >
            Remove
          </Button>
        ) : (
          <Button variant="outline" onClick={handleVerifyVoucher}>
            {isPending ? <Loader2 className="animate-spin" /> : "Apply"}
          </Button>
        )}
      </div>
    </CollapsibleCard>
  );
}
