import {
  calculateTotal,
  getDealSubTotal,
  getItemsTotal,
} from "@/utils/orderUtils";
import { OrderProduct } from "@/utils/types";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

type OrderSummaryProps = {
  orderItems: OrderProduct[];
  dueAmount?: number;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderItems }) => {
  const order = orderItems[0];
  const isPaid = order.paymentStatusId === 1;
  // console.log(order);
  return (
    <Card className="p-0">
      <CardContent className="p-2 space-y-2 text-sm ">
        <h2 className="text-xl font-semibold  border-b pb-2">Order Summary</h2>
        {orderItems?.map((order) => (
          <div
            key={order.productDetailId}
            className="flex justify-between items-center text-sm font-semibold"
          >
            <p>
              {order.totalLoadedQty}x {order.productName}
            </p>
            <p>{calculateTotal(order)}</p>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <p>Subtotal</p>
          {order?.dCode ? (
            <p>
              <span className="text-muted-foreground line-through">
                {" "}
                {getItemsTotal(orderItems)}
              </span>{" "}
              {getDealSubTotal(order)}
            </p>
          ) : (
            <p>{getItemsTotal(orderItems)}</p>
          )}
        </div>
        {order?.deliveryCharges > 0 && (
          <div className="flex items-center justify-between">
            <p>Delivery Charges</p>
            <p>{order?.deliveryCharges?.toFixed(2)}</p>
          </div>
        )}
        {order?.serviceCharges > 0 && (
          <div className="flex items-center justify-between">
            <p>Service Charges</p>
            <p>{order?.serviceCharges?.toFixed(2)}</p>
          </div>
        )}
        {order?.tipAmount > 0 && (
          <div className="flex items-center justify-between">
            <p>Tip</p>
            <p>{order?.tipAmount?.toFixed(2)}</p>
          </div>
        )}
        {order?.taxAmount > 0 && (
          <div className="flex items-center justify-between">
            <p>Tax</p>
            <p>{order?.taxAmount?.toFixed(2)}</p>
          </div>
        )}
        {order?.netDiscount > 0 && (
          <div className="flex items-center justify-between">
            <p>Discount</p>
            <p>{order?.netDiscount?.toFixed(2)}</p>
          </div>
        )}
        <div className="flex items-center justify-between text- base font-bold">
          <p>
            Total{" "}
            <span className="text-muted-foreground text-sm">
              (incl. fees and tax)
            </span>
          </p>
          <p>
            {order?.currencyCode} {order?.payableBill?.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between"></div>
        {/* {order?.pointsAmount > 0 && (
          <div className="flex items-center justify-between">
          <p>Points Balance</p>
          <p>{order?.pointsAmount?.toFixed(2)}</p>
          </div>
          )}
          {order?.voucherAmount > 0 && (
            <div className="flex items-center justify-between">
            <p>
            Voucher Amount{" "}
            <span className="text-muted-foreground text-sm">
            ({order?.voucherCode})
            </span>
            </p>
            <p>{order?.voucherAmount?.toFixed(2)} </p>
            </div>
            )} */}
        {order?.paidAmount > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <p>Cash</p>
              <p>{order?.paidAmount?.toFixed(2)}</p>
            </div>
          </>
        )}
        {!isPaid && order?.dueAmount > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-red-400">
              <p>Due Amount</p>
              <p>
                {order?.currencyCode} {order?.dueAmount?.toFixed(2)}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
