import { getOptions } from "@/utils/menuUtils";
import { MenuItem } from "@/utils/types";
import React from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useCart } from "@/context/cart-context";

type MenuItemOptionsProps = {
  item: MenuItem;
  selectedOption: string | undefined;
  setSelectedOption: (option: string) => void;
  toggleMenuItemDetails: () => void;
};

export type Option = {
  Name: string;
  Id: number;
  Code: string;
};

const MenuItemOptions: React.FC<MenuItemOptionsProps> = ({
  item,
  selectedOption,
  setSelectedOption,
  toggleMenuItemDetails,
}) => {
  const { updateOptionId, findCartItem, addItem } = useCart();
  const options = getOptions(item);

  const cartItem = findCartItem(item.productDetailId);

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    if (cartItem) {
      updateOptionId(item.productDetailId, parseInt(value, 10));
    }
  };
  const onDoubleClick = (value: Option) => {
    if (cartItem) {
      updateOptionId(item.productDetailId, value.Id);
    } else {
      addItem({
        ...item,
        optionId: value.Id,
      });
    }
    toggleMenuItemDetails();
  };
  if (!options || options?.length === 0) return null;

  // Track selected option

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold">Available Options</h3>
      <p className="text-muted-foreground">
        Can select either option, price is same
      </p>

      <RadioGroup
        onValueChange={handleOptionChange}
        value={selectedOption}
        className="flex flex-col flex-wrap gap-4 cursor-pointer"
      >
        {options?.map((item: Option) => (
          <div
            key={item.Id}
            className="flex items-center space-x-3"
            onDoubleClick={() => onDoubleClick(item)}
          >
            <RadioGroupItem
              value={item.Id.toString()}
              id={item.Id.toString()}
            />
            <Label
              htmlFor={item.Id.toString()}
              className="flex-1 cursor-pointer"
            >
              <p className="text-sm font-bold">{item.Name}</p>
              {item.Code && (
                <p className="text-sm text-muted-foreground">({item.Code})</p>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default MenuItemOptions;
