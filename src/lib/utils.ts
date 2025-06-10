import { API_URL } from "@/services/apiClient";
import { clsx, type ClassValue } from "clsx";
import moment, { Moment } from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function getOrCreateSessionId(): string {
  const key = "session_id";
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = safeUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

function safeUUID(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === "function") {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);

      // Format UUID v4
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;

      return [...buf]
        .map((b, i) => {
          const hex = b.toString(16).padStart(2, "0");
          return [4, 6, 8, 10].includes(i) ? "-" + hex : hex;
        })
        .join("");
    }
  }

  // Fallback to non-crypto random UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const safeParseJSON = (str: string, fallback = []) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    console.warn("Failed to parse JSON:", str);
    return fallback;
  }
};

export const safeBase64JsonParse = (encoded: string | undefined | null) => {
  if (!encoded) return null;

  try {
    const decoded = atob(encoded);
    // console.log({ decoded });
    return typeof decoded === "string"
      ? decoded?.includes("xml")
        ? decoded
        : JSON.parse(decoded)
      : null;
  } catch (error) {
    console.error("Failed to decode or parse base64 JSON:", error);
    return null;
  }
};

export const formatAvatar = (avatar: string) => {
  if (avatar === null || avatar === "" || avatar === undefined) return null;
  let cleanedFilePath = "";
  if (avatar.includes("http")) {
    cleanedFilePath = avatar;
  } else {
    cleanedFilePath = API_URL + avatar;
  }
  return cleanedFilePath;
};

export const formatBookingTime = (date: string | Moment | Date | null) => {
  if (!date) return "";
  return moment(date).format("DD MMM YYYY, hh:mm A");
};

export const isBookingPassed = (date: string | Moment | Date | null) => {
  if (!date) return false;
  const now = moment();
  const bookingEndTime = moment(date);
  return now.isAfter(bookingEndTime);
};
