"use client";

import OrderDetails from "@/components/order/order-detail";
import OrderInvoice from "@/components/order/order-invoice";
import OrderReview from "@/components/order/order-review";
import OrderSummary from "@/components/order/order-summary";
import { ErrorState } from "@/components/store/store-status";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import { useLOV } from "@/context/lov-context";
import { useFetchOrderDetails } from "@/hooks/useOrder";
import { API_URL } from "@/services/apiClient";
import { OrderProduct } from "@/utils/types";
import moment from "moment";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const OrderDetail = () => {
  const params = useParams();
  const { lovs } = useLOV();
  const { user } = useAuth();
  const encodedOrderId = params.orderId; // Get the potentially encoded orderId

  let orderId: string | null = null;
  let isNumericStoreId = false;

  if (typeof encodedOrderId === "string") {
    try {
      const base64Str = decodeURIComponent(encodedOrderId);
      const decodedId = atob(base64Str);
      // console.log({ decodedId });
      if (/^\d+$/.test(decodedId)) {
        isNumericStoreId = true;
        orderId = decodedId;
      } else {
        console.warn("Decoded orderId is not numeric:", decodedId);
      }
    } catch (e) {
      console.warn("Failed to decode orderId:", e);
    }
  }

  // If the orderId is not numeric after decoding attempt, show 404
  if (!orderId || !isNumericStoreId) {
    notFound();
  }
  const {
    data: orderDetailRes,
    isPending,
    isError,
    error,
  } = useFetchOrderDetails(orderId);

  // console.log({ orderDetailRes });

  const order_products = useMemo(
    () => orderDetailRes?.data ?? [],
    [orderDetailRes]
  ) as OrderProduct[];

  const [storeImgErr, setStoreImgErr] = useState(false);

  const order = (order_products[0] ?? null) as OrderProduct | null;

  const orderStatus = useMemo(
    () => lovs?.statuses?.find((s) => s.id === order?.status)?.name,
    [lovs?.statuses, order]
  );

  const orderType = useMemo(
    () => lovs?.ordertypes?.find((s) => s.id === order?.saleTypeId)?.name,
    [lovs?.ordertypes, order]
  );
  //   const { storeData } = useStoreInfo(order_products[0]?.stor?.toString());

  const hasPassed48Hours =
    order?.lastUpdatedAt &&
    moment.utc(order.lastUpdatedAt).diff(moment.utc(), "hours") > 48;

  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const reviewedOrders = JSON.parse(
      localStorage.getItem("reviewedOrders") || "{}"
    );
    const orderKey = `${order?.saleId}_${user?.id || process.env.KIOSK_ID}`;
    setHasReviewed(!!reviewedOrders[orderKey]);
  }, [order?.saleId, user?.id]);

  const canReview =
    user && order?.status === 5 && !hasPassed48Hours && !hasReviewed;

  if (isPending) return <Spinner />;
  if (isError) return <ErrorState message={error.message} />;
  if (!order) return <ErrorState message={"Failed to get order deatails"} />;

  return (
    <div className="container mx-auto p-2 grid-cols-1 lg:grid-cols-6 grid gap-3">
      <div className="col-span-3 p-0 space-y-3">
        <Card className="p-0">
          <CardContent className="p-2 ">
            <div className="grid grid-cols-6 gap-2 items-start">
              <div className="col-span-1 place-content-center place-items-center">
                <Image
                  src={storeImgErr ? "/no-image.png" : API_URL + order.logoPath}
                  alt="store"
                  width={100}
                  height={100}
                  className="object-cover rounded-md shrink-0"
                  onError={() => setStoreImgErr(true)}
                />
              </div>
              <div className="col-span-5 space-y-3">
                <p className="text-lg font-bold">
                  {order.tradeName} - {order.storeAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  {orderType},{" "}
                  {orderStatus === "Active" ? "Placed" : orderStatus} on{" "}
                  {moment
                    .utc(order.lastUpdatedAt)
                    .local()
                    .format("ddd, DD MMM, h:mm A")}{" "}
                  {/* Delay Status */}
                </p>
                <p className="text-sm text-muted-foreground">
                  Order #{order?.saleId} | Token #
                  {order?.invoiceCode?.toString().slice(-4).padStart(4, "0")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <OrderSummary orderItems={order_products} />
      </div>
      <div className="col-span-3 lg:col-span-2 space-y-3">
        <OrderDetails order={order} />
        {canReview && (
          <Card className="p-0">
            <CardContent className="p-3 flex gap-3">
              <OrderReview orderItems={order_products} />
            </CardContent>
          </Card>
        )}
        <OrderInvoice orderItems={order_products} />
      </div>
    </div>
  );
};

export default OrderDetail;
