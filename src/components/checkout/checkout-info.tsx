import { COLLAPSIBLE_REF } from "@/utils/types";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import CartTabs from "../cart/cart-tabs";
import { Card, CardContent } from "../ui/card";
import { ErrorSnackbar } from "../ui/error-snackbar";
import DeliveryAddress from "./delivery-address";
import DeliveryOptions from "./delivery-options";
import ManagedOrder from "./managed-order";
import OrderCustomer from "./order-customer";
import OrderGroupVCT from "./order-group-vct";
import OrderGuests from "./order-guests";
import OrderNote from "./order-note";
import OrderPayment from "./order-payment";
import PlaceOrder from "./place-order";
const CheckoutInfo = () => {
  const guestsCollapsibleRef = useRef<COLLAPSIBLE_REF>(null);
  const customerCollapsibleRef = useRef<COLLAPSIBLE_REF>(null);
  const searchParams = useSearchParams();

  const saleId = searchParams.get("saleId");

  const isValidOrderEdit = saleId;
  // console.log({ items });

  return (
    <Card className="px-3 py-3 lg:max-w-full md:max-w-full sm:max-w-full">
      <CardContent className="px-0 space-y-3">
        {!isValidOrderEdit && <CartTabs />}
        {isValidOrderEdit && <ManagedOrder saleId={atob(saleId)} />}
        <ErrorSnackbar />
        <DeliveryAddress />
        <DeliveryOptions />
        <OrderGuests guestsCollapsibleRef={guestsCollapsibleRef} />
        <OrderCustomer customerCollapsibleRef={customerCollapsibleRef} />
        <OrderGroupVCT customerCollapsibleRef={customerCollapsibleRef} />
        <OrderNote />
        {!isValidOrderEdit && <OrderPayment />}
        <PlaceOrder
          guestsCollapsibleRef={guestsCollapsibleRef}
          customerCollapsibleRef={customerCollapsibleRef}
        />
      </CardContent>
    </Card>
  );
};

export default CheckoutInfo;
