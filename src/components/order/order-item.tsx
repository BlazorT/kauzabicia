import { USER_ROLE } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useLOV } from "@/context/lov-context";
import { useElapsedTime } from "@/hooks/useElapsedTime";
import { useMenu } from "@/hooks/useMenu";
import { useFetchOrderDetails } from "@/hooks/useOrder";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { API_URL } from "@/services/apiClient";
import { getOrderDelayColor } from "@/utils/orderUtils";
import { MenuItem, ORDER, OrderProduct } from "@/utils/types";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import ManageOrder from "./manage-order";
import PayOrder from "./pay-order";

type OrderItemProps = {
  order: ORDER;
  isActiveOrder: boolean;
};

const OrderItem: React.FC<OrderItemProps> = ({ order, isActiveOrder }) => {
  const router = useRouter();
  const { lovs } = useLOV();
  const { user } = useAuth();
  const { showAlert, hideAlert } = useAlert();
  const { items, addItem, clearCart, totalPrice } = useCart();
  const { storeData } = useStoreInfo(order.storeid?.toString());
  const { data: orderDetailRes, isPending } = useFetchOrderDetails(
    order.saleid?.toString()
  );
  const { data: menuResponse, isLoading } = useMenu(
    order?.storeid?.toString(),
    moment().format("YYYY-MM-DDTHH:mm:ss")
  );
  const menuData = useMemo(() => menuResponse?.data ?? [], [menuResponse]) as
    | MenuItem[]
    | [];

  const orderStatus = useMemo(
    () => lovs?.statuses?.find((s) => s.id === order?.status)?.name,
    [lovs?.statuses, order.status]
  );

  // const orderType = useMemo(
  //   () => lovs?.ordertypes?.find((s) => s.id === order.saleTypeId)?.name,
  //   [lovs?.ordertypes, order.saleTypeId]
  // );

  const order_products = useMemo(
    () => orderDetailRes?.data ?? [],
    [orderDetailRes]
  ) as OrderProduct[];

  const { color: delayColor, label: delayLabel } = getOrderDelayColor(
    order.requireTime,
    order.deliveryTime
  );

  const { hours, minutes, seconds, timeRemaining } = useElapsedTime(
    order.requireTime,
    order.deliveryTime
  );
  const showElapsedTimer =
    timeRemaining > 0 && orderStatus === "Active" && order.saleTypeId === 3;

  const onRepeatOrder = () => {
    if (!storeData?.isStoreOpen) {
      showAlert({
        title: "Store Closed",
        description: `The ${
          storeData?.store?.name
        } is closed on ${moment().format("DD-MM-YYYY, hh:mm")}`,
        confirmText: "OK",
      });
      return;
    }
    if (items.length > 0 && items[0]?.storeId !== order.storeid) {
      showAlert({
        title: "Warning",
        description: `Already your order of amount <b>${totalPrice?.toFixed(
          2
        )}</b> is pending from another restaurant. You want to continue the previous order or create new order.`,
        actions: [
          {
            variant: "destructive",
            title: "Cancel",
            onClick: () => {
              hideAlert();
            },
          },
          {
            variant: "outline",
            title: "New Order",
            onClick: () => {
              hideAlert();
              clearCart();
              addOrderToCart();
            },
          },
          {
            variant: "outline",
            title: "Continue",
            onClick: () => {
              hideAlert();
              let link = "";
              if (user?.roleId === USER_ROLE.USER) {
                link = "/menu";
              } else {
                link = "/dashboard/menu";
              }
              router.push(link);
            },
          },
        ],
      });
      return;
    }
    addOrderToCart();
  };

  const addOrderToCart = () => {
    const unavailableItems = [];

    const updatedItems: MenuItem[] = order_products
      .map((orderItem) => {
        const menuItem = menuData.find(
          (item) => item.productDetailId === orderItem.productDetailId
        );
        if (menuItem) {
          let offerQty = 0;
          let disPercent = 0;

          disPercent = parseFloat(menuItem?.offerPerc?.toFixed(2) ?? 0);
          offerQty = menuItem?.offerQty ?? 0;

          return {
            ...orderItem,
            ...menuItem,
            orderId: order.saleid,
            quantity: orderItem.totalLoadedQty,
            offerQty: offerQty ?? 0,
            offerPerc: disPercent ?? 0,
            initialLineDiscount: menuItem?.linediscount ?? 0,
          };
        }
        unavailableItems.push(orderItem);
        return null; // Return null if no match found
      })
      .filter((item) => item !== null) as MenuItem[]; // Ensure the filtered result is MenuItem[]

    if (updatedItems.length == 0) {
      showAlert({
        title: "Info",
        description: `No items found for this order at this moment. Please try again later.`,
        confirmText: "OK",
      });
      return;
    }
    updatedItems.forEach((item: MenuItem) => {
      addItem(item);
    });
    let link = "";
    if (user?.roleId === USER_ROLE.USER) {
      link = "/menu";
    } else {
      link = "/dashboard/menu";
    }
    router.push(link);
  };
  const onTrackOrder = () => {
    // console.log(order?.saleid?.toString().slice(-4).padStart(4, "0"));
    const track_url = `${API_URL}dHJhY2tteW9yZGVy/${btoa(
      order?.saleid?.toString()
    )}`;
    window.open(track_url, "_blank");
  };

  const toOrderDetails = () => {
    let link = "";
    if (user?.roleId === USER_ROLE.USER) {
      link = `/orders/${btoa(order.saleid?.toString())}`;
    } else {
      link = `/dashboard/orders/${btoa(order.saleid?.toString())}`;
    }
    router.push(link);
  };
  // console.log({ order });

  return (
    <Card className="p-0 ">
      <CardContent className={`p-2 relative rounded-lg`}>
        {order?.paymentStatusId === 1 && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="text-5xl font-bold text-green-500 opacity-20 rotate-[-20deg] select-none">
              PAID
            </div>
          </div>
        )}

        <div
          className="flex flex-row gap-4 items-start"
          onClick={toOrderDetails}
        >
          {/* Store Image
          <div className="w-15 md:w-28 flex justify-center">
            <Image
              src={storeImgErr ? "/no-image.png" : API_URL + order.url}
              alt="store"
              width={100}
              height={100}
              className="object-cover rounded-md self-start"
              onError={() => setStoreImgErr(true)}
            />
          </div> */}

          {/* Order Details */}
          <div className="flex flex-col flex-1 space-y-2">
            {/* Store Name & Total */}
            <div className="flex justify-between items-center w-full">
              <p className="text-base md:text-lg font-bold">
                {storeData?.store?.name}
              </p>
              <p className="text-base md:text-lg font-bold">
                PKR {order?.totalamount?.toFixed(2)}
              </p>
            </div>

            {/* Status and Time */}
            <p className="text-sm text-muted-foreground">
              {orderStatus === "Active" ? "Placed" : orderStatus} on{" "}
              {moment
                .utc(order.updatedat)
                .local()
                .format("ddd, DD MMM, h:mm A")}{" "}
              {/* Delay Status */}
            </p>
            {showElapsedTimer ? (
              <Badge className="text-xs text-white font-medium bg-green-700">
                {hours.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </Badge>
            ) : (
              <>
                {orderStatus === "Active" && (
                  <Badge
                    className={`text-white text-xs font-medium ${delayColor}`}
                  >
                    {delayLabel}
                  </Badge>
                )}
              </>
            )}
            {/* Delay Status */}

            {/* Order ID */}
            <p className="text-sm text-muted-foreground">
              Order #{order?.saleid} | Token #
              {order?.salesinvoicecode?.toString().slice(-4).padStart(4, "0")}
            </p>

            {/* Loader */}
            {isPending && (
              <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
            )}

            {/* Order Products */}
            {order_products.length > 0 && (
              <div className="text-sm space-y-1">
                {order_products.map((product, index) => (
                  <p key={index}>
                    {product.totalLoadedQty}x {product.productName}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-auto flex  md:absolute right-2 bottom-2 justify-end items-center gap-2 flex-wrap mt-1 md:mt-0">
          <ManageOrder order_products={order_products} order={order} />
          {user?.roleId !== USER_ROLE?.USER &&
            order?.status !== 5 &&
            order?.payableamount - order?.paidamount > 0 && (
              <PayOrder order={order} order_products={order_products} />
            )}
          {isActiveOrder && (
            <Button
              onClick={onTrackOrder}
              variant="outline"
              size="sm"
              className="w-auto"
            >
              Track Order
            </Button>
          )}
          <Button
            onClick={onRepeatOrder}
            variant="outline"
            size="sm"
            className="w-auto"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Repeat Order"
            )}
          </Button>
        </div>
        {/* <OrderReview orderItems={order_products} /> */}
      </CardContent>
    </Card>
  );
};

export default OrderItem;
