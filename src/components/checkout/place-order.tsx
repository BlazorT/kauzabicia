import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useLocation } from "@/context/location-context";
import { useOrder } from "@/context/order-context";
import { useDistanceAndAddressInfo } from "@/hooks/useDistanceAndAddressInfo";
import { useFetchOrderDetails, usePlaceOrder } from "@/hooks/useOrder";
import { getOrCreateSessionId, isEmail } from "@/lib/utils";
import {
  calculateEachProductTax,
  getMaxKitchenTime,
  getPayableAmount,
  getTaxAmount,
  getTotalOrderAmount,
} from "@/utils/cartUtils";
import { COLLAPSIBLE_REF, ORDER_RESPONSE } from "@/utils/types";
import Lottie from "lottie-react";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { RefObject, useMemo } from "react";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";

import checkmarkAnimation from "@/assets/checkmark.json"; // adjust path accordingly
import { USER_ROLE } from "@/constants/constants";
import { useAuth } from "@/context/auth-context";
import { useLOV } from "@/context/lov-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  getDistanceBuffer,
  getDistanceUnit,
  isDistanceBufferValid,
} from "@/utils/storeUtils";
import { BookingInfo } from "../order/order-detail";

type PlaceOrderProps = {
  guestsCollapsibleRef: RefObject<COLLAPSIBLE_REF | null>;
  customerCollapsibleRef: RefObject<COLLAPSIBLE_REF | null>;
};

