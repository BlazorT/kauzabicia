import { JSX, useRef, MouseEvent, useMemo } from "react";
import GooglePayButton from "@google-pay/button-react";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useOrder } from "@/context/order-context";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { PAYMENT_GATEWAY } from "@/utils/types";

export function useGooglePay(): {
  onGooglePay: (e: MouseEvent) => void;
  GooglePayButtonComponent: JSX.Element;
} {
  const { items, totalPrice } = useCart();
  const { config } = useConfig();
  const { orderInfo } = useOrder();

  const totalOrderAmount = useMemo(() => {
    const result = getTotalOrderAmount(totalPrice, config, orderInfo);
    return result;
  }, [totalPrice, config, orderInfo]);

  // Create a ref for the GooglePayButton to trigger its click programmatically
  const googlePayRef = useRef<GooglePayButton | null>(null);

  // Function to trigger the Google Pay button click
  const onGooglePay = (e: MouseEvent) => {
    if (googlePayRef.current) {
      //@ts-expect-error remove
      googlePayRef.current?.manager.handleClick(e);
    }
  };
  // console.log({ ReadyToPayChangeResponse });
  // Google Pay button properties

  // Return the ref, onClick function, and GooglePayButton component
  const paymentGateway = orderInfo.paymentGateway as PAYMENT_GATEWAY | null;
  return {
    onGooglePay,
    GooglePayButtonComponent: (
      <div className="hidden">
        {paymentGateway?.name?.toLowerCase() === "gpay" && (
          <GooglePayButton
            ref={googlePayRef}
            environment="TEST"
            paymentRequest={{
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: "CARD",
                  parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["MASTERCARD", "VISA"],
                  },
                  tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                      gateway: "example",
                      gatewayMerchantId:
                        paymentGateway?.secretKey ?? "exampleGatewayMerchantId",
                    },
                  },
                },
              ],
              merchantInfo: {
                merchantId:
                  paymentGateway?.merchantAccountId ?? "12345678901234567890",
                merchantName: paymentGateway?.cert ?? "Demo Merchant",
              },
              transactionInfo: {
                totalPriceStatus: "FINAL",
                totalPriceLabel: "Total",
                totalPrice: totalOrderAmount,
                currencyCode:
                  items[0]?.currencycode?.toLowerCase() == "$"
                    ? "USD"
                    : items[0]?.currencycode?.toLowerCase() == "rs"
                    ? "PKR"
                    : items[0]?.currencycode?.toUpperCase() ?? "USD",
                //   countryCode: "US",
              },
            }}
            onLoadPaymentData={(paymentRequest) => {
              console.log("load payment data", paymentRequest);
            }}
          />
        )}
      </div>
    ),
  };
}
