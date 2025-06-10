import { useLocation } from "@/context/location-context";
import { useLOV } from "@/context/lov-context";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useGetAddress, useGetAddressList } from "@/hooks/useMap";
import { useStoreFiltersQuery } from "@/hooks/useStoreFiltersQuery";
import { getCoverageBuffer, getDistanceUnit } from "@/utils/storeUtils";
import { ADDRESS_RESPONSE } from "@/utils/types";
import { Loader2, LocateFixed, MapPin, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import HomeMap from "../map/home-map";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDebounce } from "@/hooks/useDebounce";

type HomeMapFiltersProps = {
  isVisible: boolean;
  toggleVisible: () => void;
};

const HomeMapFilters: React.FC<HomeMapFiltersProps> = ({
  isVisible,
  toggleVisible,
}) => {
  const { isPending, filteredStores } = useStoreFiltersQuery("");
  const { lovs } = useLOV();
  const { updateFilter, filters } = useRestaurantFilters();
  const [searchAddress, setSearchAddress] = useState("");
  const [shownAddress, setShownAddress] = useState("");
  const { selectedPosition, setSelectedPosition, requestUserLocation, ipInfo } =
    useLocation();

  const findCountry = useMemo(
    () => lovs?.countries?.find((c) => c.id === filters?.country?.id),
    [lovs?.countries, filters?.country]
  );

  const { data: addressData } = useGetAddress(
    selectedPosition?.[0] || 0,
    selectedPosition?.[1] || 0
  ) as { data: ADDRESS_RESPONSE | undefined };

  const { data: addressList, isFetching } = useGetAddressList(
    searchAddress,
    findCountry?.code?.toUpperCase() ||
      ipInfo?.geoplugin_countryCode?.toUpperCase() ||
      "PK"
  );

  const distanceUnit = useMemo(
    () =>
      getDistanceUnit(
        filters?.country?.code ?? ipInfo?.geoplugin_continentCode ?? "PK"
      )?.toUpperCase(),
    [ipInfo, filters?.country]
  );
  const [inputValue, setInputValue] = useState<string>("");
  const debouncedValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (!isVisible) return;
    setInputValue((filters?.searchRange ?? 0).toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    const numericValue = parseFloat(debouncedValue);
    if (
      !isNaN(numericValue) &&
      debouncedValue.length <= 4 &&
      numericValue <= 2000
    ) {
      updateFilter("searchRange", numericValue);
    }
    if (debouncedValue === "") {
      updateFilter("searchRange", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  useEffect(() => {
    if (Array.isArray(addressList) && addressList.length === 1) {
      onAddressClick(addressList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressList]);

  useEffect(() => {
    if (addressData?.display_name) {
      setSearchAddress("");
      const addressParts = addressData?.display_name?.split(",");
      // Assuming the main address includes the first three parts (like society, area, and city)
      const mainAddress = addressParts.slice(0, 2).join(", ").trim();

      setShownAddress(mainAddress);
    }
  }, [addressData]);

  // useEffect(() => {
  //   console.log({ addressData });
  //   console.log(
  //     addressData?.address?.country_code?.toLowerCase(),
  //     filters?.country?.code?.toLowerCase()
  //   );
  //   if (addressData?.address?.country_code && searchAddress?.length !== 2) {
  //     if (
  //       addressData?.address?.country_code?.toLowerCase() ===
  //       filters?.country?.code?.toLowerCase()
  //     )
  //       return;
  //     const findUpdatedCountry = lovs?.countries?.find(
  //       (c) =>
  //         c.code?.toLowerCase() ===
  //         addressData?.address?.country_code?.toLowerCase()
  //     );
  //     if (findUpdatedCountry) {
  //       updateFilter("country", findUpdatedCountry);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [addressData, filters?.country?.code, lovs?.countries, searchAddress]);

  // const onFindRestaurants = () => {
  //   if (findCountry) {
  //     updateFilter("country", {
  //       name: findCountry.name,
  //       code: findCountry.code,
  //       flag: findCountry.desc,
  //       id: findCountry.id,
  //     });
  //   }
  //   if (selectedPosition) {
  //     updateFilter("lat", selectedPosition[0]);
  //     updateFilter("lng", selectedPosition[1]);
  //   }

  //   updateFilter("searchRange", searchBuffer);
  //   toggleVisible();
  // };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onAddressClick = (addr: any) => {
    const lat = parseFloat(addr.lat);
    const lng = parseFloat(addr.lon);
    setSelectedPosition([lat, lng]);
    updateFilter("lat", lat);
    updateFilter("lng", lng);
    setShownAddress(addr.display_name);
    setSearchAddress("");
  };

  const clearSearch = () => {
    setSearchAddress("");
    setShownAddress("");
  };
  return (
    <Dialog open={isVisible} onOpenChange={toggleVisible}>
      <DialogContent
        id="address-dialog"
        aria-describedby="delivery-address-dialog"
        className="max-w-[95%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%] max-h-[90vh] overflow-y-auto gap-2"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <MapPin className="text-primary" />
              <p>Find Restaurant</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Providing your location enables more accurate search and delivery
              ETA, seamless order tracking, and personalised recommendations.
            </p>
          </DialogTitle>
        </DialogHeader>

        {/* Section: Country and Range Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={filters?.country?.id?.toString()}
              onValueChange={(e) => {
                const findCountry = lovs?.countries?.find(
                  (c) => c.id === parseInt(e)
                );
                if (!findCountry) return;
                updateFilter("country", {
                  name: findCountry.name,
                  code: findCountry.code,
                  flag: findCountry.desc,
                  id: findCountry.id,
                });
                setSearchAddress(findCountry?.code?.toUpperCase());
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {lovs?.countries?.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c?.id?.toString()}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={`data:image/png;base64,${c.desc}`}
                      alt={c.name}
                      width={24}
                      height={16}
                      className="rounded object-cover"
                      unoptimized
                    />
                    <span>{c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchBuffer">Search Range ({distanceUnit})</Label>
            <Input
              id="searchBuffer"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                // Optional: restrict to numbers and max 4 characters
                if (value.length <= 4) {
                  setInputValue(value);
                }
              }}
              placeholder={`Range (${distanceUnit})`}
              type="number"
              step="0.1"
            />
          </div>
        </div>

        {/* Section: Address Search + Use Location */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div className="relative space-y-2">
            <Label htmlFor="shownAddress">Address</Label>
            <Input
              id="shownAddress"
              value={shownAddress}
              onChange={(e) => {
                setSearchAddress(e.target.value);
                setShownAddress(e.target.value);
              }}
              placeholder="Search for your address"
              className="pe-10"
            />
            {isFetching && (
              <Loader2
                className="absolute right-3 top-8.5 animate-spin"
                size={16}
              />
            )}
            {shownAddress && !isFetching && (
              <X
                className="absolute right-3 top-8.5 cursor-pointer"
                size={16}
                onClick={clearSearch}
              />
            )}
            {Array.isArray(addressList) && addressList.length > 1 && (
              <ul className="mt-1 max-h-[200px] overflow-y-auto absolute w-full bg-card z-[99999] rounded-md shadow-md border hide-scrollbar">
                {addressList.map((addr, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      onAddressClick(addr);
                    }}
                    className="cursor-pointer p-2 hover:bg-primary/10 border-b text-sm"
                  >
                    {addr.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex mt-0 md:mt-6">
            <Button
              disabled={isPending || isFetching}
              onClick={() => {
                const findIpCountry = lovs?.countries?.find(
                  (c) =>
                    c.code?.toLowerCase() ===
                    ipInfo?.geoplugin_countryCode?.toLowerCase()
                );
                if (findIpCountry) {
                  updateFilter("country", findIpCountry);
                }
                requestUserLocation();
              }}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              <LocateFixed />
              Use My Location
            </Button>
          </div>
        </div>

        {/* Section: Map */}
        <p>{filteredStores?.length} Restaurants Found</p>
        <div className="relative rounded-md overflow-hidden border">
          <HomeMap
            searchBuffer={getCoverageBuffer(
              filters.searchRange ?? 0,
              ipInfo?.geoplugin_countryCode ?? ""
            )}
            stores={filteredStores}
          />

          {isPending && (
            <div className="absolute inset-0 bg-black/30 flex justify-center items-center z-[99999]">
              <Loader2 className="animate-spin w-16 h-16 text-white" />
            </div>
          )}
        </div>

        {/* Section: Submit */}
        <div className="flex justify-end gap-2">
          <Button
            disabled={isPending || isFetching}
            onClick={toggleVisible}
            // variant={"outline"}
          >
            Close
          </Button>
          {/* <Button disabled={isFetching} onClick={onFindRestaurants}>
            Find Restaurants
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeMapFilters;
