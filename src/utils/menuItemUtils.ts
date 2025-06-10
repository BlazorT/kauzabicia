// src/components/menu/MenuItem/utils/menuItemUtils.ts
import { CartItem } from "@/context/cart-context";
import { MenuItem as MenuItemType } from "@/utils/types";
import { getItemDiscount } from "./menuUtils";

interface DisplayPriceResult {
  displayPrice: string;
  originalPrice: string | null;
  offerLabel: string | null;
}

export const calculateDisplayPrice = (
  item: MenuItemType | CartItem,
  foundItem?: CartItem
): DisplayPriceResult => {
  const { unitprice, linediscount, tax, variationCount, offerPerc, offerQty } =
    item;

  const quantity = "quantity" in item ? item.quantity : 1;

  const baseSubtotal = unitprice - linediscount;
  const taxAmount = (tax / 100) * baseSubtotal;

  const baseTotal = unitprice + (tax / 100) * unitprice;
  const discountedUnitPrice = (unitprice * (100 - offerPerc)) / 100;
  const discountedTotal =
    discountedUnitPrice + (tax / 100) * discountedUnitPrice;

  const formatPrice = (price: number) => (quantity * price).toFixed(2);

  // Case 1: Item has variations (e.g., size/flavor), no discounts
  if (variationCount && variationCount > 1 && item.variations) {
    const lowestTotal = Math.min(
      ...item.variations.map((v) => {
        const itemDis = getItemDiscount(v);
        const base = v.unitprice - itemDis;
        return base + (v.tax / 100) * base;
      })
    );

    return {
      displayPrice: formatPrice(lowestTotal),
      originalPrice: null,
      offerLabel: null,
    };
  }

  // Case 2: Offer-based discount (e.g., Buy X Get Y% Off)
  const isOfferApplicable =
    offerPerc > 0 && (offerQty === 0 || (foundItem?.quantity ?? 0) >= offerQty);

  if (offerPerc > 0) {
    const offerLabel =
      offerQty > 0
        ? `BUY ${offerQty} GET ${offerPerc}% OFF`
        : `${offerPerc}% off`;

    return {
      displayPrice: formatPrice(
        isOfferApplicable ? discountedTotal : baseTotal
      ),
      originalPrice: isOfferApplicable ? formatPrice(baseTotal) : "",
      offerLabel,
    };
  }

  // Case 3: Line discount (direct amount off the base price)
  if (linediscount > 0) {
    const discountedPrice = baseSubtotal + taxAmount;

    return {
      displayPrice: formatPrice(discountedPrice),
      originalPrice: formatPrice(baseTotal),
      offerLabel: null,
    };
  }

  // Default case: No discounts, no variations
  return {
    displayPrice: formatPrice(baseTotal),
    originalPrice: null,
    offerLabel: null,
  };
};
