// src/components/menu/MenuItem/hooks/useMenuItem.ts
import { useCart } from "@/context/cart-context";
import { MenuItem as MenuItemType } from "@/utils/types";
import { useMemo } from "react";
import { calculateDisplayPrice } from "../utils/menuItemUtils";

export const useMenuItem = (item: MenuItemType) => {
  const { findCartItem } = useCart();
  const foundItem = findCartItem(item.productDetailId);

  const { displayPrice, originalPrice, offerLabel } = useMemo(
    () => calculateDisplayPrice(item, foundItem),
    [item, foundItem]
  );

  const isInCart = item.productDetailId === foundItem?.productDetailId;
  const quantity = foundItem?.quantity || 0;

  return {
    displayPrice,
    originalPrice,
    offerLabel,
    isInCart,
    quantity,
    hasVariations: item.variationCount && item.variationCount > 1,
    foundItem,
  };
};
