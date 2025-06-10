import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { SOCKET_URL } from "@/services/apiClient";
import { useOrder } from "@/context/order-context";
import { PAYMENT_GATEWAY } from "@/utils/types";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { keepOnlyAlphanumeric } from "@/utils/formUtils";
import { useState } from "react";

export default function JazzCashCard() {
  const { orderInfo } = useOrder();
  const { config } = useConfig();
  const { totalPrice, items } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const gateway = orderInfo.paymentGateway as PAYMENT_GATEWAY;
      const JAZZ_MERCHANT_ID = gateway?.merchantAccountId;
      const JAZZ_MERCHANT_PASSWORD = gateway?.secretKey;

      const now = new Date();
      const TxnDateTime = now
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0, 14);
      const TxnRefNumber = `MND${TxnDateTime}`;
      const TxnExpiryDateTime = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0, 14);
      const toPay = getTotalOrderAmount(totalPrice, config, orderInfo);
      const pp_Amount = Math.round(Number(toPay) * 100);
      const billRef = `${keepOnlyAlphanumeric(
        (items[0]?.storeId ?? "") +
          "Ref" +
          (items[items.length - 1]?.productDetailId ?? "")
      )}`;
      const transactionDetails = {
        pp_Amount: pp_Amount,
        pp_BillReference: billRef,
        pp_Description: `Payment for ${billRef}`,
        pp_Language: "EN",
        pp_MerchantID: JAZZ_MERCHANT_ID,
        pp_Password: JAZZ_MERCHANT_PASSWORD,
        pp_ReturnURL:
          gateway?.callBackUri ||
          "http://167.88.45.70:5000/api/payment/jc-callback",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: TxnDateTime,
        pp_TxnExpiryDateTime: TxnExpiryDateTime,
        pp_TxnRefNo: TxnRefNumber,
        pp_TxnType: "MIGS",
        pp_BankID: "",
        pp_ProductID: "",
        pp_Version: "1.1",
        ppmpf_1: keepOnlyAlphanumeric(orderInfo?.email ?? ""),
        ppmpf_2: keepOnlyAlphanumeric(orderInfo?.phone?.toString() ?? ""),
        ppmpf_3: "web",
      };

      const response = await axios.post(
        `${SOCKET_URL}/api/payment/jc-secure-hash`,
        transactionDetails
      );

      const redirectUrl =
        response?.data?.redirectUrl ||
        "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
      const secureHash = response?.data?.secureHash;
      // console.log(response.data);

      const popupWidth = Math.round(window.screen.width * 0.6);
      const popupHeight = Math.round(window.screen.height * 0.6);
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;

      const paymentWindow = window.open(
        "",
        "JazzCashPayment",
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
      );

      if (paymentWindow) {
        paymentWindow.document.write(`
          <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;">
              <div style="text-align:center;">
                <p>Redirecting to JazzCash...</p>
                <form method="post" action="${redirectUrl}" id="jazzCashForm">
                  ${Object.entries({
                    ...transactionDetails,
                    pp_SecureHash: secureHash,
                  })
                    .map(
                      ([key, value]) =>
                        `<input type="hidden" name="${key}" value="${value}" />`
                    )
                    .join("\n")}
                </form>
                <script>
                  document.getElementById('jazzCashForm').submit();
                </script>
              </div>
            </body>
          </html>
        `);
        paymentWindow.document.close();
      }
    } catch (error) {
      console.error("JazzCash init error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handlePayment}>
      {isLoading ? (
        <Loader2 className="mr-2 animate-spin" />
      ) : (
        <CreditCard className="mr-2" />
      )}
      Pay Through Card
    </Button>
  );
}
