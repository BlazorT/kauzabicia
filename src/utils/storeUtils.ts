// src/components/store/StoreInfo/utils/storeUtils.ts
import { countryUnits } from "@/constants/constants";
import moment from "moment";
import { CalculateRateOptions, Coordinates } from "./types";

export const processWorkHours = (workHoursJson?: string) => {
  if (!workHoursJson?.trim()) {
    return [
      {
        id: 0,
        WorkStartTime: "00:00:00",
        WorkEndTime: "23:59:59",
        days: [1, 2, 3, 4, 5, 6, 7],
      },
    ];
  }

  try {
    const parsed = JSON.parse(workHoursJson) as Array<{
      id: number;
      WorkStartTime: string;
      WorkEndTime: string;
      Days?: string;
    }>;

    return parsed.map((item) => ({
      ...item,
      days: item.Days
        ? (JSON.parse(item.Days) as number[])
        : [1, 2, 3, 4, 5, 6, 7],
    }));
  } catch (error) {
    console.error("Error parsing work hours", error);
    return [];
  }
};

export const getStatusText = (hours?: {
  WorkStartTime: string;
  WorkEndTime: string;
}) => {
  if (!hours) return "Closed";

  const now = new Date();
  const [sh, sm] = hours.WorkStartTime.split(":").map(Number);
  const [eh, em] = hours.WorkEndTime.split(":").map(Number);

  const startDate = new Date(now);
  startDate.setHours(sh, sm, 0, 0);

  const endDate = new Date(now);
  endDate.setHours(eh, em, 0, 0);

  if (now < startDate) {
    return `Closed, opens at ${moment(startDate).format("hh:mm A")}`;
  } else if (now > endDate) {
    return "Closed";
  }
  return `Open until ${moment(endDate).format("hh:mm A")}`;
};

export const groupWeeklyHours = (
  hoursList: {
    id: number;
    WorkStartTime: string;
    WorkEndTime: string;
    days: number[];
  }[]
) => {
  return hoursList.flatMap((h) => {
    const sortedDays = [...h.days].sort((a, b) => a - b);
    const groups: number[][] = [];
    let currentGroup: number[] = [];

    sortedDays.forEach((day) => {
      if (
        currentGroup.length === 0 ||
        day === currentGroup[currentGroup.length - 1] + 1
      ) {
        currentGroup.push(day);
      } else {
        groups.push(currentGroup);
        currentGroup = [day];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups.map((group) => ({
      key: `${h.id}-${group.join("-")}`,
      label:
        group.length > 1
          ? `${DAY_NAMES[group[0] - 1]} - ${
              DAY_NAMES[group[group.length - 1] - 1]
            }`
          : DAY_NAMES[group[0] - 1],
      start: h.WorkStartTime,
      end: h.WorkEndTime,
    }));
  });
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function getDeliveryCoverageBuffer(
  bufferInMeters: number,
  countryCode: string,
  defaultBuffer: number = 0.5
): string {
  // Conversion factors
  const KM_CONVERSION = 1000;
  const MILES_CONVERSION = 1609.34;

  // Determine the unit based on the country code
  const isKilometers = getDistanceUnit(countryCode) === "km";
  // Calculate buffer
  return bufferInMeters > 0
    ? (
        bufferInMeters / (isKilometers ? KM_CONVERSION : MILES_CONVERSION)
      ).toFixed(2)
    : defaultBuffer.toString();
}

export function getCoverageBuffer(
  bufferInMeters: number,
  countryCode: string
): number {
  // Conversion factors
  const KM_CONVERSION = 1000;
  const MILES_CONVERSION = 1609.34;

  // Determine the unit based on the country code
  const isKilometers = getDistanceUnit(countryCode) === "km";
  // Calculate buffer
  return parseFloat(
    (
      bufferInMeters * (isKilometers ? KM_CONVERSION : MILES_CONVERSION)
    )?.toFixed(0)
  );
}
export const getDistanceUnit = (countryCode: string): string => {
  // Type assertion: Treat 'countryCode' as a key of 'countryUnits'
  if (countryCode in countryUnits) {
    return countryUnits[countryCode as keyof typeof countryUnits] === "imperial"
      ? "miles"
      : "km";
  }
  // Default to km if countryCode is not found
  return "km";
};

export const parseGpsLocation = (gpsLocation?: string): Coordinates | null => {
  try {
    if (!gpsLocation || typeof gpsLocation !== "string") {
      throw new Error("Invalid input: input must be a non-empty string");
    }

    const [longitude, latitude] = gpsLocation
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error(
        "Invalid coordinates: could not parse latitude or longitude"
      );
    }
    return { latitude, longitude };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.log(error instanceof Error ? error.message : "Unknown error");
    // console.log({ gpsLocation });
    return { latitude: 0, longitude: 0 };
  }
};

export const parseLatandLong = (json: string) => {
  try {
    // Attempt to parse the JSON string
    if (!json?.includes("latitude")) {
      return { latitude: 0, longitude: 0 };
    }
    const { latitude, longitude } = JSON.parse(json || "{}");
    return { latitude, longitude };
  } catch {
    // Return a fallback object with default values
    return { latitude: 0, longitude: 0 };
  }
};

export const isDistanceBufferValid = (
  distance: number,
  buffer: number,
  isDeliveryForced: boolean
) => {
  if (distance > buffer && isDeliveryForced) {
    return false;
  }
  return true;
};

export const getDistanceBuffer = (
  bufferInMeters: number = 0,
  countryCode: string = "PK"
): number => {
  const isKm = getDistanceUnit(countryCode) === "km";
  const buffer = isKm ? bufferInMeters / 1000 : bufferInMeters / 1609.34;
  return Number(buffer.toFixed(2));
};

export const calculateRateBasedOnDistance = ({
  distanceInMeters,
  ratePerUnit,
  minimumCharge,
  freeDeliveryRadiusInMeters,
  countryCode,
}: CalculateRateOptions): number => {
  const unit = getDistanceUnit(countryCode);

  const distance =
    unit === "km" ? distanceInMeters / 1000 : distanceInMeters / 1609.34;

  if (distanceInMeters <= freeDeliveryRadiusInMeters) return 0;

  const charge = Math.max(distance * ratePerUnit, minimumCharge);

  return parseFloat(charge.toFixed(2));
};

export const haversineDistance = (
  coords1: { latitude: number; longitude: number },
  coords2: { latitude: number; longitude: number },
  countryCode: string
): number => {
  //
  const toRad = (angle: number): number => (angle * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLong = toRad(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.latitude)) *
      Math.cos(toRad(coords2.latitude)) *
      Math.sin(dLong / 2) *
      Math.sin(dLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c; // Distance in km

  // Determine the correct unit based on the country code
  const unit = getDistanceUnit(countryCode);
  //
  // Convert km to miles if the country uses miles
  //
  return unit === "miles" ? distanceKm * 0.621371 : distanceKm; // Convert to miles if needed
};

export const extractLatLong = (str: string) => {
  try {
    if (!str || typeof str !== "string") {
      throw new Error("Invalid input: input must be a non-empty string");
    }

    const [longitude, latitude] = str
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error(
        "Invalid coordinates: could not parse latitude or longitude"
      );
    }

    return { latitude, longitude };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error extracting latitude and longitude:", error.message);
    return { latitude: 0, longitude: 0 };
  }
};
