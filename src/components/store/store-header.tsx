/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/store/StoreInfo/components/StoreHeader.tsx
import { Button } from "@/components/ui/button";
import { useAddToFavorite } from "@/hooks/useMenu";
import { cn } from "@/lib/utils";
import { API_URL } from "@/services/apiClient";
import { StoreInfo } from "@/utils/types";
import { ChevronDown, ChevronUp, Heart, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  ComponentPropsWithoutRef,
  ElementType,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { SearchBar } from "../menu/search-bar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ModeToggle } from "../ui/theme-menu";
import ExportMenu from "./export-menu";
import StoreConfig from "./store-config";
import { StoreHours } from "./store-hours";
import { StoreLocation } from "./store-location";
import { StoreRating } from "./store-rating";
import { useLOV } from "@/context/lov-context";
import HeaderProfile from "../home/heder-profile";
import { useAuth } from "@/context/auth-context";
import { USER_ROLE } from "@/constants/constants";

interface StoreHeaderProps {
  name: string;
  tradeName?: string;
  logoPath?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  as?: ElementType;
  showOnlyName?: boolean;
  toggleDetails?: () => void;
  showDetails?: boolean;
  store?: StoreInfo;
  storeData?: any;
  handleSearch?: (q: string) => void;
}

export const StoreHeader = ({
  name,
  logoPath,
  size = "md",
  className,
  as: Component = "div",
  showOnlyName = false,
  toggleDetails,
  showDetails,
  storeData,
  handleSearch,
}: StoreHeaderProps & ComponentPropsWithoutRef<"div">) => {
  const { mutate: addToFavorite, isPending } = useAddToFavorite();
  const {
    store,
    statusText,
    todayHours,
    weeklyGroups,
    isAlwaysOpen,
    isStoreOpen,
  } = storeData ?? {
    store: {} as StoreInfo,
    statusText: "",
    todayHours: "",
    weeklyGroups: "",
    isAlwaysOpen: false,
    isStoreOpen: false,
  };
  const { lovs } = useLOV();
  const { user } = useAuth();

  const [favStores, setFavStores] = useState<{
    [key: number]: { isFav: boolean };
  }>({});

  const [imgError, setImgError] = useState(false);

  // Size configurations

  // console.log({ storeData });
  const sizes = {
    sm: {
      logo: 60,
      name: "text-xl",
      gap: "gap-3",
    },
    md: {
      logo: 100,
      name: "text-2xl",
      gap: "gap-7",
    },
    lg: {
      logo: 120,
      name: "text-3xl",
      gap: "gap-5",
    },
  };

  const currentSize = sizes[size];
  // const favStores = useMemo(() => {
  //   if (typeof window !== "undefined") {
  //     return JSON.parse(localStorage.getItem("favStores") || "{}");
  //   }
  //   return {};
  // }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("favStores") || "{}");
      setFavStores(stored);
    }
  }, []);

  if (showOnlyName) {
    return (
      <Component
        className={cn("font-bold tracking-tight", currentSize.name, className)}
      >
        {name}
      </Component>
    );
  }

  const onAddToFav = () => {
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

  const currencyCode = (
    <span
      dangerouslySetInnerHTML={{
        __html:
          lovs?.currencies?.find((c) => c.id === storeData?.store?.currencyId)
            ?.code ?? store.currencyCode,
      }}
    />
  );

  return (
    <Component
      className={cn(
        "flex flex-col sm:flex-row sm:items-center w-full justify-between gap-4 sm:gap-6", // 👈 important changes here
        className
      )}
    >
      {/* Logo */}
      <div className="flex-shrink-0 overflow-hidden flex items-center justify-center">
        {logoPath ? (
          <Image
            src={imgError ? "/no-image.png" : `${API_URL}${logoPath}`}
            alt={`${name} logo`}
            width={currentSize.logo}
            height={currentSize.logo}
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-xs">No Logo</span>
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <p className={cn("font-bold tracking-tight", currentSize.name)}>
            {store.name} - {currencyCode ?? ""} {isStoreOpen ? "" : " - Closed"}
          </p>

          {/* Theme Toggle */}
          <ModeToggle />
          {handleSearch && (
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search menu..."
              className="sm:w-80"
            />
          )}
          <Button
            variant={"outline"}
            onClick={onAddToFav}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Heart
                  fill={
                    favStores && favStores[store.id]?.isFav
                      ? "red"
                      : "transparent"
                  }
                  className={`${
                    favStores && favStores[store.id]?.isFav
                      ? "text-red-400"
                      : ""
                  }`}
                />
                {favStores && favStores[store.id]?.isFav
                  ? "Remove from favorite"
                  : "Add to favorite"}
              </>
            )}
          </Button>
          <ExportMenu />
          {user && user?.roleId !== USER_ROLE.USER && <HeaderProfile />}
        </div>

        {showDetails && (
          <div className="space-y-4">
            <StoreConfig store={store} detailedConfig={false} />

            <div className="flex flex-wrap gap-3 items-center">
              <StoreRating rating={store.rating} store={store} showReviews />

              <Dialog>
                <DialogTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary w-fit">
                  <Info size={16} />
                  <span>More Info</span>
                </DialogTrigger>

                <DialogContent
                  className="w-full max-w-[95%] sm:max-w-[80%] md:max-w-[60%] lg:max-w-[40%] max-h-[90vh] overflow-y-auto p-4"
                  aria-describedby="store-info"
                >
                  <DialogTitle>
                    <StoreHeader
                      name={store.name}
                      tradeName={store.tradeName}
                      logoPath={store.logoPath}
                      size="lg"
                      showOnlyName
                    />
                  </DialogTitle>

                  <div className="space-y-6">
                    <StoreHours
                      isAlwaysOpen={isAlwaysOpen}
                      statusText={statusText}
                      todayHours={todayHours}
                      weeklyGroups={weeklyGroups}
                    />
                    <StoreLocation
                      address={store.address}
                      surfaceAddress={store.surfaceAddress ?? undefined}
                      gpsLocation={store.gpslocation}
                      expanded
                    />
                    <StoreConfig store={store} detailedConfig={true} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Details */}
      <div
        onClick={toggleDetails}
        className="flex items-center gap-2 cursor-pointer mt-2 sm:mt-0"
      >
        <span className="text-muted-foreground">
          {showDetails ? "Hide details" : "Show details"}
        </span>
        {showDetails ? <ChevronUp /> : <ChevronDown />}
      </div>
    </Component>
  );
};
