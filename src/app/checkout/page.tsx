"use client";
import CheckoutInfo from "@/components/checkout/checkout-info";
import CheckoutSummary from "@/components/checkout/checkout-summary";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import Link from "next/link";

const CheckoutPage = () => {
  const { items } = useCart();
  const { config } = useConfig();
  // const searchParams = useSearchParams();
  // const pathname = usePathname();

  // useEffect(() => {
  //   const amount = searchParams.get("amount");
  //   const orderRefNumber = searchParams.get("orderRefNumber");
  //   const message = searchParams.get("message");
  //   const transactionRefNumber = searchParams.get("transactionRefNumber");

  //   // console.log({ pp_ResponseMessage });
  //   setTimeout(() => {
  //     if (amount || orderRefNumber || message) {
  //       if (window.opener) {
  //         const data = {
  //           orderRefNumber,
  //           message,
  //           amount,
  //           transactionRefNumber,
  //         };
  //         window.opener.postMessage(
  //           {
  //             status: message ? "failed" : "success",
  //             txnRef: orderRefNumber,
  //             message: message ?? "",
  //             data: btoa(JSON.stringify(data)),
  //           },
  //           "*"
  //         );
  //         window.close();
  //         // Optional: Close popup after a delay
  //       }

  //       // Remove query params from URL
  //     }
  //   }, 1000);
  // }, [searchParams, pathname]);

  if (items.length === 0 && config?.storeId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl font-bold">No items in cart</p>
        <Link
          href={`/${btoa((config?.storeId ?? 1)?.toString())}`}
          className="text-primary"
        >
          Go to menu
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CheckoutInfo />
        <CheckoutSummary />
      </div>
    </div>
  );
};

export default CheckoutPage;
