"use client";

import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useGetAddress } from "@/hooks/useMap";
import { DialogProps } from "@/utils/types";
import { MapPin } from "lucide-react";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import HomeMapFilters from "./home-map-filters";

const HeaderAddress: React.FC<DialogProps> = ({
  isMapVisible,
  toggleIsMapVisble,
}) => {
  const { filters, updateFilter } = useRestaurantFilters();
  const { data: addressData } = useGetAddress(filters?.lat, filters?.lng);

  useEffect(() => {
    if (addressData) {
      const addressParts = addressData?.display_name?.split(",");
      // Assuming the main address includes the first three parts (like society, area, and city)
      const mainAddress = addressParts.slice(0, 2).join(", ").trim();
      updateFilter("address", mainAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData]);

  return (
    <>
      <div
        className="flex gap-2 max-w-max cursor-pointer items-start justify-center"
        onClick={toggleIsMapVisble}
      >
        <MapPin className="shrink-0" />
        <Tooltip>
          <TooltipTrigger>
            <p className="truncate max-w-xs lg:max-w-full">{filters.address}</p>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            className="max-w-xs whitespace-normal"
          >
            {filters.address}
          </TooltipContent>
        </Tooltip>
      </div>
      <HomeMapFilters
        isVisible={isMapVisible}
        toggleVisible={toggleIsMapVisble}
      />
    </>
  );
};

export default HeaderAddress;
