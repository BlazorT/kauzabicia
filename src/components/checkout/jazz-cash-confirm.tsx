/* eslint-disable react-hooks/exhaustive-deps */
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import useCountdownTimer from "@/hooks/useCountdownTimer";
import { Loader2 } from "lucide-react";
import { useJazzCashInquiry } from "@/hooks/useOrder";
import { useOrder } from "@/context/order-context";
import { toast } from "sonner";
import { ErrorVariant, useError } from "@/context/error-context";

interface JazzCashConfirmProps {
  isVisible: boolean;
  placeOrder: (paymentData?: string) => void;
  ref?: React.Ref<{ close: () => void }>;
}

export default function JazzCashConfirm({
  isVisible,
  placeOrder,
  ref,
}: JazzCashConfirmProps) {
  const [isShow, setIsShow] = useState(false);
  const time = useCountdownTimer(10 * 60, isShow);
  const { mutate: inquiry } = useJazzCashInquiry();
  const { orderInfo } = useOrder();
  const { setError } = useError();

  const dialogRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    close: () => setIsShow(false),
  }));

  useEffect(() => {
    if (isVisible) {
      setIsShow(true);
    }
  }, [isVisible]);

  const handleInquiry = useCallback(() => {
    if (!orderInfo?.jazzCashTxnRef) return;
    inquiry(
      { txnRefNo: orderInfo.jazzCashTxnRef },
      {
        onSuccess: (response) => {
          // console.log({ response });
          if (response.pp_PaymentResponseCode === "121") {
            toast.success("JazzCash payment successful");
            if (dialogRef.current) {
              dialogRef.current.hidden = true;
            }
            placeOrder(btoa(JSON.stringify(orderInfo.jazzCashResponse)));
          }
          if (response.pp_PaymentResponseCode === "999") {
            toast.success("JazzCash payment successful");
            setError({
              message: response?.pp_PaymentResponseMessage,
              variant: ErrorVariant.Error,
            });
            setIsShow(false);
            if (dialogRef.current) {
              dialogRef.current.hidden = true;
            }
          }
        },
        onError: (error) => {
          console.error("Payment inquiry error:", error);
        },
      }
    );
  }, [orderInfo.jazzCashTxnRef]);

  // Automatically call handleInquiry after 90 seconds when dialog shows
  useEffect(() => {
    if (!isShow) return;

    const timeout = setInterval(() => {
      handleInquiry();
    }, 60 * 1000); // 90 seconds

    return () => clearTimeout(timeout); // Cleanup on unmount or isShow change
  }, [handleInquiry, isShow]);

  if (!isVisible) return null;

  return (
    <Dialog open={isShow}>
      <DialogContent ref={dialogRef} hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">
            Awaiting JazzCash Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
          <p className="text-sm text-muted-foreground max-w-sm">
            Your payment request has been sent to the JazzCash app. Please open
            the app and approve the transaction to complete your order.
          </p>

          <p className="text-sm">
            <strong>Time remaining:</strong> {time}
          </p>

          <p className="text-xs text-muted-foreground">
            If the payment isn&apos;t confirmed within 10 minutes, the request
            will be canceled automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
