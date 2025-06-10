"use client";

import { useAlert } from "@/context/alert-context";
import { CartItem as CartItemType, useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { useDistanceAndAddressInfo } from "@/hooks/useDistanceAndAddressInfo";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import CartItem from "./cart-item";
import CartSummary from "./cart-summary";
import CartTabs from "./cart-tabs";

export default function CartSidebar({ saleId }: { saleId: string | null }) {
  const {
    items,
    totalItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();
  // console.log(items)
  const { config } = useConfig();
  const { lovs } = useLOV();
  const { storeData } = useStoreInfo(config?.storeId?.toString() ?? "");
  const { showAlert } = useAlert();
  const { orderInfo, resetOrderInfo } = useOrder();
  const { isFetching } = useDistanceAndAddressInfo();

  const currencyCode = (
    <span
      dangerouslySetInnerHTML={{
        __html:
          lovs?.currencies?.find((c) => c.id === storeData?.store?.currencyId)
            ?.code ?? items[0]?.currencycode,
      }}
    />
  );

  // console.log(currencyCode, lovs?.currencies);
  const router = useRouter();

  const onClearCart = () => {
    showAlert({
      title: "Clear Cart",
      description: "Are you sure you want to clear your cart?",
      confirmText: "Clear Cart",
      cancelText: "Cancel",
      onConfirm: () => {
        clearCart();
        resetOrderInfo();
      },
    });
  };

  const onCheckout = () => {
    if (saleId) {
      router.replace(`/checkout/?saleId=${btoa(saleId)}`);
    } else {
      router.push("/checkout/");
    }
  };
  if (items.length === 0) return null;
  return (
    <>
      {/* Mobile: summary bar triggers cart sheet */}
      <Sheet>
        {items.length > 0 && (
          <SheetTrigger asChild>
            <div className="z-1 lg:hidden fixed bottom-5 left-5 right-5 h-14 bg-primary border-t p-3 shadow-inner flex items-center justify-between rounded-lg">
              <span className="text-sm font-medium text-primary-foreground">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
              <button
                className="text-sm font-medium text-primary-foreground"
                aria-label="Open cart"
              >
                View Cart
              </button>
              <span className="text-sm font-semibold text-primary-foreground">
                {currencyCode}{" "}
                {getTotalOrderAmount(totalPrice, config, orderInfo)}
              </span>
            </div>
          </SheetTrigger>
        )}
        <SheetContent
          side="right"
          className="p-0 pt-11 bg-card backdrop-blur-md w-full max-w-full sm:w-full lg:max-w-full md:max-w-full border-none flex flex-col"
          style={{ height: "100dvh" }}
          aria-description="cart-sheet"
          aria-describedby="cart-sheet"
        >
          <DialogTitle className="hidden"></DialogTitle>

          {/* Full cart sidebar in sheet */}
          <div className="flex flex-col h-full">
            {/* Scrollable content area with padding at bottom */}
            <div className="flex-1 overflow-y-auto pb-24">
              {!saleId && <CartTabs />}
              <div className="p-4 space-y-4">
                {items.length === 0 ? (
                  <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {items.map((item: CartItemType, index: number) => (
                        <div key={item.productDetailId}>
                          <CartItem
                            item={item}
                            increase={() =>
                              increaseQuantity(item.productDetailId)
                            }
                            decrease={() =>
                              decreaseQuantity(item.productDetailId)
                            }
                            remove={() => removeItem(item.productDetailId)}
                          />
                          {items.length - 1 !== index && <Separator />}
                        </div>
                      ))}
                    </div>
                    <CartSummary />
                  </>
                )}
              </div>
            </div>

            {/* Fixed footer with safe area padding */}
            <div className="border-t p-4 bg-background sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
              <div className="flex justify-between">
                <p className="text-lg text-foreground">
                  Total{" "}
                  <span className="text-muted-foreground">
                    (incl. fees and tax)
                  </span>
                </p>
                <p className="text-lg font-semibold">
                  {currencyCode}{" "}
                  {getTotalOrderAmount(totalPrice, config, orderInfo)}
                </p>
              </div>
              <div className="flex mt-4 gap-2">
                <Button
                  variant="outline"
                  className="h-12 text-lg flex-1"
                  onClick={onClearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  onClick={onCheckout}
                  disabled={isFetching}
                  className="flex-1 text-lg h-12"
                  variant="default"
                >
                  {isFetching ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Checkout"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-1/3 lg:sticky lg:top-12 bg-card rounded-lg shadow-md max-h-[calc(100vh-14rem)] border-1">
        <div className="flex flex-col h-full p-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center">
              Your cart is empty.
            </p>
          ) : (
            <>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {!saleId && <CartTabs />}
                <div>
                  {items.map((item, index) => (
                    <div key={item.productDetailId}>
                      <CartItem
                        item={item}
                        increase={() => increaseQuantity(item.productDetailId)}
                        decrease={() => decreaseQuantity(item.productDetailId)}
                        remove={() => removeItem(item.productDetailId)}
                      />
                      {items.length - 1 !== index && <Separator />}
                    </div>
                  ))}
                  <CartSummary />
                </div>
              </div>

              {/* Fixed footer */}
              <div className="pt-4 mt-4">
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <p className="text-lg text-foreground">
                    Total{" "}
                    <span className="text-muted-foreground">
                      (incl. fees and tax)
                    </span>
                  </p>
                  <p className="text-lg font-semibold">
                    {currencyCode}{" "}
                    {getTotalOrderAmount(totalPrice, config, orderInfo)}
                  </p>
                </div>
                <div className="flex mt-4 gap-2">
                  <Button
                    variant="outline"
                    className="h-12 text-lg flex-1"
                    onClick={onClearCart}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    onClick={onCheckout}
                    disabled={isFetching}
                    className="flex-1 text-lg h-12"
                    variant="default"
                  >
                    {isFetching ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Checkout"
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
