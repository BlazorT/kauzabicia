import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useOrder } from "@/context/order-context";
import { SOCKET_URL } from "@/services/apiClient";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { keepOnlyAlphanumeric } from "@/utils/formUtils";
import { PAYMENT_GATEWAY } from "@/utils/types";
import axios from "axios";
import { useState } from "react";
import { useJazzCashPayment } from "./useOrder";
import moment from "moment-timezone";

export function useJazzCash(isPopUp: boolean = false) {
  const { orderInfo, setOrderInfo } = useOrder();
  const { config } = useConfig();
  const { setError } = useError();
  const { totalPrice, items } = useCart();

  const [isPaymentInitiated, setIsPaymentInitiated] = useState<boolean>(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState<boolean>(false);

  const { mutate: initiateJazzCashPayment, isPending } = useJazzCashPayment();

  const [loadingJC, setLoadingJC] = useState<boolean>(false);

  const triggerJazzCashPayment = async (amount?: string, ref?: string) => {
    try {
      setLoadingJC(true);
      const gateway = orderInfo.paymentGateway as PAYMENT_GATEWAY;
      const JAZZ_MERCHANT_ID = gateway?.merchantAccountId;
      const JAZZ_MERCHANT_PASSWORD = gateway?.secretKey;

      const TxnDateTime = moment().tz("Asia/Karachi").format("YYYYMMDDHHmmss");
      const TxnExpiryDateTime = moment()
        .tz("Asia/Karachi")
        .add(3, "days")
        .format("YYYYMMDDHHmmss");

      const TxnRefNumber = `MND${TxnDateTime}`;

      const toPay = getTotalOrderAmount(totalPrice, config, orderInfo);
      const pp_Amount = Math.round(Number(amount ?? toPay) * 100);
      const billRef = ref
        ? keepOnlyAlphanumeric(ref)
        : `${keepOnlyAlphanumeric(
            (items[0]?.storeId ?? "") +
              "Ref" +
              (items[items.length - 1]?.productDetailId ?? "")
          )}`;
      setOrderInfo((prev) => ({
        ...prev,
        jazzCashTxnRef: TxnRefNumber,
      }));
      // console.log({ gateway });
      const transactionDetails = {
        pp_Amount,
        pp_BankID: "",
        pp_BillReference: billRef,
        pp_Description: `Payment for ${billRef}`,
        pp_Language: "EN",
        pp_MerchantID: JAZZ_MERCHANT_ID,
        pp_Password: JAZZ_MERCHANT_PASSWORD,
        pp_ProductID: "",
        pp_ReturnURL:
          gateway?.callBackUri ??
          "https://hotmealzndealz.com/externalapi/ExternalPaymentsApi/jc-return-url",
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: TxnDateTime,
        pp_TxnExpiryDateTime: TxnExpiryDateTime,
        pp_TxnRefNo: TxnRefNumber,
        pp_TxnType: "MPAY",
        pp_Version: "1.1",
        ppmpf_1: keepOnlyAlphanumeric(orderInfo?.email ?? ""),
        ppmpf_2: keepOnlyAlphanumeric(orderInfo?.phone?.toString() ?? ""),
        ppmpf_3: "web",
      };
      // console.log(transactionDetails);
      const response = await axios.post(
        `${SOCKET_URL}/api/payment/jc-secure-hash`,
        transactionDetails
      );
      const redirectUrl =
        response?.data?.redirectUrl ||
        "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
      const secureHash = response?.data?.secureHash;
      const form = document.createElement("form");
      form.method = "post";
      form.action = redirectUrl;
      if (!isPopUp) {
        Object.entries({
          ...transactionDetails,
          pp_SecureHash: secureHash,
        }).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        const popupWidth = Math.round(window.screen.width * 0.8);
        const popupHeight = Math.round(window.screen.height * 0.8);
        const left = (window.screen.width - popupWidth) / 3;
        const top = (window.screen.height - popupHeight) / 3;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData: Record<string, any> = {};
        new FormData(form).forEach((value, key) => {
          formData[key] = value;
        });
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
      }

      // console.log(formData);
      // console.log(JSON.stringify(formData));
      // return;
    } catch (error) {
      console.error("JazzCash init error:", error);
    } finally {
      setLoadingJC(false);
    }
  };

  const initiateJCPayment = async (amount?: string, ref?: string) => {
    setIsPaymentInitiated(false);
    setIsPaymentSuccess(false);
    const toPay = getTotalOrderAmount(totalPrice, config, orderInfo);

    const jcBody = {
      amount: Math.round(Number(amount ?? toPay) * 100), // Directly calculate and round to integer
      mobile: orderInfo?.jazzCashNumber,
      description: "kiosk",
      billRef: ref
        ? keepOnlyAlphanumeric(ref)
        : `${keepOnlyAlphanumeric(
            (items[0]?.storeId ?? "") +
              "Ref" +
              (items[items.length - 1]?.productDetailId ?? "")
          )}`,
      cnic: orderInfo?.jazzCashCNIC,
      ppmpf_1: keepOnlyAlphanumeric(orderInfo?.email ?? ""),
      ppmpf_2: keepOnlyAlphanumeric(orderInfo?.phone?.toString() ?? ""),
    };
    // console.log({ jcBody });
    initiateJazzCashPayment(
      { jcBody },
      {
        onSuccess: (response) => {
          //   console.log({ response });
          setOrderInfo((prev) => ({
            ...prev,
            jazzCashTxnRef: response.pp_TxnRefNo,
            jazzCashResponse: {
              pp_TxnType: response?.pp_TxnType || "",
              pp_Amount: response?.pp_Amount || "",
              pp_BillReference: response?.pp_BillReference || "",
              pp_ResponseCode: response?.pp_ResponseCode || "",
              pp_RetreivalReferenceNo: response?.pp_RetreivalReferenceNo || "",
              pp_SubMerchantID: response?.pp_SubMerchantID || "",
              pp_TxnCurrency: response?.pp_TxnCurrency || "",
              pp_TxnDateTime: response?.pp_TxnDateTime || "",
              pp_TxnRefNo: response?.pp_TxnRefNo || "",
              pp_MobileNumber: response?.pp_MobileNumber || "",
              pp_CNIC: response?.pp_CNIC || "",
              pp_SecureHash: response?.pp_SecureHash || "",
            },
          }));
          // console.log({ response });
          if (response.pp_ResponseCode === "157") {
            setIsPaymentInitiated(true);
          } else if (response.pp_ResponseCode === "000") {
            setIsPaymentSuccess(true);
          } else {
            setError({
              message:
                response?.pp_ResponseMessage ||
                "JazzCash payment failed, please try again later. Make sure you have enough balance in your account.",
              variant: ErrorVariant.Error,
              title: "JazzCash Payment Failed",
            });
          }
        },
        onError: (error) => {
          console.error("Payment initiation error:", error);
        },
      }
    );
  };

  return {
    triggerJazzCashPayment,
    initiateJCPayment,
    isPending,
    isPaymentInitiated,
    isPaymentSuccess,
    loadingJC,
  };
}