export default function PlaceOrder({
  // guestsCollapsibleRef,
  customerCollapsibleRef,
}: PlaceOrderProps) {
  const { isFetching } = useDistanceAndAddressInfo();
  const { items, totalPrice, clearCart } = useCart();
  const { config } = useConfig();
  const { user } = useAuth();
  const { orderInfo, resetOrderInfo } = useOrder();
  const { showAlert, hideAlert } = useAlert();
  const { setError } = useError();
  const { lovs } = useLOV();
  const { filters } = useRestaurantFilters();
  const { selectedPosition, ipInfo } = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  // const pathname = usePathname();

  const { storeData } = useStoreInfo(items[0]?.storeId?.toString() ?? "");

  const saleId = searchParams.get("saleId");
  const isValidOrderEdit = saleId;

  const { data: orderDetailRes, isLoading: pendingOrderItems } =
    useFetchOrderDetails(saleId ? atob(saleId) : null);

  const order_products = useMemo(
    () => orderDetailRes?.data ?? [],
    [orderDetailRes]
  );

  // const { prepareRequest } = useEasyPaisa();
  // const { GooglePayButtonComponent, onGooglePay } = useGooglePay();
  // const {
  //   triggerJazzCashPayment,
  //   initiateJCPayment,
  //   isPending: paymentInitiatedPending,
  //   isPaymentInitiated,
  //   isPaymentSuccess,
  //   loadingJC,
  // } = useJazzCash();

  // const socketRef = useSocket();

  const { mutate: placeCompactOrder, isPending } = usePlaceOrder();

  // const jazzCashRef = useRef<{ close: () => void }>(null);

  const currencyCode =
    lovs?.currencies?.find((c) => c.id === storeData?.store?.currencyId)
      ?.code ?? storeData?.store?.currencyCode;

  const totalOrderAmount = useMemo(() => {
    const result = getTotalOrderAmount(totalPrice, config, orderInfo);
    return parseFloat(result);
  }, [totalPrice, config, orderInfo]);

  const checkMinimumDeliveryAmount = () => {
    if (!config?.minimumOrderLimit) return true;
    if (
      orderInfo.orderType === 3 &&
      totalOrderAmount < config?.minimumOrderLimit
    ) {
      setError({
        title: "Minimum order amount",
        message: `Minimum order amount should be ${currencyCode} ${config?.minimumOrderLimit} for delivery.`,
        variant: ErrorVariant.Warning,
      });

      return false;
    }
    return true;
  };

  const checkAddress = () => {
    if (
      orderInfo.orderType === 3 &&
      (orderInfo.address === "" ||
        !selectedPosition ||
        selectedPosition[0] === 0 ||
        selectedPosition[1] === 0)
    ) {
      setError({
        title: "Address is required",
        message: "Please select an address",
        variant: ErrorVariant.Warning,
      });
      return false;
    }
    return true;
  };

  // const validateGuests = () => {
  //   if (
  //     orderInfo.orderType === 1 &&
  //     (!orderInfo.guests || orderInfo.guests === "0")
  //   ) {
  //     setError({
  //       title: "Guests are required",
  //       message:
  //         "Please enter the number of guests or book table for dine in orders.",
  //       variant: ErrorVariant.Warning,
  //     });
  //     guestsCollapsibleRef.current?.setIsOpen(true);
  //     setTimeout(() => {
  //       const guestInput = document.getElementById("numberOfGuests");
  //       if (guestInput) {
  //         guestInput.focus();
  //       }
  //     }, 200);
  //     return false;
  //   }
  //   return true;
  // };

  const validateEmail = () => {
    if (orderInfo.email === "") return true;
    if (!isEmail(orderInfo.email)) {
      setError({
        message: "Please enter a valid email address.",
        variant: ErrorVariant.Warning,
      });
      setTimeout(() => {
        const guestInput = document.getElementById("email");
        if (guestInput) {
          guestInput.focus();
        }
      }, 200);
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    if (!orderInfo.phone) {
      setError({
        title: "Phone number",
        message: "Please enter a valid phone number",
        variant: ErrorVariant.Warning,
      });
      customerCollapsibleRef?.current?.setIsOpen(true);
      setTimeout(() => {
        const guestInput = document.getElementById("phone");
        if (guestInput) {
          guestInput.focus();
        }
      }, 200);
      return false;
    }
    return true;
  };

  const validateAddressBuffer = () => {
    const isValid = isDistanceBufferValid(
      orderInfo.deliveryDistance,
      config?.deliveryCoverageBufferInMeters ?? 0,
      config?.forceOrderWithinDeliveryCoverage === 1
    );
    if (!isValid) {
      showAlert({
        title: "Warning",
        description: `
        ${storeData?.store.name} does not provide delivery service in this area.
        Delivery coverage is limited to ${getDistanceBuffer(
          config?.deliveryCoverageBufferInMeters ?? 0,
          filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK"
        )} ${getDistanceUnit(
          filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK"
        )}`,
        confirmText: "OK",
      });
      return false;
    }
    return true;
  };

  // const validatePayment = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   if (totalOrderAmount < 1) {
  //     return true;
  //   }
  //   if (orderInfo.paymentMethodId === 0) {
  //     setError({
  //       message: "Please select a payment method to process with your order.",
  //       variant: ErrorVariant.Warning,
  //     });
  //     return false;
  //   }
  //   if (orderInfo.paymentMethodId !== 2) {
  //     return true;
  //   }
  //   if (orderInfo.paymentGatewayId === 0) {
  //     setError({
  //       message: "Please select a gateway to process with your order.",
  //       variant: ErrorVariant.Warning,
  //     });
  //     return false;
  //   }
  //   if (orderInfo?.paymentGateway?.name?.toLowerCase() === "gpay") {
  //     onGooglePay(e);
  //     return false;
  //   }
  //   if (orderInfo.paymentGateway?.name?.toLowerCase() === "jazzcash") {
  //     if (!orderInfo.jazzCashMode) {
  //       setError({
  //         title: "JazzCash",
  //         message:
  //           "Please select a jazzcash payment method, you can either pay from mobile acount or pay through card.",
  //         variant: ErrorVariant.Warning,
  //       });
  //       return false;
  //     }
  //     if (orderInfo.jazzCashMode === "wallet") {
  //       if (!isValidMobileNumber(orderInfo.jazzCashNumber)) {
  //         setError({
  //           title: "JazzCash",
  //           message: "Please enter a valid mobile number. e.g 03001234567",
  //           variant: ErrorVariant.Warning,
  //         });
  //         return false;
  //       }
  //       if (!isSixDigitNumber(orderInfo.jazzCashCNIC)) {
  //         setError({
  //           title: "JazzCash",
  //           message: "Please enter a last 6 digits of your CNIC.",
  //           variant: ErrorVariant.Warning,
  //         });
  //         return false;
  //       }
  //       initiateJCPayment();
  //       return false;
  //     }
  //     if (orderInfo.jazzCashMode === "card") {
  //       triggerJazzCashPayment();
  //       return false;
  //     }
  //   }
  //   if (orderInfo.paymentGateway?.name?.toLowerCase() === "easypaisa") {
  //     prepareRequest();
  //     return false;
  //   }

  //   return true;
  // };

  const validateOrder = () =>
    // e: React.MouseEvent<HTMLButtonElement>
    {
      if (
        !checkMinimumDeliveryAmount() ||
        !checkAddress() ||
        !validateAddressBuffer() ||
        // !validateGuests() ||
        !validatePhone() ||
        !validateEmail()
        // ||
        // !validatePayment(e)
      )
        return;
      // console.log("first");
      showAlert({
        title: "Confirm Order",
        description: `Are our sure, you want to ${
          isValidOrderEdit
            ? `update quotation #${atob(saleId)}`
            : "place an quotation"
        } of amount <b>${currencyCode} ${totalOrderAmount?.toFixed(2)}</b>?`,
        confirmText: isValidOrderEdit ? "Save Quotation" : "Submit Quotation",
        cancelText: "Cancel",
        onConfirm: () => {
          placeOrder();
        },
      });
    };
  // console.log(order_products);
  const placeOrder = (paymentData?: string) => {
    const reqTime = moment().format("YYYY-MM-DDTHH:mm:ss");

    const kitchenTime = getMaxKitchenTime(items);
    const readyTime = config?.orderReadyRequiredTimeInMin ?? 0;

    const deliveryTime = moment(reqTime)
      .add(kitchenTime + readyTime, "minutes")
      .format("YYYY-MM-DDTHH:mm:ss");

    const guestCount = 0;

    const customerInfo =
      !orderInfo.name &&
      !orderInfo.phone &&
      !orderInfo.email &&
      !orderInfo.stateId &&
      !orderInfo.whatsApp
        ? ""
        : JSON.stringify({
            name: orderInfo?.name,
            contact: orderInfo.phone,
            email: orderInfo.email,
            state:
              lovs?.states?.find((state) => state.id === orderInfo?.stateId)
                ?.name ?? "",
            whatsapp: orderInfo?.whatsApp,
          });

    const gpsLocation =
      selectedPosition &&
      selectedPosition?.[0] !== null &&
      selectedPosition?.[1] !== null
        ? JSON.stringify({
            latitude: selectedPosition[0] ?? 0,
            longitude: selectedPosition[1] ?? 0,
          })
        : "";

    const serviceCharges = orderInfo.serviceCharges;

    const deliveryCharges = orderInfo.deliveryCharges;

    let saleDetails = [];
    if (!saleId) {
      saleDetails = items.map((item) => ({
        id: 0,
        productDetailId: item.productDetailId,
        productName: item.productname ?? "",
        productDetailOptionId: item?.optionId ?? 0,
        saleRate: item.unitprice,
        lineDiscount: item.linediscount,
        tax: calculateEachProductTax(item),
        qty: item.quantity,
        earnedPoints: (item?.points ?? 0) * item.quantity,
      }));
    } else {
      const existingProductIds = new Set(
        items.map((item) => item.productDetailId)
      );
      // console.log(order_products);
      saleDetails = [
        // Add existing items with status 1
        ...items.map((item) => ({
          id: isValidOrderEdit ? item.saleDetailId ?? 0 : 0,
          productDetailId: item.productDetailId,
          productName: item.productname ?? "",
          productDetailOptionId: item?.optionId ?? 0,
          saleRate: item.unitprice,
          lineDiscount: item.linediscount,
          tax: calculateEachProductTax(item),
          qty: item.quantity,
          earnedPoints: (item?.points ?? 0) * item.quantity,
          status: 1,
        })),

        // Add missing products from `products` with qty: 0 and status: 2
        ...order_products
          .filter((product) => !existingProductIds.has(product.productDetailId))
          .map((product) => ({
            id: isValidOrderEdit ? product.saleDetailId ?? 0 : 0,
            productDetailId: product.productDetailId,
            productName: product.productName ?? "",
            productDetailOptionId: 0,
            saleRate: product.saleRate ?? 0,
            lineDiscount: 0,
            tax: 0,
            qty: product?.totalLoadedQty ?? 0,
            earnedPoints: 0,
            status: 2,
          })),
      ];
    }

    const deliveryNote =
      orderInfo.orderType === 3 && orderInfo.deliveryOption === 2
        ? orderInfo?.deliveryNote
        : "";

    const paidAmount =
      orderInfo.paymentMethodId === 2
        ? parseFloat(totalOrderAmount?.toFixed(2))
        : orderInfo?.paidAmount > 0
        ? parseFloat(orderInfo?.paidAmount?.toFixed(2))
        : 0;

    const tipAmount = orderInfo?.tipAmount ?? 0;
    const parseBookingInfo: BookingInfo[] | null = (() => {
      if (
        !order_products[0]?.bookingjson ||
        typeof order_products[0].bookingjson !== "string"
      ) {
        return null;
      }

      try {
        return JSON.parse(order_products[0].bookingjson) as BookingInfo[];
      } catch (error) {
        console.error("Error parsing bookingjson:", error);
        return null;
      }
    })();
    const saleIdDecoded = parseInt(saleId ? atob(saleId) : "0");
    const selectedSeats = orderInfo?.selectedSeats || [];

    const mergedTableBookings = [
      // Process parsed bookings
      ...(parseBookingInfo ?? []).map((item) => {
        const seatExists = selectedSeats.some(
          (seat) =>
            seat.tableId === item.RestaurantTableId &&
            seat.seatIndex + 1 === item.SeatId
        );

        return {
          RestaurantTableId: item.RestaurantTableId,
          SaleId: saleIdDecoded,
          SeatId: item.SeatId,
          Id: item.id,
          ResStatusId: seatExists
            ? orderInfo.paymentMethodId === 2
              ? 3
              : 2
            : 1, // if not found in selectedSeats
          ReservationType: 19,
          GuestName: item.guestname ?? orderInfo.name ?? "",
          Status: seatExists ? 1 : 2,
        };
      }),

      // Add new seats from selectedSeats not in parsed data
      ...selectedSeats
        .filter(
          (seat) =>
            !parseBookingInfo?.some(
              (parsed) =>
                parsed.RestaurantTableId === seat.tableId &&
                parsed.SeatId === seat.seatIndex + 1
            )
        )
        .map((seat) => ({
          RestaurantTableId: seat.tableId,
          SaleId: saleIdDecoded,
          SeatId: seat.seatIndex + 1,
          Id: 0,
          ResStatusId: orderInfo.paymentMethodId === 2 ? 3 : 2,
          ReservationType: 19,
          GuestName: orderInfo.name ?? "",
          Status: 1,
        })),
    ];

    const orderBody = {
      id: isValidOrderEdit ? parseInt(saleId ? atob(saleId) : "0") : 0,
      guestscount: guestCount,
      deliveryTime,
      customerInfo,
      gpsLocation,
      serviceCharges,
      deliveryCharges,
      saleDetails,
      ...(orderInfo.isRedeemPoints && {
        earnedPointsJson: {
          contact: orderInfo.phone,
          totalPoints: parseFloat(orderInfo.pointsRedeemed?.toFixed(2)),
          message: "",
          status: 8,
        },
      }),
      deliveryNote,
      vehicleNo: "",
      approvalStatusId: 1,
      appUserId: getOrCreateSessionId() || "",
      storeId: items[0]?.storeId,
      dealCode: items[0]?.dealCode ?? "",
      createdBy: user?.id ?? process.env.NEXT_PUBLIC_KIOSK_ID,
      requireTime: isValidOrderEdit
        ? order_products?.[0]?.requireTime
        : reqTime,
      payableAmount: parseFloat(
        getPayableAmount(totalPrice, config, orderInfo)
      ),
      dueAmount: parseFloat(getPayableAmount(totalPrice, config, orderInfo)),
      paidAmount: paidAmount,
      paymentStatusId: orderInfo.paymentMethodId === 2 ? 1 : 0,
      paymentMethodId: orderInfo?.paymentMethodId ?? 0,
      netDiscount: 0,
      taxAmount: parseFloat(getTaxAmount(totalPrice, config?.tax ?? 0)),
      saleTypeId: orderInfo.orderType ?? 1,
      orderNote: config?.enableOrderNotes ? orderInfo.orderNote ?? "" : "",
      address: orderInfo.address ?? "",
      deliveryOptionId:
        orderInfo.orderType === 3 ? orderInfo.deliveryOption : 0,
      tipAmount,
      voucherCode: orderInfo?.voucherCode ?? "",
      voucherAmount: orderInfo?.voucherDiscount ?? 0,
      pointsAmount: parseFloat(orderInfo?.pointsDiscount?.toFixed(2) ?? 0),
      paymentRef: paymentData ?? "",
      fmctoken: "",
      tableBookings: mergedTableBookings,
    };
    // console.log({ orderBody });
    // console.log(JSON.stringify(orderBody));
    // return;
    placeCompactOrder(
      { orderBody },
      {
        onSuccess: (response) => {
          // console.log(response);
          if (response && response.status === true) {
            const orderResponse = response.data as ORDER_RESPONSE;

            // if (socketRef && user) {
            //   const message = {
            //     userId: user?.id,
            //     storeId: items[0]?.storeId,
            //     attachments: JSON.stringify([items[0]?.producturl]),
            //     payable: `${
            //       items[0]?.dealCode
            //         ? items[0]?.schemeAmount?.toFixed(2)
            //         : parseFloat(
            //             getPayableAmount(totalPrice, config, orderInfo)
            //           )
            //     }`,
            //     token: orderResponse?.salesinvoicecode,
            //     trackingId: orderResponse?.saleid?.toString(),
            //     items: items,
            //     orderNote: orderInfo?.orderNote ?? "",
            //   };
            //   console.log("emit");
            //   socketRef?.current?.emit("orderMessage", message);
            // }
            showAlert({
              className: "text-center",
              title: `Order ${isValidOrderEdit ? "Edited" : "Placed"}`,
              content: (
                <div className="w-full flex justify-center items-center py-4">
                  <div className="w-40 h-40">
                    <Lottie animationData={checkmarkAnimation} loop={false} />
                  </div>
                </div>
              ),
              showActions: false,
              description: `Your order Token #${orderResponse?.salesinvoicecode
                ?.toString()
                ?.slice(-4)
                ?.padStart(4, "0")} & Tracking #${
                orderResponse?.saleid
              } has been  ${
                isValidOrderEdit ? "updated" : "placed"
              } successfully. Please wait for your turn or track your order status.`,
            });

            if (isValidOrderEdit) {
              let link = "";
              if (user?.roleId === USER_ROLE.USER) {
                link = `/orders/${btoa(atob(saleId).toString())}`;
              } else {
                link = `/dashboard/orders/${btoa(atob(saleId).toString())}`;
              }
              router.replace(link);
              hideAlert();
              resetOrderInfo();
              setTimeout(() => {
                clearCart();
              }, 1000);
            } else {
              let link = "";
              if (user?.roleId === USER_ROLE.USER) {
                link = `/menu`;
              } else {
                link = `/dashboard/menu`;
              }
              setTimeout(() => {
                router.replace(link);
              }, 4000);

              setTimeout(() => {
                resetOrderInfo();
                hideAlert();
                clearCart();
              }, 5000);
            }
          } else if (
            response &&
            response.status === false &&
            response.errorCode !== "0" &&
            response.message
          ) {
            setError({
              title: "Error",
              message: response.message,
              variant: ErrorVariant.Error,
            });
          }
        },
        onError: (error) => {
          console.log(error);
          setError({
            title: "Error",
            message: "Something went wrong. Please try again.",
            variant: ErrorVariant.Error,
          });
        },
      }
    );
  };

  // useEffect(() => {
  //   if (!socketRef.current) return;
  //   const handleJCPayment = (ipnData: JazzCashIPNData) => {
  //     // console.log({ ipnData });
  //     jazzCashRef.current?.close();
  //     if (ipnData.ipnData.pp_TxnRefNo === orderInfo.jazzCashTxnRef) {
  //       if (ipnData.status) {
  //         const filteredResponse = {
  //           pp_TxnType: ipnData?.ipnData?.pp_TxnType || "",
  //           pp_Amount: ipnData?.ipnData?.pp_Amount || "",
  //           pp_BillReference: ipnData?.ipnData?.pp_BillReference || "",
  //           pp_ResponseCode: ipnData?.ipnData?.pp_ResponseCode || "",
  //           pp_RetreivalReferenceNo:
  //             ipnData?.ipnData?.pp_RetreivalReferenceNo || "",
  //           pp_SubMerchantID: ipnData?.ipnData?.pp_SubMerchantID || "",
  //           pp_TxnCurrency: ipnData?.ipnData?.pp_TxnCurrency || "",
  //           pp_TxnDateTime: ipnData?.ipnData?.pp_TxnDateTime || "",
  //           pp_TxnRefNo: ipnData?.ipnData?.pp_TxnRefNo || "",
  //           pp_MobileNumber: ipnData?.ipnData?.pp_MobileNumber || "",
  //           pp_CNIC: ipnData?.ipnData?.pp_CNIC || "",
  //           pp_SecureHash: ipnData?.ipnData?.pp_SecureHash || "",
  //         };
  //         placeOrder(btoa(JSON.stringify(filteredResponse)));
  //       } else {
  //         setError({
  //           title: "Error",
  //           message:
  //             ipnData.ipnData.pp_ResponseMessage ??
  //             "Payment failed. Please try again.",
  //           variant: ErrorVariant.Error,
  //         });
  //       }
  //     }
  //   };
  //   const socket = socketRef.current;
  //   socket.on("jcipn", handleJCPayment);

  //   return () => {
  //     socket.off("jcipn", handleJCPayment); // 🔥 Proper cleanup
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [socketRef, orderInfo.jazzCashTxnRef, jazzCashRef]);

  // useEffect(() => {
  //   const amount = searchParams.get("amount");
  //   const orderRefNumber = searchParams.get("orderRefNumber");
  //   const message = searchParams.get("message");
  //   const transactionRefNumber = searchParams.get("transactionRefNumber");

  //   const pp_TxnType = searchParams.get("pp_TxnType") || "";
  //   const pp_Amount = searchParams.get("pp_Amount") || "";
  //   const pp_BillReference = searchParams.get("pp_BillReference") || "";
  //   const pp_ResponseCode = searchParams.get("pp_ResponseCode") || "";
  //   const pp_RetreivalReferenceNo =
  //     searchParams.get("pp_RetreivalReferenceNo") || "";
  //   const pp_SubMerchantID = searchParams.get("pp_SubMerchantID") || "";
  //   const pp_TxnCurrency = searchParams.get("pp_TxnCurrency") || "";
  //   const pp_TxnDateTime = searchParams.get("pp_TxnDateTime") || "";
  //   const pp_TxnRefNo = searchParams.get("pp_TxnRefNo") || "";
  //   const pp_MobileNumber = searchParams.get("pp_MobileNumber") || "";
  //   const pp_CNIC = searchParams.get("pp_CNIC") || "";
  //   const pp_SecureHash = searchParams.get("pp_SecureHash") || "";
  //   const pp_ResponseMessage = searchParams.get("pp_ResponseMessage") || "";

  //   const filteredResponse = {
  //     pp_TxnType,
  //     pp_Amount,
  //     pp_BillReference,
  //     pp_ResponseCode,
  //     pp_RetreivalReferenceNo,
  //     pp_SubMerchantID,
  //     pp_TxnCurrency,
  //     pp_TxnDateTime,
  //     pp_TxnRefNo,
  //     pp_MobileNumber,
  //     pp_CNIC,
  //     pp_SecureHash,
  //   };
  //   // console.log({ pp_ResponseMessage });
  //   setTimeout(() => {
  //     if (pp_TxnRefNo && pp_TxnRefNo === orderInfo.jazzCashTxnRef) {
  //       if (pp_ResponseCode === "000") {
  //         placeOrder(btoa(JSON.stringify(filteredResponse)));
  //       } else {
  //         setError({
  //           title: "Error",
  //           message: pp_ResponseMessage ?? "Payment failed. Please try again.",
  //           variant: ErrorVariant.Error,
  //         });
  //         window.history.replaceState({}, document.title, pathname);
  //       }
  //     }
  //     if (amount || orderRefNumber || message) {
  //       if (message) {
  //         setError({
  //           title: "EasyPaisa Payment Error",
  //           message: message,
  //           variant: ErrorVariant.Error,
  //         });
  //         window.history.replaceState({}, document.title, pathname);
  //       } else {
  //         const paymentData = {
  //           orderRefNumber,
  //           message,
  //           amount,
  //           transactionRefNumber,
  //         };
  //         placeOrder(btoa(JSON.stringify(paymentData)));
  //       }

  //       // Remove query params from URL
  //     }
  //   }, 1500);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchParams, pathname]);

  // useEffect(() => {
  //   if (isPaymentSuccess) placeOrder();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isPaymentSuccess]);

  return (
    <div className="fixed lg:static bottom-0 left-0 right-0 bg-background p-2 border-t lg:border-t-0 lg:bg-transparent z-10 space-y-2">
      {isPending && (
        <Spinner
          text={isPending ? "Placing order..." : "Redirecting to jazzcash..."}
        />
      )}
      {/* <JCInitiateLoading isOpen={paymentInitiatedPending} />
      <JazzCashConfirm
        ref={jazzCashRef}
        isVisible={isPaymentInitiated}
        placeOrder={placeOrder}
      /> */}
      <div className="lg:hidden flex justify-between text-lg font-bold items-center">
        <div className="flex flex-col">
          <span>Total</span>
          <span className="text-muted-foreground text-sm">
            (incl. fees and tax)
          </span>
        </div>
        <span
          dangerouslySetInnerHTML={{
            __html: `${currencyCode} ${totalOrderAmount?.toFixed(2)}`,
          }}
        />
      </div>
      <div className="flex gap-2 max-w-screen-md mx-auto">
        {items.length > 0 && (
          <Button
            className="flex-1 h-12"
            variant="outline"
            onClick={() =>
              router.replace(
                `/menu/${
                  isValidOrderEdit ? `?saleId=${btoa(atob(saleId))}` : ""
                }`
              )
            }
          >
            Add More Items
          </Button>
        )}
        {/* {GooglePayButtonComponent} */}
        <Button
          disabled={isFetching}
          className="flex-1 h-12"
          onClick={validateOrder}
        >
          {isFetching || pendingOrderItems ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {isValidOrderEdit ? (
                <span>Update Order</span>
              ) : (
                <span>Submit</span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
