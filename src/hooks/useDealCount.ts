import moment, { Moment } from "moment";
import { useEffect, useState } from "react";

type UseDealCountParams = {
  dealTarget: number[]; // ISO weekday numbers (1-7)
  startTime: string | Date | Moment;
  endTime: string | Date | Moment;
  condition?: boolean;
};

export const useDealCount = (
  dealTarget: UseDealCountParams["dealTarget"],
  startTime: UseDealCountParams["startTime"],
  endTime: UseDealCountParams["endTime"],
  condition: boolean = true
) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const calcTime = () => {
    if (!endTime || !startTime || !dealTarget) return;
    let string = "";
    const nowLocal = moment();
    const sTime = moment(startTime).local();
    const eTime = moment(endTime).local();
    const currentDay = nowLocal.day() === 0 ? 1 : nowLocal.day() + 1;
    const nowInDate = nowLocal.format("YYYY-MM-DD");

    if (
      isDateInRange(
        nowInDate,
        sTime.format("YYYY-MM-DD"),
        eTime.format("YYYY-MM-DD")
      ) &&
      dealTarget.includes(currentDay)
    ) {
      const nowIn = moment(nowLocal).format("HH:mm:ss");
      const sDTime = sTime.format("HH:mm:ss");
      const eDTime = eTime.format("HH:mm:ss");
      const isDealAvail = isTimeInRange(nowIn, sDTime, eDTime);

      if (isDealAvail) {
        string = `Deal will end in: ${getTimeRemainings(
          eTime.format("hh:mm:ss A")
        )}`;
      } else {
        string = `Deal will start in: ${getTimeRemainings(
          sTime.format("hh:mm:ss A")
        )}`;
      }
    } else {
      const nextAvailableDay =
        dealTarget.find((day) => day > currentDay) || dealTarget[0];
      const daysUntilNextDeal =
        nextAvailableDay > currentDay
          ? nextAvailableDay - currentDay
          : 7 - currentDay + nextAvailableDay;

      const nextAvailDate = moment()
        .startOf("day")
        .add(daysUntilNextDeal, "days")
        .set({
          hour: sTime.hours(),
          minute: sTime.minutes(),
          second: sTime.seconds(),
        });

      string = `Deal will start in: ${getTimeRemaining(nextAvailDate)}`;
    }

    setTimeRemaining(string);
  };

  const getTimeRemainings = (targetTime: string): string => {
    const now = moment();
    const target = moment(targetTime, "hh:mm:ss A");

    if (target.isBefore(now)) {
      target.add(1, "days");
    }

    const diffInMillis = target.diff(now);
    const duration = moment.duration(diffInMillis);

    const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
    const minutes = String(duration.minutes()).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const getTimeRemaining = (targetTime: Moment): string => {
    const now = moment();
    const diffInMillis = targetTime.diff(now);
    const duration = moment.duration(diffInMillis);

    const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
    const minutes = String(duration.minutes()).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  const isDateInRange = (
    nowIn: string,
    sDate: string,
    eDate: string
  ): boolean => {
    const now = moment(nowIn, "YYYY-MM-DD");
    const startDate = moment(sDate, "YYYY-MM-DD");
    const endDate = moment(eDate, "YYYY-MM-DD");

    return now.isBetween(startDate, endDate, null, "[]");
  };

  const isTimeInRange = (
    nowIn: string,
    sTime: string,
    eTime: string
  ): boolean => {
    const now = moment(nowIn, "HH:mm:ss");
    const startTime = moment(sTime, "HH:mm:ss");
    const endTime = moment(eTime, "HH:mm:ss");

    if (endTime.isAfter(startTime)) {
      return now.isBetween(startTime, endTime, null, "[]");
    } else {
      return now.isAfter(startTime) || now.isBefore(endTime);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!condition) {
      calcTime();
    } else {
      interval = setInterval(() => {
        calcTime();
      }, 1000);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, dealTarget, condition]);

  return { timeRemaining };
};
