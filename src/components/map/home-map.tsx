import { useLocation } from "@/context/location-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { StoreDetail } from "@/utils/types";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import storeMarkerIcon from "@/assets/store-marker.png";
import {
  extractLatLong,
  getDistanceUnit,
  haversineDistance,
} from "@/utils/storeUtils";
import StoreItem from "../store/store-item";
import { LandPlot } from "lucide-react";
import { API_URL } from "@/services/apiClient";

// Fix Leaflet icon once
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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
      map.flyTo(position, 17);
    }
  }, [position, map]);
  return null;
};

const fillBlueOptions = { fillColor: "blue" };

const storeIcon = (url: string) =>
  new Icon({
    iconUrl: url,
    iconSize: [30, 30],
    className: "bg-white/50 rounded",
  });

const HomeMap = ({
  searchBuffer,
  stores,
}: {
  searchBuffer: number;
  stores: StoreDetail[];
}) => {
  const { selectedPosition, setSelectedPosition, ipInfo } = useLocation();
  const { updateFilter, filters } = useRestaurantFilters();

  const countryCode =
    filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK";
  const distanceUnit = getDistanceUnit(countryCode)?.toUpperCase();

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    updateFilter("lat", lat);
    updateFilter("lng", lng);
  };

  return (
    <MapContainer
      center={selectedPosition || [0, 0]}
      zoom={18}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onClick={handleMapClick} />

      {selectedPosition && (
        <>
          <Marker position={selectedPosition} />
          <Circle
            center={selectedPosition}
            pathOptions={fillBlueOptions}
            radius={searchBuffer}
          />
          <FlyToLocation position={selectedPosition} />
        </>
      )}

      {selectedPosition &&
        stores?.map((store) => {
          const coords = extractLatLong(store.gpslocation);
          const userCoords = {
            latitude: filters.lat ?? 0,
            longitude: filters.lng ?? 0,
          };

          const hasCoords =
            coords.latitude && coords.longitude && filters.lat && filters.lng;

          const distance = hasCoords
            ? haversineDistance(coords, userCoords, countryCode)
            : null;

          return (
            <Marker
              key={store.id}
              position={[coords.latitude, coords.longitude]}
              icon={storeIcon(
                store?.logoPath
                  ? API_URL + store?.logoPath
                  : storeMarkerIcon.src
              )}
            >
              <Popup className="p-0" offset={[0, -5]}>
                <StoreItem store={store} />
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                <div className="flex gap-2">
                  <p>{store.name}</p>
                  {distance !== null && (
                    <>
                      <span>•</span>
                      <div className="flex gap-2 items-center">
                        <LandPlot size={14} />
                        <span>
                          {distance.toFixed(2)} {distanceUnit}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
    </MapContainer>
  );
};

export default HomeMap;
