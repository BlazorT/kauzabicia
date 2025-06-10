import { OrderProduct } from "@/utils/types";
import { Card, CardContent } from "../ui/card";
import { Loader2, NotepadText } from "lucide-react";
import { Button } from "../ui/button";
import { printInvoice } from "@/utils/printInvoice";
import { useMemo, useState } from "react";
import { useLOV } from "@/context/lov-context";
import { useConfig } from "@/context/config-context";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { API_URL } from "@/services/apiClient";
import moment from "moment";
import { CustomerInfo } from "@/components/order/order-detail";
import { calculateTotal } from "@/utils/orderUtils";
import Image from "next/image";

type OrderSummaryProps = {
  orderItems: OrderProduct[];
};

const OrderInvoice: React.FC<OrderSummaryProps> = ({ orderItems }) => {
  const { lovs } = useLOV();
  const { config } = useConfig();
  const order = orderItems[0];
  const [isPrinting, setIsPrinting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [storeLogoErr, setStoreLogoErr] = useState(false);

  const orderType = useMemo(
    () => lovs?.ordertypes?.find((s) => s.id === order?.saleTypeId)?.name ?? "",
    [lovs?.ordertypes, order]
  );

  const parseCustomerInfo: CustomerInfo | null = useMemo(() => {
    if (!order?.customerInfo || typeof order.customerInfo !== "string") {
      return null;
    }

    try {
      return JSON.parse(order.customerInfo) as CustomerInfo;
    } catch (error) {
      console.error("Error parsing customerInfo:", error);
      return null;
    }
  }, [order?.customerInfo]);

  if (order.status !== 5) return null;

  const handlePrintInvoice = async () => {
    setIsPrinting(true);
    try {
      await printInvoice(orderItems, orderType, config?.tax_Number ?? "");
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setIsPrinting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Card className="p-0">
        <CardContent className="p-3 flex gap-3">
          <div className="w-16 h-16 flex items-center justify-center border-2 border-foreground rounded-full bg-primary/20 ">
            <NotepadText size={38} />
          </div>
          <div className="flex flex-col justify-center space-y-2">
            <p>Need an invoice?</p>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setIsOpen(true)}
            >
              View Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle className="sr-only">Order Invoice</DialogTitle>
          <div className="flex flex-col items-center space-y-4">
            {/* Store Logo */}
            {order.logoPath && (
              <Image
                src={
                  storeLogoErr ? "/no-image.png" : `${API_URL}${order.logoPath}`
                }
                alt="Store Logo"
                width={80}
                height={80}
                className="object-contain"
                onError={() => setStoreLogoErr(true)}
              />
            )}

            {/* Store Name */}
            <h2 className="text-xl font-bold text-center">{order.tradeName}</h2>

            {/* Store Address */}
            <p className="text-sm text-center text-muted-foreground">
              {order.storeAddress}
            </p>

            <div className="w-full space-y-4">
              {/* Order Details */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax Number:</span>
                <span>{config?.tax_Number || "xxx-xxxx"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order #:</span>
                <span>{order.saleId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Type:</span>
                <span>{orderType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {order.saleTypeId === 3 ? "Delivery Time" : "ETA Time"}:
                </span>
                <span>
                  {moment(order.deliveryTime).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>
              {(parseCustomerInfo?.name || parseCustomerInfo?.contact) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span>
                    {parseCustomerInfo?.name || parseCustomerInfo?.contact}
                  </span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Items List */}
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.totalLoadedQty} x {item.productName}
                    </span>
                    <span>{calculateTotal(item)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Totals */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>{order.taxAmount?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Bill: ({order.currencyCode ?? ""})</span>
                <span>{order.payableBill?.toFixed(2) || "0.00"}</span>
              </div>

              {/* Thank you message */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Thank you for choosing our restaurant
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrintInvoice} disabled={isPrinting}>
              {isPrinting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" /> Printing...
                </>
              ) : (
                "Print Invoice"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderInvoice;
