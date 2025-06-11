import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useLocation } from "@/context/location-context";
import { useOrder } from "@/context/order-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useGetAddress, useGetDistance } from "@/hooks/useMap";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  calculateRateBasedOnDistance,
  getDistanceBuffer,
  getDistanceUnit,
  isDistanceBufferValid,
  parseGpsLocation,
} from "@/utils/storeUtils";
import polyline from "@mapbox/polyline";
import { useEffect } from "react";

export const useDistanceAndAddressInfo = () => {
  const { setOrderInfo } = useOrder();
  const { config } = useConfig();
  const { userLocation, ipInfo, selectedPosition } = useLocation();
  const { items } = useCart();
  const { showAlert } = useAlert();
  const { filters } = useRestaurantFilters();

  const { storeData } = useStoreInfo(items[0]?.storeId?.toString() ?? "");
  const mapCoords = parseGpsLocation(storeData?.store?.gpslocation);

  const { data: addressData } = useGetAddress(
    selectedPosition?.[0] ?? userLocation?.userLatitude ?? 0,
    selectedPosition?.[1] ?? userLocation?.userLongitude ?? 0
  );
  const { isFetching, data, error } = useGetDistance(
    mapCoords?.longitude ?? 0,
    mapCoords?.latitude ?? 0,
    selectedPosition?.[1] ?? 0,
    selectedPosition?.[0] ?? 0
    // orderInfo?.orderType ?? 0
  );

  const showWarning = () => {
    showAlert({
      title: "Warning",
      description: `
        ${storeData?.store.name} does not provide delivery service in this area.
        Delivery coverage is limited to ${getDistanceBuffer(
          config?.deliveryCoverageBufferInMeters ?? 0,
          ipInfo?.geoplugin_countryCode ?? "PK"
        )} ${getDistanceUnit(ipInfo?.geoplugin_countryCode ?? "PK")}`,
      confirmText: "OK",
    });
  };

  useEffect(() => {
    if (data) {
      // console.log({ data });
      const distance = data?.routes[0]?.distance ?? 0;
      const isValid = isDistanceBufferValid(
        distance,
        config?.deliveryCoverageBufferInMeters ?? 0,
        config?.forceOrderWithinDeliveryCoverage === 1
      );

      const decodeGeometry = polyline.decode(data?.routes[0]?.geometry);

      const deliveryCharge = calculateRateBasedOnDistance({
        distanceInMeters: distance,
        ratePerUnit: config?.deliveryCharges ?? 0,
        minimumCharge: config?.minDeliveryCharges ?? 0,
        freeDeliveryRadiusInMeters: config?.freeDeliveryAreaInMeters ?? 0,
        countryCode:
          filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK",
      });
      setOrderInfo((prev) => ({
        ...prev,
        deliveryCharges: deliveryCharge,
        deliveryDistance: distance,
        decodeGeometry,
      }));

      if (!isValid) {
        showWarning();
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, config, ipInfo, storeData, filters?.country]);

  useEffect(() => {
    if (addressData) {
      setOrderInfo((prev) => ({
        ...prev,
        address: addressData.display_name,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData]);
  return { isFetching, error };
};
