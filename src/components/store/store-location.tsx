// src/components/store/StoreInfo/components/StoreLocation.tsx
import { MapPinIcon } from "lucide-react";

interface StoreLocationProps {
  address: string;
  surfaceAddress?: string;
  gpsLocation?: string;
  expanded?: boolean;
}

export const StoreLocation = ({
  address,
  surfaceAddress,
  gpsLocation,
  expanded = false,
}: StoreLocationProps) => {
  const mapCoords = gpsLocation?.split(",").reverse().join(",");
  // console.log(mapCoords);
  return (
    <div className="space-y-4">
      {gpsLocation && (
        <h2 className={`${expanded ? "text-xl" : "text-lg"} font-semibold`}>
          Location
        </h2>
      )}
      <div className="flex items-center gap-2">
        <MapPinIcon size={18} className="flex-shrink-0 text-muted-foreground" />
        <div>
          <p>{address}</p>
          {surfaceAddress && (
            <p className="text-muted-foreground">{surfaceAddress}</p>
          )}
        </div>
      </div>
      {mapCoords && (
        <div
          className={`${
            expanded ? "h-64" : "h-40"
          } w-full rounded-lg overflow-hidden`}
        >
          <iframe
            src={`https://maps.google.com/maps?q=${mapCoords}&z=15&output=embed`}
            width="100%"
            height="100%"
            className="border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};
