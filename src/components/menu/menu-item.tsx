// src/components/menu/MenuItem/index.tsx
import { MenuItem as MenuItemType } from "@/utils/types";
import { useMemo, useRef, useState } from "react";
import { Dialog } from "../ui/dialog";
import { MenuItemControls } from "./menu-item-controlls";
import { MenuItemDescription } from "./menu-item-description";
import MenuItemDetail from "./menu-item-detail";
import { MenuItemHeader } from "./menu-item-header";
import { MenuItemImage } from "./menu-item-image";
import { MenuItemPricing } from "./menu-item-pricing";
import { MenuItemTags } from "./menu-item-tags";
import { useCart } from "@/context/cart-context";
import { getOptions } from "@/utils/menuUtils";
import MenuItemFavorite from "./menu-item-fav";
import { Card, CardContent } from "../ui/card";

interface MenuItemProps {
  item: MenuItemType;
  mostlyBoughtTogetherItems: MenuItemType[];
  isStoreOpen: boolean;
}

export const MenuItem = ({
  item,
  mostlyBoughtTogetherItems,
  isStoreOpen = false,
}: MenuItemProps) => {
  const { addItem, increaseQuantity, findCartItem, items } = useCart();
  const [isMenuItemDetailsOpen, setIsMenuItemDetailsOpen] =
    useState<boolean>(false);

  const hasVariations = useMemo(
    () => item?.variationCount && item?.variationCount > 1,
    [item?.variationCount]
  );

  const hasOptions = useMemo(() => getOptions(item)?.length > 0, [item]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const foundItem = useMemo(() => findCartItem(item.productDetailId), [item]);

  const lastClickTime = useRef<number>(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const DOUBLE_CLICK_DELAY = 250; // ms

  const isDeal = useMemo(() => items?.[0]?.isDeal, [items]);

  const handleClick = () => {
    if (!isStoreOpen || isDeal) return;
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
      // Handle double click
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }

      handleDoubleClick();
    } else {
      // Handle single click with delay
      clickTimeout.current = setTimeout(() => {
        toggleMenuItemDetails();
      }, DOUBLE_CLICK_DELAY);
    }

    lastClickTime.current = now;
  };

  const handleDoubleClick = () => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    console.log("double click");
    if (hasOptions || hasVariations) {
      toggleMenuItemDetails();
      return;
    }
    if (foundItem) {
      increaseQuantity(item.productDetailId);
    } else {
      addItem(item);
    }
    // Optional: your double-click action
  };

  const toggleMenuItemDetails = () => {
    setIsMenuItemDetailsOpen(!isMenuItemDetailsOpen);
  };

  // console.log({ item });
  return (
    <>
      <Card className="px-2 py-2">
        <CardContent
          onClick={handleClick}
          className={`flex items-center gap-4 p-2 px-0 hover:bg-card/100 duration-300 rounded-lg bg-card/80 ${
            !isStoreOpen
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : ""
          }`}
        >
          <MenuItemImage
            productUrl={item.producturl}
            productName={item.productname}
            isSpecial={item.isSpecial === 1}
            isHalal={item.isHalal === 1}
          />

          <div className="flex-4/5">
            <div className="flex items-start justify-between">
              <MenuItemHeader
                name={item.productname}
                unitName={item.unitname}
                variations={item.variations}
              />
              <div className="space-x-2 flex flex-row">
                <MenuItemTags isSpecial={item.isSpecial === 1} />
                <MenuItemFavorite item={item} />
              </div>
            </div>

            <MenuItemDescription description={item.description} />

            <div className="flex items-center justify-between mt-2">
              <MenuItemPricing item={item} />
              <MenuItemControls
                item={item}
                toggleMenuItemDetails={toggleMenuItemDetails}
                mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
                isStoreOpen={isStoreOpen}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog
        modal
        open={isMenuItemDetailsOpen}
        onOpenChange={toggleMenuItemDetails}
      >
        <MenuItemDetail
          item={item}
          mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
          toggleMenuItemDetails={toggleMenuItemDetails}
          isStoreOpen={isStoreOpen}
        />
      </Dialog>
    </>
  );
};
