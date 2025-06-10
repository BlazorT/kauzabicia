import { useState, useEffect, useCallback } from "react";
import moment, { Moment } from "moment";

type UseIsDealActiveParams = {
  dealTarget: number[]; // ISO weekday numbers (1-7)
  startTime: string | Date | Moment;
  endTime: string | Date | Moment;
  condition?: boolean;
};

export const useIsDealActive = ({
  dealTarget,
  startTime,
  endTime,
  condition = true,
}: UseIsDealActiveParams) => {
  const [isActive, setIsActive] = useState(false);

  const checkDealStatus = useCallback(() => {
    if (!startTime || !endTime || !dealTarget?.length) {
      setIsActive(false);
      return;
    }

    const now = moment();
    const currentDay = now.isoWeekday();
    const sTime = moment(startTime).local();
    const eTime = moment(endTime).local();

    const isDateValid = now.isBetween(
      sTime.startOf("day"),
      eTime.endOf("day"),
      null,
      "[]"
    );

    if (isDateValid && dealTarget.includes(currentDay)) {
      const nowTime = now.format("HH:mm:ss");
      const sT = sTime.format("HH:mm:ss");
      const eT = eTime.format("HH:mm:ss");

      const isInTime = moment(eT, "HH:mm:ss").isAfter(moment(sT, "HH:mm:ss"))
        ? moment(nowTime, "HH:mm:ss").isBetween(
            moment(sT, "HH:mm:ss"),
            moment(eT, "HH:mm:ss"),
            null,
            "[]"
          )
        : moment(nowTime, "HH:mm:ss").isAfter(moment(sT, "HH:mm:ss")) ||
          moment(nowTime, "HH:mm:ss").isBefore(moment(eT, "HH:mm:ss"));

      setIsActive(isInTime);
    } else {
      setIsActive(false);
    }
  }, [dealTarget, startTime, endTime]);

  useEffect(() => {
    if (!condition) return;

    const interval = setInterval(checkDealStatus, 1000);
    return () => clearInterval(interval);
  }, [checkDealStatus, condition]);

  return isActive;
};
