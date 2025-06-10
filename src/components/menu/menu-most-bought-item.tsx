import { API_URL } from "@/services/apiClient";
import { getItemDiscount } from "@/utils/menuUtils";
import { MenuItem } from "@/utils/types";
import Image from "next/image";
import React, { useState } from "react";
import { MenuItemControls } from "./menu-item-controlls";

type MostBoughtItemProps = {
  item: MenuItem;
  isStoreOpen: boolean;
};

const MostBoughtItem: React.FC<MostBoughtItemProps> = ({
  item,
  isStoreOpen,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  return (
    <div
      key={item.productDetailId}
      className="flex items-center gap-2 justify-between cursor-pointer"
      // onClick={() => {
      //   const foundItem = findCartItem(item.productDetailId);
      //   if (foundItem) {
      //     removeItem(foundItem.productDetailId);
      //   } else {
      //     addItem(item);
      //   }
      // }}
    >
      <div className="flex items-center gap-4">
        <Image
          src={imageError ? "/no-image.png" : API_URL + item.producturl}
          alt={item.productname}
          width={70}
          height={70}
          onError={() => setImageError(true)}
          className="bg-card rounded-md"
        />
        <div className="space-y-1">
          <p>
            {item.productname} {item.unitname}
          </p>
          <p className="text-sm">
            {(item.unitprice - getItemDiscount(item))?.toFixed(2)}
          </p>
        </div>
      </div>
      <MenuItemControls
        item={item}
        toggleMenuItemDetails={() => {}}
        mostlyBoughtTogetherItems={[]}
        isStoreOpen={isStoreOpen}
      />
    </div>
  );
};

export default MostBoughtItem;
