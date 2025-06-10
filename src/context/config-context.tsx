// src/context/config-context.tsx
"use client";
import { useGetConfig } from "@/hooks/useInitialData";
import { useParams } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useCart } from "./cart-context";
import { useLocation } from "./location-context";
import { useRestaurantFilters } from "./restaurant-filter-context";
import { getDeliveryCoverageBuffer } from "@/utils/storeUtils";

export interface ConfigState {
  accountActivateEmailBody?: string;
  accountBlockEmailBody?: string;
  accountStatusChangeSubject?: string;
  advanceOrdersAllowed?: boolean;
  archiveTime?: string;
  defaultContactEmailAddress?: string;
  deliveryCharges?: number;
  deliveryCoverageBufferInMeters?: number;
  displayRewardPoints?: boolean;
  enableAppNotification?: boolean;
  enableEmailNotification?: boolean;
  enableFreeMinutes?: boolean;
  enableOrderNotes?: boolean;
  enableSMS?: boolean;
  fcmSenderId?: string;
  fcmServerKey?: string;
  flagReportEmailBody?: string;
  forceOrderAfterPayment?: number;
  forceOrderWithinDeliveryCoverage?: number;
  freeDeliveryAreaInMeters?: number;
  freeTimeInSeconds?: string;
  id?: number;
  invitationEmailBody?: string;
  invitationEmailSubject?: string;
  isDeliveryAllowed?: boolean;
  isTipAllowed?: boolean;
  lastFetched?: number; // Timestamp of last fetch
  minDeliveryCharges?: number;
  minimumOrderLimit?: number;
  miscOtherCharges?: number;
  orderBeforeBufferInMinutes?: number;
  orderPlaceEmailbody?: string;
  orderPlaceNotificationEmailSubject?: string;
  orderReadyRequiredTimeInMin?: number;
  orderStatusChangeEmailBody?: string;
  orderStatusChangeEmailSubject?: string;
  profilePwdResetEmail?: string;
  paidTakeAwayOrdersOnly?: boolean;
  paidDineInOrdersOnly?: boolean;
  pointsOfferWeightPercent?: number;
  serviceCharges?: number;
  smsMessageTemplate?: string;
  smtpport?: string;
  smtppwd?: string;
  smtpserver?: string;
  smtpuser?: string;
  storeApiKey?: string;
  storeId?: number;
  storeName?: string;
  storeRegistrationEmailBody?: string;
  storeRegistrationSubject?: string;
  subscriptionPackageId?: number;
  storeStripeAccountId?: string;
  tax?: number;
  workingTimingHoursSetting?: string;
  tax_Number?: string;
  takeAwayAllowed?: boolean;
  dineInAllowed?: boolean;
  pointsOfferWeightPerc?: number;
  tipOfferOptions: string;
}

interface ConfigContextType {
  config: ConfigState | null;
  setConfig: (config: ConfigState) => void;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  setConfig: () => {},
});

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const params = useParams();
  const encodedStoreId = params.storeId; // Get the potentially encoded storeId
  let storeId: string | null = null;

  const { items } = useCart();
  const { ipInfo } = useLocation();
  const { updateFilter, filters } = useRestaurantFilters();

  if (typeof encodedStoreId === "string") {
    try {
      const base64Str = decodeURIComponent(encodedStoreId);
      const decodedId = atob(base64Str);
      // console.log({ decodedId });
      if (/^\d+$/.test(decodedId)) {
        storeId = decodedId;
      } else {
        console.warn("Decoded storeId is not numeric:", decodedId);
      }
    } catch (e) {
      console.warn("Failed to decode storeId:", e);
    }
  }

  const { data: configRes } = useGetConfig(
    storeId ? parseInt(storeId, 10) : items?.[0]?.storeId ?? undefined
  );

  const [config, setConfig] = useState<ConfigState | null>(() => {
    if (typeof window !== "undefined") {
      const storedConfig = localStorage.getItem("config");
      return storedConfig ? JSON.parse(storedConfig) : null;
    }
    return null;
  });

  useEffect(() => {
    if (!configRes) return;
    if (configRes && configRes.status === true) {
      setConfig(configRes.data as ConfigState);
    }
  }, [configRes]);

  useEffect(() => {
    if (config) {
      localStorage.setItem("config", JSON.stringify(config));
    }
  }, [config]);

  useEffect(() => {
    // console.log(filters.searchRange);
    if (
      config?.deliveryCoverageBufferInMeters &&
      ipInfo?.geoplugin_countryCode &&
      !filters.searchRange
    ) {
      updateFilter(
        "searchRange",
        parseFloat(
          getDeliveryCoverageBuffer(
            config?.deliveryCoverageBufferInMeters,
            ipInfo?.geoplugin_countryCode
          )
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config?.deliveryCoverageBufferInMeters,
    ipInfo?.geoplugin_countryCode,
    filters.searchRange,
  ]);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
