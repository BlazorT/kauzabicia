import React from "react";
import { DealItemProps } from "./deal-item";
import { useDealCount } from "@/hooks/useDealCount";
import { normalizeWeekDays } from "@/utils/menuUtils";

const DealTime: React.FC<DealItemProps> = ({ dealItem }) => {
  const { timeRemaining } = useDealCount(
    normalizeWeekDays(dealItem.dealTarget),
    dealItem.startTime,
    dealItem.endTime
  );
  return <p className="text-base font-bold">{timeRemaining}</p>;
};
export default DealTime;
