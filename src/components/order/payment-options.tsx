import { USER_ROLE } from "@/constants/constants";
import { useAuth } from "@/context/auth-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useOrder } from "@/context/order-context";
import { getOrdersQueryKey, useUpdateOrder } from "@/hooks/useOrder";
import { ORDER, OrderProduct } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { Banknote } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ErrorSnackbar } from "../ui/error-snackbar";
import { Input } from "../ui/input";
import Spinner from "../ui/spinner";
import OrderSummary from "./order-summary";

type PaymentOptionsProps = {
  isVisible: boolean;
  toggleDialog: () => void;
  order: ORDER;
  order_products: OrderProduct[];
};

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  isVisible,
  toggleDialog,
  order_products,
  order,
}) => {
  const queryClient = useQueryClient();
  const { orderInfo, resetOrderInfo } = useOrder();
  const { setError } = useError();
  const { user } = useAuth();
  const { mutate, isPending: pendingUpdate } = useUpdateOrder();

  const original_due = order_products?.[0]?.dueAmount;
  const [amount, setAmount] = useState("");

  // const [dueAmount, setDueAmount] = useState(original_due);

  const onCancel = () => {
    toggleDialog();
    resetOrderInfo();
  };

  const validatePayment = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError({
        title: "Error",
        message: "Please enter a valid amount",
        variant: ErrorVariant.Warning,
      });
      return false;
    }
    if (numericAmount > original_due) {
      setError({
        title: "Error",
        message: `Amount cannot exceed due amount (${original_due})`,
        variant: ErrorVariant.Warning,
      });
      return false;
    }
    return true;
  };
  const onPay = () => {
    if (!validatePayment()) return;
    placeOrder();
  };

  const placeOrder = (paymentData?: string) => {
    const updateOrderBody = {
      id: order.saleid,
      storeid: order?.storeid ?? 0,
      saleid: order.saleid,
      businessagentid: 0,
      itemsCount: 0,
      salesinvoicecode: order.salesinvoicecode ?? "",
      taxInvoiceCode: order?.taxInvoiceCode ?? "",
      city: "",
      remarks: "",
      currencycode: "",
      salerate: 0.0,
      invoiceTime: moment().utc().format(),
      totalamount: 0.0,
      discount: 0.0,
      commissiontotalamount: 0.0,
      taxamount: 0.0,
      tax: 0.0,
      total: order.totalamount,
      payableamount: order.totalamount,
      paidamount: parseFloat(
        (order.paidamount + parseFloat(Number(amount).toFixed(2))).toFixed(2)
      ),
      paymentStatusId:
        Math.abs(order.totalamount - parseFloat(amount)) < 0.01 ? 1 : 0,
      paymentMethodId: 1,
      paymentRef: paymentData
        ? paymentData
        : btoa(JSON.stringify(orderInfo.jazzCashResponse)),
      handedovercash: 0.0,
      expense: 0.0,
      payingamount: 0.0,
      dueamount: parseFloat(
        (order.totalamount - parseFloat(Number(amount).toFixed(2))).toFixed(2)
      ),
      netdiscount: 0.0,
      changeamount: 0.0,
      quantity: 0.0,
      createdby: 0,
      saletypeid: order.saleTypeId,
      status:
        Math.abs(order.totalamount - parseFloat(amount)) < 0.01
          ? 5
          : order?.status,
      keyword: "",
      serviceCharges: order?.serviceCharges ?? 0,
      deliveryCharges: order?.deliveryCharges ?? 0,
      tipAmount: order?.tipAmount ?? 0,
      lastUpdatedAt: moment().utc().format(),
      lastUpdatedBy: user?.id ?? 0,
      rowVer: order?.rowVer,
    };
    console.log({ updateOrderBody });
    // return;
    // console.log(JSON.stringify(updateOrderBody));
    mutate(
      { orderBody: updateOrderBody },
      {
        onSuccess: (res) => {
          // console.log(res);
          if (res?.status === true) {
            resetOrderInfo();
            queryClient.invalidateQueries({
              queryKey: getOrdersQueryKey(
                user?.id?.toString() ?? "0",
                user?.roleId === USER_ROLE.USER
                  ? "0"
                  : user?.storeId
                  ? user?.storeId?.toString()
                  : "0"
              ),
            });
            toggleDialog();
            toast.success(
              `Order #${order.saleid} has been updated succesfully!`
            );
          } else {
            setError({
              title: "Error",
              message: res?.message ?? "Something went wrong try again later!.",
              variant: ErrorVariant.Warning,
            });
          }
        },
      }
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid number
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numericValue = parseFloat(value);
      const numericDueAmount = original_due;
      if (!isNaN(numericValue) && numericValue > numericDueAmount) {
        setError({
          title: "Error",
          message: `Amount cannot exceed ${numericDueAmount}`,
          variant: ErrorVariant.Warning,
        });
        return;
      }
      // const numericOriginalDue = parseFloat(original_due);
      // setDueAmount((numericOriginalDue - numericValue).toFixed(2));
      setAmount(value);
    }
  };

  if (pendingUpdate) {
    return <Spinner />;
  }

  return (
    <>
      <Dialog open={isVisible} onOpenChange={onCancel}>
        <DialogDescription className="hidden">HI</DialogDescription>
        <DialogContent aria-describedby="pay-options">
          <DialogHeader>
            <DialogTitle>Payment Options</DialogTitle>
          </DialogHeader>
          <ErrorSnackbar />
          <OrderSummary orderItems={order_products} />
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={amount}
              type="text"
              placeholder="Amount"
              onChange={handleAmountChange}
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={onCancel} className="flex-1" variant={"outline"}>
              Cancel
            </Button>
            {parseFloat(amount) > 0 && (
              <Button onClick={onPay} className="flex-1">
                Pay {order.currencycode} {parseFloat(amount)?.toFixed(2)}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentOptions;
