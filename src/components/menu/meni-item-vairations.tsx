import { MenuItem } from "@/utils/types";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { MenuItemPricing } from "./menu-item-pricing";
import { useCart } from "@/context/cart-context";

type MenuItemVariationsProps = {
  item: MenuItem;
  setSelectedVariation: (variation: MenuItem) => void;
  selectedVariation: MenuItem;
  toggleMenuItemDetails: () => void;
};

const MenuItemVariations: React.FC<MenuItemVariationsProps> = ({
  item,
  setSelectedVariation,
  selectedVariation,
  toggleMenuItemDetails,
}) => {
  const [variation, setVariation] = useState<string>(
    selectedVariation?.productDetailId?.toString() ?? ""
  );

  const { addItem, increaseQuantity, findCartItem } = useCart();

  const handleVariationChange = (value: string) => {
    const findVariation = item.variations?.find(
      (variation) => variation.productDetailId.toString() === value
    );
    setVariation(value);
    if (findVariation) {
      setSelectedVariation(findVariation);
    }
  };

  const onDoubleClick = (variant: MenuItem) => {
    const foundItem = findCartItem(variant.productDetailId);
    if (foundItem) {
      increaseQuantity(variant.productDetailId);
    } else {
      addItem(variant);
    }
    toggleMenuItemDetails();
  };

  const Vairation = ({ item }: { item: MenuItem }) => {
    return (
      <div
        className="flex items-center space-x-3"
        onDoubleClick={() => onDoubleClick(item)}
      >
        <RadioGroupItem
          value={item.productDetailId.toString()}
          id={item.productDetailId.toString()}
        />
        <Label
          htmlFor={item.productDetailId.toString()}
          className="flex-1 justify-between cursor-pointer"
        >
          <p className="text-sm font-bold">{item.unitname}</p>
          <MenuItemPricing
            item={item}
            showOfferLabel={false}
            showPoints={false}
            className="text-sm flex-row-reverse gap-2 text-right justify-end items-end"
          />
        </Label>
      </div>
    );
  };

  if (
    (item?.variationCount && item?.variationCount < 2) ||
    !item?.variationCount
  )
    return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold">Units | Variations</h3>
      {/* <p className="text-muted-foreground">
        Product unit, for multiple units need to add one by one
      </p> */}
      <RadioGroup onValueChange={handleVariationChange} value={variation}>
        <div className="flex flex-col flex-wrap gap-4">
          {item.variations?.map((variation) => (
            <Vairation key={variation.productDetailId} item={variation} />
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default MenuItemVariations;
