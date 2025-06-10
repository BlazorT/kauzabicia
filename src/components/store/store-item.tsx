import { useLOV } from "@/context/lov-context";
import { useAddToFavorite } from "@/hooks/useMenu";
import { API_URL } from "@/services/apiClient";
import { StoreDetail } from "@/utils/types";
import { Banknote, Heart, LandPlot, Loader2, Store } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { StoreRating } from "./store-rating";
import { useRestaurantFilters } from "@/context/restaurant-filter-context";
import {
  extractLatLong,
  getDistanceUnit,
  haversineDistance,
} from "@/utils/storeUtils";
import { useLocation } from "@/context/location-context";
import { useCart } from "@/context/cart-context";
import { useAlert } from "@/context/alert-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import moment from "moment";

type StoreItemProps = {
  store: StoreDetail;
};

const StoreItem: React.FC<StoreItemProps> = ({ store }) => {
  const { mutate: addToFavorite, isPending } = useAddToFavorite();

  const { lovs } = useLOV();
  const { filters } = useRestaurantFilters();
  const { ipInfo } = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { showAlert, hideAlert } = useAlert();
  const { storeData } = useStoreInfo(items[0]?.storeId?.toString() ?? null);
  const { storeData: storeInfo } = useStoreInfo(store?.id?.toString());

  const router = useRouter();

  const [isLogoErr, setLogoErr] = useState(false);
  const [isDealPicErr, setDealPicErr] = useState(false);

  const [favStores, setFavStores] = useState<{
    [key: number]: { isFav: boolean };
  }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("favStores") || "{}");
      setFavStores(stored);
    }
  }, []);

  const onRestaurantClick = () => {
    if (items.length > 0 && store.id !== items[0]?.storeId) {
      showAlert({
        title: "Warning",
        description: `Already your order of amount <b>${totalPrice?.toFixed(
          2
        )}</b> is pending from <b>${
          storeData?.store?.name
        }</b>. You want to continue the previous order or create new order.`,
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
              router.push(`/${btoa(store.id?.toString())}`);
            },
          },
          {
            variant: "outline",
            title: "Continue",
            onClick: () => {
              hideAlert();
              router.push(`/${btoa(items[0]?.storeId?.toString())}`);
            },
          },
        ],
      });
      return;
    }
    if (!storeInfo?.isStoreOpen) {
      showAlert({
        title: "Store Closed",
        description: `The ${store?.name} is closed on ${moment().format(
          "DD-MM-YYYY, hh:mm A"
        )}`,
        confirmText: "OK",
      });
      return;
    }
    router.push(`/${btoa(store.id?.toString())}`);
  };

  const storeType = lovs?.storetypes?.find(
    (type) => type.id === store.storeTypeId
  )?.name;

  const onAddToFav = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window === "undefined") return;

    const stored = JSON.parse(localStorage.getItem("favStores") || "{}");

    // Call API and then add
    addToFavorite(
      {
        status: stored[store.id]?.isFav ? 2 : 1,
        storeId: store.id,
        productDetailId: 0,
      },
      {
        onSuccess: (res) => {
          if (res?.status === true) {
            const updated = {
              ...stored,
              [store.id]: { isFav: true },
            };
            if (stored[store.id]?.isFav) {
              // Remove from fav
              delete stored[store.id];
              localStorage.setItem("favStores", JSON.stringify(stored));
              setFavStores({ ...stored });
              toast.success(`${store?.name ?? ""} removed from favorites`);
            } else {
              setFavStores(updated);
              localStorage.setItem("favStores", JSON.stringify(updated));
              toast.success(
                `Thank you for adding ${store?.name ?? ""} to your favorites`
              );
            }
          }
        },
      }
    );
  };
  const getDistance = useMemo(() => {
    const hasRequiredData =
      store.gpslocation &&
      filters.lat &&
      filters.lng &&
      ipInfo?.geoplugin_countryCode;

    if (!hasRequiredData) return null;

    const storeCoords = extractLatLong(store.gpslocation);
    const userCoords = {
      latitude: filters.lat ?? 0,
      longitude: filters.lng ?? 0,
    };
    const countryCode =
      filters?.country?.code ?? ipInfo.geoplugin_countryCode ?? "";

    return haversineDistance(storeCoords, userCoords, countryCode);
  }, [
    filters.lat,
    filters.lng,
    store.gpslocation,
    filters?.country?.code,
    ipInfo?.geoplugin_countryCode,
  ]);

  const distanceUnit = useMemo(() => {
    const continentCode =
      filters?.country?.code ?? ipInfo?.geoplugin_countryCode ?? "PK";
    return getDistanceUnit(continentCode)?.toUpperCase();
  }, [ipInfo, filters?.country]);
  // console.log({ store });
  return (
    <Card
      className="group relative aspect-3/2 object-cover overflow-hidden rounded-2xl cursor-pointer shadow-md border-1"
      onClick={onRestaurantClick}
    >
      {/* Store image fills the card */}
      <Image
        src={isDealPicErr ? "/no-image.png" : API_URL + store.hotDealPic}
        alt="store"
        fill
        className="object-fill w-full h-full transition-transform duration-300 group-hover:scale-105"
        onError={() => setDealPicErr(true)}
      />

      {/* Heart Icon */}
      <div
        onClick={onAddToFav}
        className="absolute top-3 right-3 z-[21] bg-white rounded-full p-1 shadow-lg border border-gray-300 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        ) : (
          <Heart
            fill={
              favStores && favStores[store.id]?.isFav ? "red" : "transparent"
            }
            className={`w-4 h-4 ${
              favStores && favStores[store.id]?.isFav
                ? "text-red-400"
                : "text-black"
            }`}
          />
        )}
      </div>

      {/* Logo in corner */}
      <div className="absolute top-3 left-3 h-12 w-12 bg-white/70 rounded-full overflow-hidden shadow-lg border border-gray-200 backdrop-blur-sm">
        <Image
          src={isLogoErr ? "/no-image.png" : API_URL + store.logoPath}
          alt="logo"
          fill
          className="object-contain p-1.5"
          onError={() => setLogoErr(true)}
        />
      </div>

      {/* Bottom name and rating preview */}
      <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white z-10 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold truncate">{store.name}</p>
          <StoreRating rating={store.rating} store={store} />
        </div>
      </div>

      {/* Full detail view on hover */}
      <div className="group-hover:shadow-[0_0_0_2px_rgba(255,255,255,0.2)] absolute inset-0 flex items-center justify-center bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 px-4 text-center">
        <div className="space-y-1 items-center justify-center flex flex-col">
          <p className="text-lg font-bold">{store.name}</p>
          <div className="flex items-center gap-2 text-white text-sm font-normal flex-wrap">
            <StoreRating rating={store.rating} store={store} />
            {getDistance && (
              <>
                {store.rating > 0 && <span>•</span>}
                <LandPlot size={14} className="inline-block" />
                <span>
                  {getDistance.toFixed(2)} {distanceUnit}
                </span>
              </>
            )}
            {store.currencyCode && (
              <>
                <span>•</span>
                <Banknote size={14} className="inline-block" />
                <span>{store.currencyCode?.trim()}</span>
              </>
            )}
            {storeType && (
              <>
                <span>•</span>
                <Store size={14} className="inline-block" />
                <span className="max-w-24 whitespace-nowrap overflow-hidden text-ellipsis block">
                  {storeType}
                </span>
              </>
            )}
          </div>

          {store.address && (
            <p className="text-sm text-white max-w-[220px] mx-auto">
              {store.address.trim()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StoreItem;
