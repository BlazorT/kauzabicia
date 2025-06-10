import { useEffect, useState } from "react";
import { useLocation } from "@/context/location-context";
import { useOrder } from "@/context/order-context";
import { useGetAddress, useGetAddressList } from "@/hooks/useMap";
import { ADDRESS_RESPONSE } from "@/utils/types";
import { MapPin, X, Loader2 } from "lucide-react";
import MapSelector from "../map/map-selector";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import { useLOV } from "@/context/lov-context";

export default function DeliveryAddress() {
  const { orderInfo, setOrderInfo } = useOrder();
  const { updateFilter } = useRestaurantFilters();
  const { lovs } = useLOV();
  const { selectedPosition, setSelectedPosition, requestUserLocation, ipInfo } =
    useLocation();

  const [showChangeAddress, setShowChangeAddress] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [shownAddress, setShownAddress] = useState("");

  const { data: addressData } = useGetAddress(
    selectedPosition?.[0] || 0,
    selectedPosition?.[1] || 0
  ) as { data: ADDRESS_RESPONSE | undefined };

  const { data: addressList, isFetching } = useGetAddressList(
    searchAddress,
    ipInfo?.geoplugin_countryCode || "PK"
  );

  useEffect(() => {
    if (addressData?.display_name) {
      setSearchAddress("");
      setShownAddress(addressData.display_name);
      setOrderInfo((prev) => ({ ...prev, address: addressData.display_name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressData]);

  useEffect(() => {
    if (Array.isArray(addressList) && addressList.length > 0) {
      const firstMatch = addressList[0].display_name;
      if (firstMatch) {
        setOrderInfo((prev) => ({ ...prev, address: firstMatch }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressList]);

  if (orderInfo?.orderType !== 3) return null;

  const toggleShowAddress = () => setShowChangeAddress((prev) => !prev);
  const clearSearch = () => {
    setSearchAddress("");
    setShownAddress("");
  };

  return (
    <Card className="px-2 py-2 w-full">
      <CardContent className="px-0 relative">
        <Button
          variant="link"
          className="absolute right-2 top-2 p-0 h-0"
          onClick={toggleShowAddress}
        >
          Change
        </Button>

        <div className="flex items-start gap-2">
          <MapPin className="flex-shrink-0" />
          <div className="">
            <Label>Delivery Address</Label>
            <p>{orderInfo.address}</p>
          </div>
        </div>

        <Dialog open={showChangeAddress} onOpenChange={toggleShowAddress} modal>
          <DialogContent
            aria-describedby="delivery-address-dialog"
            hideCloseButton
            className="max-w-[95%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[50%] max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="gap-2 items-start flex flex-col">
                <div className="flex gap-1 items-start">
                  <MapPin />
                  <p>Change Delivery Address</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Providing your location enables more accurate search and
                  delivery ETA, seamless order tracking, and personalised
                  recommendations.
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 relative">
              <div className="relative w-full">
                <Input
                  value={shownAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    setShownAddress(e.target.value);
                  }}
                  placeholder="Search for your address"
                  className="pe-[50px] text-ellipsis"
                />
                {isFetching && (
                  <Loader2
                    className="absolute right-3 top-3 animate-spin"
                    size={16}
                  />
                )}
                {shownAddress && !isFetching && (
                  <X
                    className="absolute right-3 top-3 cursor-pointer"
                    size={16}
                    onClick={clearSearch}
                  />
                )}
                {Array.isArray(addressList) && addressList.length > 0 && (
                  <ul className="mt-2 max-h-[200px] overflow-y-auto absolute w-full bg-card z-[99999] rounded-md hide-scrollbar">
                    {addressList.map((addr, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          const lat = parseFloat(addr.lat);
                          const lng = parseFloat(addr.lon);
                          setSelectedPosition([lat, lng]);
                          setShownAddress(addr.display_name);
                          setSearchAddress("");
                          setOrderInfo((prev) => ({
                            ...prev,
                            address: addr.display_name,
                          }));
                        }}
                        className="cursor-pointer p-2 hover:bg-primary/10 border-b"
                      >
                        {addr.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
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
              >
                <MapPin />
                <span>Use Current Location</span>
              </Button>
            </div>

            <MapSelector />
            <Button onClick={toggleShowAddress}>Done</Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
