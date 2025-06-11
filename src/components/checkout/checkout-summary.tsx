import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useLocation } from "@/context/location-context";
import { useOrder } from "@/context/order-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  getMaxKitchenTime,
  getTaxAmount,
  getTotalOrderAmount,
} from "@/utils/cartUtils";
import { getDeliveryCoverageBuffer, getDistanceUnit } from "@/utils/storeUtils";
import { MenuItemPricing } from "../menu/menu-item-pricing";
import { ErrorState } from "../store/store-status";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { useLOV } from "@/context/lov-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import moment from "moment";

const CheckoutSummary = () => {
  const { items, totalPrice } = useCart();
  const { config } = useConfig();
  const { filters } = useRestaurantFilters();
  const { lovs } = useLOV();
  const { orderInfo } = useOrder();
  const { ipInfo } = useLocation();
  const { storeData, isLoading, isError } = useStoreInfo(
    config?.storeId?.toString() ?? ""
  );
  // console.log(items);

  const currencyCode = (
    <span
      dangerouslySetInnerHTML={{
        __html:
          lovs?.currencies?.find((c) => c.id === storeData?.store?.currencyId)
            ?.code ?? items[0]?.currencycode,
      }}
    />
  );

  const kitchenTime = getMaxKitchenTime(items);
  const readyTime = config?.orderReadyRequiredTimeInMin ?? 0;
  const reqTime = moment().format("YYYY-MM-DDTHH:mm:ss");

  const deliveryTime = moment(reqTime)
    .add(kitchenTime + readyTime, "minutes")
    .format("YYYY-MM-DDTHH:mm:ss");

  if (isError) return <ErrorState />;

  return (
    <Card className="px-3 py-3 lg:max-w-md md:max-w-full sm:max-w-full">
      <CardContent className="px-0 space-y-2 relative">
        {isLoading && (
          <div className="absolute top-10 left-0 w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <h2 className="text-2xl font-bold">Your Order Summary</h2>
        <p className="text-muted-foreground mb-4">
          {storeData?.store?.name} - {storeData?.store?.address}
        </p>
        <p className="text-muted-foreground mb-4">
          ETA - {moment(deliveryTime).format("ddd, MMM DD, h:mm A")}
        </p>
        <Separator />
        <div className="flex flex-col space-y-4">
          {items.map((item) => (
            <div className="flex justify-between" key={item.productDetailId}>
              <p>
                {item.quantity} x {item.productname}{" "}
                {item.unitname ? " - " + item.unitname : ""}{" "}
              </p>
              <MenuItemPricing
                priceClassName="flex-row-reverse"
                showOfferLabel={false}
                showPoints={false}
                item={item}
                className="text-md flex-col items-end gap-0 font-normal"
              />
            </div>
          ))}
        </div>
        <Separator />
        <div className="text-muted-foreground space-y-3">
          <div className="flex justify-between ">
            <p>Subtotal</p>
            <p>
              {items?.[0]?.isDeal && (
                <span className="line-through text-sm text-primary">
                  {items?.[0]?.schemeAmount?.toFixed(2)}
                </span>
              )}{" "}
              {totalPrice.toFixed(2)}
            </p>
          </div>
          {(config?.tax ?? 0) > 0 && (
            <div className="flex justify-between">
              <p>Tax</p>
              <p>{getTaxAmount(totalPrice, config?.tax ?? 0)}</p>
            </div>
          )}
          {(orderInfo.serviceCharges ?? 0) > 0 && (
            <div className="flex justify-between">
              <p>Service Charges</p>
              <p>{orderInfo.serviceCharges?.toFixed(2)}</p>
            </div>
          )}
          {orderInfo.deliveryCharges > 0 && (
            <div className="flex justify-between">
              <p>
                Delivery Charges{" "}
                <span className="text-primary text-xs">
                  (
                  {getDeliveryCoverageBuffer(
                    orderInfo.deliveryDistance,
                    filters?.country?.code ??
                      ipInfo?.geoplugin_countryCode ??
                      "PK"
                  )}{" "}
                  {getDistanceUnit(
                    filters?.country?.code ??
                      ipInfo?.geoplugin_countryCode ??
                      "PK"
                  )}
                  )
                </span>
              </p>
              <p>{orderInfo.deliveryCharges.toFixed(2)}</p>
            </div>
          )}
          {orderInfo.tipAmount > 0 && (
            <div className="flex justify-between">
              <p>Tip</p>
              <p>{orderInfo.tipAmount.toFixed(2)}</p>
            </div>
          )}
          {orderInfo.voucherDiscount > 0 && (
            <div className="flex justify-between">
              <p>
                Voucher Discount{" "}
                <span className="text-primary text-xs">
                  ({orderInfo.voucherCode})
                </span>
              </p>
              <p>-{orderInfo.voucherDiscount.toFixed(2)}</p>
            </div>
          )}
          {orderInfo.isRedeemPoints && (
            <div className="flex justify-between">
              <p>
                Points Balance{" "}
                {orderInfo.pointsRedeemed > 0 && (
                  <span className="text-primary text-xs">
                    ({orderInfo.pointsRedeemed} points)
                  </span>
                )}
              </p>
              <p>- {orderInfo.pointsDiscount.toFixed(2)}</p>
            </div>
          )}
          <Separator className="hidden lg:flex " />
          <div className="hidden lg:flex justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-medium text-foreground">Total </p>
              <span className="text-muted-foreground">
                (incl. fees and tax)
              </span>
            </div>
            <p className="text-2xl font-medium text-foreground">
              {currencyCode}{" "}
              {getTotalOrderAmount(totalPrice, config, orderInfo)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutSummary;
