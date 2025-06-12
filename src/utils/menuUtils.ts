// src/app/[storeId]/utils/menuUtils.ts
import { CartItem } from "@/context/cart-context";
import { API_URL } from "@/services/apiClient";
import {
  MenuItem as MenuItemType,
  MenuCategory,
  MenuItem,
} from "@/utils/types";
import moment from "moment";

export const organizeMenuByCategory = (
  menuItems: MenuItemType[]
): MenuCategory[] => {
  if (!Array.isArray(menuItems)) return [];

  // Group items by category
  const categoriesMap: Record<
    number,
    { id: number; name: string; items: MenuItemType[] }
  > = {};

  menuItems.forEach((item) => {
    if (!categoriesMap[item.categoryid]) {
      categoriesMap[item.categoryid] = {
        id: item.categoryid,
        name: item.productcategory,
        items: [],
      };
    }
    categoriesMap[item.categoryid].items.push(item);
  });

  // Process each category to group variations
  return Object.values(categoriesMap)
    .map((category) => {
      const productMap: Record<
        number,
        {
          product: MenuItemType;
          minPrice: number;
          count: number;
          variations: MenuItemType[];
        }
      > = {};

      category.items.forEach((item) => {
        const effectivePrice =
          item.linediscount > 0
            ? item.unitprice - item.linediscount
            : item.unitprice;

        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            product: item,
            minPrice: effectivePrice,
            count: 1,
            variations: [item],
          };
        } else {
          productMap[item.productId].minPrice = Math.min(
            productMap[item.productId].minPrice,
            effectivePrice
          );
          productMap[item.productId].count += 1;
          productMap[item.productId].variations.push(item);
        }
      });

      return {
        id: category.id,
        name: category.name,
        items: Object.values(productMap).map(
          ({ product, count, variations }) => ({
            ...product,
            variationCount: count,
            variations:
              count > 1
                ? variations.sort((a, b) => a.unitprice - b.unitprice)
                : [],
          })
        ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const organizeMenuByCategoryFlat = (
  menuItems: MenuItemType[]
): MenuCategory[] => {
  if (!Array.isArray(menuItems)) return [];

  // Group items by category
  const categoriesMap: Record<
    number,
    { id: number; name: string; items: MenuItemType[] }
  > = {};

  menuItems.forEach((item) => {
    if (!categoriesMap[item.categoryid]) {
      categoriesMap[item.categoryid] = {
        id: item.categoryid,
        name: item.productcategory,
        items: [],
      };
    }
    // Directly push the item without any variation processing
    categoriesMap[item.categoryid].items.push(item);
  });

  // Convert the map to an array and sort categories by name
  return Object.values(categoriesMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

export const getItemDiscount = (product: MenuItemType) => {
  let discountedPrice = 0;

  if (product?.offerPerc > 0 && product?.offerQty > -1) {
    if (product?.offerQty > -1) {
      discountedPrice = (product?.unitprice * product?.offerPerc) / 100;
    }
  } else {
    discountedPrice = product.linediscount;
  }

  return discountedPrice;
};

export const getItemPrice = (product: MenuItemType) => {
  let discountedPrice = 0;

  if (product?.offerPerc > 0 && product?.offerQty > -1) {
    if (product?.offerQty > -1) {
      discountedPrice = (product?.unitprice * product?.offerPerc) / 100;
    }
  } else {
    discountedPrice = product.linediscount;
  }
  const taxAmount = (product.tax / 100) * (product.unitprice - discountedPrice);

  return product.unitprice - discountedPrice + taxAmount;
};

export const getOptions = (item: MenuItemType) => {
  if (!item.productOptionsJSON) return [];
  let opt = [];
  try {
    opt = JSON.parse(item.productOptionsJSON);
  } catch (error) {
    console.log(error);
    opt = [];
  }
  return opt;
};
export function normalizeWeekDays(weekDaysStr: string) {
  return weekDaysStr
    .replace(/[\[\]\'\"]+/g, "")
    .split(",")
    .map(Number);
}

export function isDealAvailable(
  startDateTime: string | Date | moment.Moment,
  endDateTime: string | Date | moment.Moment,
  daysAvailable: number[],
  checkDateTime: string | Date | moment.Moment
): boolean {
  const start = moment(startDateTime);
  const end = moment(endDateTime);
  const checkTime = moment(checkDateTime);

  // Extract daily time window
  const dailyStartTime = moment(startDateTime).format("HH:mm");
  const dailyEndTime = moment(endDateTime).format("HH:mm");
  const [startHour, startMinute] = dailyStartTime.split(":").map(Number);
  const [endHour, endMinute] = dailyEndTime.split(":").map(Number);

  // Check overall availability range
  if (!checkTime.isBetween(start, end, undefined, "[)")) {
    return false;
  }

  // Custom day mapping: 1 = Sunday, ..., 7 = Saturday
  const jsDay = checkTime.day(); // 0 = Sunday, 6 = Saturday
  const customDay = jsDay === 0 ? 1 : jsDay + 1;

  if (!daysAvailable.includes(customDay)) {
    return false;
  }

  // Check if the time is within the daily time range
  const availableStartTime = checkTime
    .clone()
    .set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });

  const availableEndTime = checkTime
    .clone()
    .set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  return checkTime.isBetween(
    availableStartTime,
    availableEndTime,
    undefined,
    "[)"
  );
}

export const getValidDealCode = (
  encodedDealCodeId: string | undefined
): number | null => {
  if (typeof encodedDealCodeId === "string") {
    try {
      // Optional: remove decodeURIComponent if not needed
      const base64Str = decodeURIComponent(encodedDealCodeId);

      const decodedId = atob(base64Str);

      if (/^\d+$/.test(decodedId)) {
        return parseInt(decodedId);
      } else {
        console.warn("Decoded dealCode is not numeric:", decodedId);
      }
    } catch (e) {
      console.warn("Failed to decode dealId:", e);
    }
  }
  return null;
};

export const getMaxKitchenTime = (products: CartItem[]) => {
  if (!Array.isArray(products) || products.length === 0) {
    return 0; // Return 0 if products array is empty or not an array
  }

  return products.reduce((maxTime, product) => {
    const kitchenTime = product.kitchenTimeInMins || 0; // Default to 0 if kitchenTimeInMins is not present
    return Math.max(maxTime, kitchenTime);
  }, 0);
};

export const getImageUrlsFromVariation = (
  selectedVariation: MenuItem | undefined,
  fallbackImage = "/no-image.png"
): string[] => {
  if (!selectedVariation) return [fallbackImage];

  const { menuJSON, producturl } = selectedVariation;

  if (menuJSON === "") {
    return [producturl ? API_URL + producturl : fallbackImage];
  }

  if (menuJSON) {
    try {
      const jsonArray = JSON.parse(menuJSON);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const urls = jsonArray.map((item: any) => {
        const cleanPath = item.FileName.replace(/^wwwroot[\\/]+/, "").replace(
          /\\/g,
          "/"
        );
        return `${API_URL}/${cleanPath}`;
      });
      return urls.length
        ? urls
        : [producturl ? API_URL + producturl : fallbackImage];
    } catch (err) {
      console.error("Invalid JSON in selectedVariation.menuJSON", err);
      return [producturl ? API_URL + producturl : fallbackImage];
    }
  }

  return [producturl ? API_URL + producturl : fallbackImage];
};
// helpers/pathUtils.ts
export const cleanPath = (productUrl?: string): string => {
  if (!API_URL || !productUrl) return "";
  return API_URL + productUrl.replace(/^wwwroot[\\/]+/, "").replace(/\\/g, "/");
};
