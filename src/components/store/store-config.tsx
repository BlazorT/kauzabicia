import { useConfig } from "@/context/config-context";
import { useLocation } from "@/context/location-context";
import { useLOV } from "@/context/lov-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { getDeliveryCoverageBuffer, getDistanceUnit } from "@/utils/storeUtils";
import { StoreInfo } from "@/utils/types";
import { Bike, Package2 } from "lucide-react";
import { useMemo } from "react";

const StoreConfig = ({
  store,
  detailedConfig = false,
}: {
  store: StoreInfo;
  detailedConfig: boolean;
}) => {
  const { config } = useConfig();
  const { lovs } = useLOV();
  const { ipInfo } = useLocation();
  const { filters } = useRestaurantFilters();

  const distanceUnit = useMemo(
    () =>
      getDistanceUnit(
        filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK"
      )?.toUpperCase(),
    [ipInfo, filters?.country]
  );
  const currencyCode =
    lovs?.currencies?.find((c) => c.id === store?.currencyId)?.code ??
    store.currencyCode;

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 justify-between">
      <span className="flex-1 text-foreground">{label}</span>
      <span
        className="flex-1 text-left text-primary"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
  if (!config) return null;
  const { freeDeliveryAreaInMeters, isDeliveryAllowed, minimumOrderLimit } =
    config;

  return (
    <div>
      {!detailedConfig ? (
        <>
          {isDeliveryAllowed && (
            <div className="flex items-center gap-2">
              {(freeDeliveryAreaInMeters ?? 0) > 0 && (
                <span className="text-primary flex items-center gap-2">
                  <Bike size={20} />
                  free delivery within{" "}
                  {getDeliveryCoverageBuffer(
                    freeDeliveryAreaInMeters ?? 0,
                    ipInfo?.geoplugin_countryCode ?? ""
                  )}{" "}
                  {distanceUnit}
                </span>
              )}
              {minimumOrderLimit ? (
                <span className="flex items-center gap-2">
                  <Package2 size={20} />
                  Min. delivery order
                  <span
                    dangerouslySetInnerHTML={{ __html: currencyCode ?? "" }}
                  />
                  {minimumOrderLimit}
                </span>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Restaurant Information</h2>
          {/* <Row
            label={"Accept Advance Orders"}
            value={config?.advanceOrdersAllowed ? "Yes" : "No"}
          /> */}
          {(config?.forceOrderAfterPayment === 1 ||
            config?.paidTakeAwayOrdersOnly === true ||
            config?.paidDineInOrdersOnly === true) && (
            <Row
              label={"Paid Orders"}
              value={`${[
                config?.forceOrderAfterPayment === 1 && "Delivery",
                config?.paidDineInOrdersOnly === true && "Dine In",
                config?.paidTakeAwayOrdersOnly === true && "Take Away",
              ]
                .filter(Boolean)
                .join(", ")}`}
            />
          )}
          {(!config?.isDeliveryAllowed ||
            !config?.takeAwayAllowed ||
            !config?.dineInAllowed) && (
            <Row
              label={"Order Allowed"}
              value={`${
                [
                  config?.isDeliveryAllowed && "Delivery",
                  config?.takeAwayAllowed && "Take Away",
                  config?.dineInAllowed && "Dine In",
                ].filter(Boolean).length === 0
                  ? "No"
                  : [
                      config?.isDeliveryAllowed && "Delivery",
                      config?.takeAwayAllowed && "Take Away",
                      config?.dineInAllowed && "Dine In",
                    ]
                      .filter(Boolean)
                      .join(", ")
              }`}
            />
          )}
          {config?.isDeliveryAllowed == true &&
            config?.forceOrderWithinDeliveryCoverage == 1 &&
            (config?.deliveryCoverageBufferInMeters ?? 0) > 0 && (
              <Row
                label={"Delivery Coverage"}
                value={`${getDeliveryCoverageBuffer(
                  config?.deliveryCoverageBufferInMeters ?? 0,
                  "PK"
                )} ${distanceUnit}`}
              />
            )}
          {config?.isDeliveryAllowed &&
            (config?.freeDeliveryAreaInMeters ?? 0) > 0 && (
              <Row
                label={"Free Delivery Area"}
                value={`${getDeliveryCoverageBuffer(
                  freeDeliveryAreaInMeters ?? 0,
                  ipInfo?.geoplugin_countryCode ?? ""
                )} ${distanceUnit}`}
              />
            )}
          {config?.isDeliveryAllowed &&
            (config?.minimumOrderLimit ?? 0) > 0 && (
              <Row
                label={"Min Order Limit (Delivery)"}
                value={`${currencyCode ?? ""}${config?.minimumOrderLimit}`}
              />
            )}
          {config?.isDeliveryAllowed &&
            (config?.minDeliveryCharges ?? 0) > 0 && (
              <Row
                label={"Min Delivery Charges"}
                value={`${currencyCode ?? ""}${config?.minDeliveryCharges}`}
              />
            )}
          {config?.isDeliveryAllowed && (config?.deliveryCharges ?? 0) > 0 && (
            <Row
              label={"Delivery Charges"}
              value={`${currencyCode ?? ""}${
                config?.deliveryCharges
              }/${distanceUnit}`}
            />
          )}
          {(config.serviceCharges ?? 0) > 0 && (
            <Row
              label={"Service Charges"}
              value={`${config.serviceCharges}%`}
            />
          )}
          {(config.tax ?? 0) > 0 && (
            <Row label={"Tax"} value={`${config.tax}%`} />
          )}
        </div>
      )}
    </div>
  );
};

export default StoreConfig;
