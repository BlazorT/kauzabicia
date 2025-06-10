import { COLLAPSIBLE_REF } from "@/utils/types";
import { ReceiptText } from "lucide-react";
import { RefObject } from "react";
import { CollapsibleCard } from "../ui/collapsible";
import { Label } from "../ui/label";
import OrderPoints from "./order-points";
import OrderTip from "./order-tip";
import OrderVoucher from "./order-voucher";
type OrderGroupVCTProps = {
  customerCollapsibleRef: RefObject<COLLAPSIBLE_REF | null>;
};
const OrderGroupVCT = ({ customerCollapsibleRef }: OrderGroupVCTProps) => {
  return (
    <CollapsibleCard
      initialOpen={false}
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <ReceiptText />
          <Label htmlFor="orderTip">Has coupon, points & tip?</Label>
        </div>
      }
    >
      <OrderVoucher />
      <OrderPoints customerCollapsibleRef={customerCollapsibleRef} />
      <OrderTip />
    </CollapsibleCard>
  );
};

export default OrderGroupVCT;
