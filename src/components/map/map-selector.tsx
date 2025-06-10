import { useConfig } from "@/context/config-context";
import { useLocation } from "@/context/location-context";
import { useOrder } from "@/context/order-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import storeMarkerIcon from "@/assets/store-marker.png";
import { API_URL } from "@/services/apiClient";
import { getDeliveryCoverageBuffer, getDistanceUnit } from "@/utils/storeUtils";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";

// Fix Leaflet default icon path issue
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

fixLeafletIcon(); // Call the fix function

const MapEvents = ({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FlyToLocation = ({ position }: { position: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 18); // 18 is zoom level, can adjust
    }
  }, [position, map]);

  return null;
};

const MapSelector = () => {
  const { selectedPosition, setSelectedPosition, ipInfo } = useLocation();
  const { config } = useConfig();
  const { filters } = useRestaurantFilters();
  const { orderInfo } = useOrder();
  const { storeData } = useStoreInfo(config?.storeId?.toString() ?? "1");
  const storeLocation = storeData?.store?.gpslocation
    ?.trim()
    ?.split(",")
    .reverse()
    .map(Number);

  const limeOptions = { color: "red" };

  const storeIcon = new Icon({
    iconUrl: storeData?.store?.logoPath
      ? API_URL + storeData?.store?.logoPath
      : storeMarkerIcon.src,
    iconSize: [30, 30],
    className: "bg-white/50 rounded",
  });
  return (
    <MapContainer
      center={selectedPosition || [0, 0]}
      zoom={18}
      style={{
        height: "400px",
        width: "100%",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onClick={(lat, lng) => setSelectedPosition([lat, lng])} />
      {selectedPosition && (
        <>
          <Marker position={selectedPosition}>
            <Tooltip direction="top" offset={[-15, -15]} opacity={1} permanent>
              {getDeliveryCoverageBuffer(
                orderInfo.deliveryDistance,
                filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK"
              )}{" "}
              {getDistanceUnit(
                filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK"
              )}
            </Tooltip>
          </Marker>
          {storeLocation && storeLocation.length === 2 && (
            <Marker
              position={storeLocation as [number, number]}
              icon={storeIcon}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                {storeData?.store?.name}
              </Tooltip>
            </Marker>
          )}
          {orderInfo.decodeGeometry && (
            <Polyline
              pathOptions={limeOptions}
              positions={orderInfo.decodeGeometry}
            />
          )}
          <FlyToLocation position={selectedPosition} />
        </>
      )}
    </MapContainer>
  );
};

export default MapSelector;
