import { paymentGatewayDescriptions, USER_ROLE } from "@/constants/constants";
import { useAuth } from "@/context/auth-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useOrder } from "@/context/order-context";
import { useJazzCash } from "@/hooks/useJazzCash";
import {
  getOrdersQueryKey,
  usePaymentGateways,
  useUpdateOrder,
} from "@/hooks/useOrder";
import { isSixDigitNumber, isValidMobileNumber } from "@/utils/formUtils";
import { filterActiveGateways } from "@/utils/paymentUtils";
import { ORDER } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import JazzCashConfirm from "../checkout/jazz-cash-confirm";
import JCInitiateLoading from "../checkout/jazz-cash-initiate-load";
import { PaymentMethodCard } from "../checkout/payment-method-card";
import { ErrorState } from "../store/store-status";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ErrorSnackbar } from "../ui/error-snackbar";
import { RadioGroup } from "../ui/radio-group";
import Spinner from "../ui/spinner";
import { useEasyPaisa } from "@/hooks/useEasyPaisa";

type PaymentOptionsProps = {
  isVisible: boolean;
  toggleDialog: () => void;
  order: ORDER;
};

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  isVisible,
  toggleDialog,
  order,
}) => {
  const { orderInfo, setOrderInfo, resetOrderInfo } = useOrder();
  const { setError } = useError();
  const { user } = useAuth();
  const { mutate, isPending: pendingUpdate } = useUpdateOrder();
  const {
    triggerJazzCashPayment,
    loadingJC,
    initiateJCPayment,
    isPending: paymentInitiatedPending,
    isPaymentInitiated,
    isPaymentSuccess,
    // loadingJC,
  } = useJazzCash(true);
  const { prepareRequest } = useEasyPaisa(true);

  const { data, isPending, isError, error } = usePaymentGateways(order.storeid);

  const queryClient = useQueryClient();

  const jazzCashRef = useRef<{ close: () => void }>(null);

  const paymentGatewaysData = useMemo(
    () => filterActiveGateways({ data: data?.data }),
    [data]
  );

  const onCancel = () => {
    toggleDialog();
    resetOrderInfo();
  };

  const validatePayment = () => {
    if (orderInfo.paymentGatewayId === 0) {
      setError({
        message: "Please select a gateway to process with your order.",
        variant: ErrorVariant.Warning,
      });
      return false;
    }
    if (orderInfo.paymentGateway?.name?.toLowerCase() === "jazzcash") {
      if (!orderInfo.jazzCashMode) {
        setError({
          title: "JazzCash",
          message:
            "Please select a jazzcash payment method, you can either pay from mobile acount or pay through card.",
          variant: ErrorVariant.Warning,
        });
        return false;
      }
      if (orderInfo.jazzCashMode === "wallet") {
        if (!isValidMobileNumber(orderInfo.jazzCashNumber)) {
          setError({
            title: "JazzCash",
            message: "Please enter a valid mobile number. e.g 03001234567",
            variant: ErrorVariant.Warning,
          });
          return false;
        }
        if (!isSixDigitNumber(orderInfo.jazzCashCNIC)) {
          setError({
            title: "JazzCash",
            message: "Please enter a last 6 digits of your CNIC.",
            variant: ErrorVariant.Warning,
          });
          return false;
        }
        initiateJCPayment(
          (order.payableamount - order.paidamount)?.toFixed(2),
          order?.saleid?.toString()
        );
        // initiateJCPayment("1", order?.saleid?.toString());
        return false;
      }
      if (orderInfo.jazzCashMode === "card") {
        triggerJazzCashPayment(
          (order.payableamount - order.paidamount)?.toFixed(2),
          order?.saleid?.toString()
        );
        // triggerJazzCashPayment("1", order?.saleid?.toString());
        return false;
      }
    }
    if (orderInfo.paymentGateway?.name?.toLowerCase() === "easypaisa") {
      prepareRequest(
        (order.payableamount - order.paidamount)?.toFixed(1),
        order?.saleid?.toString()
      );
      // prepareRequest(1?.toFixed(1), order?.saleid?.toString());
      return false;
    }
    return true;
  };
  const onPay = () => {
    if (!validatePayment()) return;
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
      paidamount: order.totalamount,
      paymentStatusId: 1,
      paymentMethodId: 2,
      paymentRef: paymentData
        ? paymentData
        : btoa(JSON.stringify(orderInfo.jazzCashResponse)),
      handedovercash: 0.0,
      expense: 0.0,
      payingamount: 0.0,
      dueamount: 0.0,
      netdiscount: 0.0,
      changeamount: 0.0,
      quantity: 0.0,
      createdby: 0,
      saletypeid: order.saleTypeId,
      status: 5,
      keyword: "",
      serviceCharges: order?.serviceCharges ?? 0,
      deliveryCharges: order?.deliveryCharges ?? 0,
      tipAmount: order?.tipAmount ?? 0,
      lastUpdatedAt: moment().utc().format(),
      lastUpdatedBy: user?.id ?? 0,
      rowVer: order?.rowVer,
    };
    // console.log({ updateOrderBody });
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
              `Order #${order.saleid} has been paid and completed succesfully!`
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

  useEffect(() => {
    if (isPaymentSuccess) placeOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaymentSuccess]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Optional: check event.origin for security
      // console.log("Received message from popup:", event.data);

      // Validate the structure
      if (event.data?.status) {
        const { message, data, status } = event.data;
        // console.log("Message:", message);
        // console.log("Raw Data:", data);
        // console.log("Parsed data", JSON.parse(atob(data)));
        if (status === "failed") {
          setError({
            title: "Payment Error",
            message: message,
            variant: ErrorVariant.Error,
          });
        } else {
          placeOrder(data);
        }

        // TODO: handle this data in your app (e.g., update state, redirect, etc.)
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isError) {
    return <ErrorState message={error?.message} />;
  }

  if (isPending || pendingUpdate) {
    return <Spinner />;
  }

  return (
    <>
      <JCInitiateLoading isOpen={paymentInitiatedPending} />
      <JazzCashConfirm
        ref={jazzCashRef}
        isVisible={isPaymentInitiated}
        placeOrder={placeOrder}
      />
      <Dialog open={isVisible}>
        <DialogDescription className="hidden">HI</DialogDescription>
        <DialogContent
          hideCloseButton={paymentGatewaysData.length > 0}
          aria-describedby="pay-options"
        >
          <DialogHeader>
            <DialogTitle>Payment Options</DialogTitle>
          </DialogHeader>
          {paymentGatewaysData?.length === 0 ? (
            <p>
              No payment gateways available right now, please try again later.
            </p>
          ) : (
            <>
              <ErrorSnackbar />
              <RadioGroup
                onValueChange={(value) => {
                  const parsedValue = JSON.parse(value);
                  console.log({ parsedValue });
                  setOrderInfo((prev) => ({
                    ...prev,
                    paymentMethodId:
                      parsedValue.id === 1 || parsedValue.id === 3
                        ? parsedValue.id
                        : 2,
                    paymentGateway: parsedValue,
                    paymentGatewayId: parsedValue.id,
                  }));
                }}
                value={orderInfo.paymentGatewayId.toString()}
                className="w-full flex flex-wrap items-center gap-6 cursor-pointer"
              >
                <div className="w-full flex flex-col gap-4">
                  {paymentGatewaysData?.map((gateway) => {
                    const key =
                      (gateway.name?.toLowerCase() as keyof typeof paymentGatewayDescriptions) ??
                      (gateway.id.toString() as keyof typeof paymentGatewayDescriptions);
                    const description =
                      paymentGatewayDescriptions[
                        orderInfo.jazzCashMode === "card" ? "default" : key
                      ] ?? null;

                    return (
                      <PaymentMethodCard
                        key={gateway.id}
                        gateway={gateway}
                        isForced={false}
                        isSelected={orderInfo.paymentGatewayId === gateway.id}
                        description={description}
                      />
                    );
                  })}
                </div>
              </RadioGroup>
              <div className="flex gap-3">
                {loadingJC ? (
                  <Button className="w-full">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Redirecting...
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={onCancel}
                      className="flex-1"
                      variant={"secondary"}
                    >
                      Cancel
                    </Button>
                    <Button onClick={onPay} className="flex-1">
                      Pay {order.currencycode}{" "}
                      {(order.payableamount - order.paidamount)?.toFixed(2)}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentOptions;
