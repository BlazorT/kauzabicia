// src/components/store/StoreInfo/hooks/useStoreInfo.ts
import { useStore } from "@/hooks/useMenu";
import {
  processWorkHours,
  getStatusText,
  groupWeeklyHours,
} from "../utils/storeUtils";
import { useMemo } from "react";
import { StoreInfo } from "@/utils/types";

export const useStoreInfo = (storeId: string | null) => {
  const { data, isError, isPending } = useStore(
    storeId ? parseInt(storeId, 10) : null
  );
  const storeData = useMemo(() => {
    if (!Array.isArray(data?.data) || !data.data[0]) return null;
    // console.log({ data });
    const store = data.data[0] as StoreInfo;
    const hoursList = processWorkHours(store.workhoursjson);
    const todayNum = new Date().getDay() + 1;
    const todayHours = hoursList.find((h) => h.days.includes(todayNum));
    const statusText = getStatusText(todayHours);
    const weeklyGroups = groupWeeklyHours(hoursList);
    const isStoreOpen = !statusText.includes("Closed");

    return {
      store,
      statusText,
      todayHours,
      weeklyGroups,
      isAlwaysOpen: !store.workhoursjson?.trim(),
      isStoreOpen,
    };
  }, [data]);

  return {
    storeData,
    isLoading: isPending,
    isError,
    isEmpty: !Array.isArray(data?.data) || data.data.length === 0,
  };
};
