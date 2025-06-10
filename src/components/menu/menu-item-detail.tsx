import { API_URL } from "@/services/apiClient";
import { MenuItem } from "@/utils/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import { DialogContent, DialogTitle } from "../ui/dialog";
import MenuItemVariations from "./meni-item-vairations";
import MenuDetailControls from "./menu-detail-controls";
import MenuItemOptions from "./menu-item-options";
import { MenuItemPricing } from "./menu-item-pricing";
import { MenuItemTags } from "./menu-item-tags";
import MostBoughtTogether from "./menu-most-bought";

interface MenuItemDetailProps {
  item: MenuItem;
  mostlyBoughtTogetherItems: MenuItem[];
  toggleMenuItemDetails: () => void;
  isStoreOpen: boolean;
}

const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  mostlyBoughtTogetherItems,
  toggleMenuItemDetails,
  isStoreOpen,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  );
  const [selectedVariation, setSelectedVariation] = useState<MenuItem>();

  useEffect(() => {
    setSelectedVariation(
      item.variationCount && item.variationCount > 1 && item.variations
        ? item.variations[0]
        : item
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dimensions = 54;

  if (!selectedVariation) return null;
  return (
    <DialogContent
      aria-describedby="menu-detail"
      aria-description="menu-detial"
      title="menu-detail"
      className="max-w-[90%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[50%] xl:max-w-[40%] p-0 max-h-[90vh] gap-1 overflow-y-auto"
    >
      <DialogTitle className="hidden"></DialogTitle>
      <AspectRatio ratio={6 / 2}>
        <Image
          src={
            imageError
              ? "/no-image.png"
              : API_URL + selectedVariation.producturl
          }
          alt={selectedVariation.productname}
          fill
          sizes="100vw"
          onError={() => setImageError(true)}
          className="object-contain"
        />
        <div className="absolute top-2 left-2">
          <MenuItemTags
            isSpecial={selectedVariation.isSpecial === 1}
            size="md"
          />
          {item.isHalal === 1 && (
            <span
              className={`absolute left-0  inline-flex items-center justify-center rounded-full bg-red-600`}
              style={{ width: dimensions, height: dimensions }}
            >
              <Image
                src="/halal.png" // Replace with actual path
                alt="Halal"
                width={dimensions}
                height={dimensions}
                style={{
                  filter: "invert(1)", // Makes black image appear white
                }}
              />
            </span>
          )}
        </div>
      </AspectRatio>

      <div className="px-4 space-y-2 py-1">
        <div className="flex flex-row space-x-1 flex-wrap max-w-[90%]">
          <p className="text-lg font-bold ]">
            {selectedVariation.productname} - {selectedVariation.unitname}
          </p>
          {/* <p className="text-foreground">{selectedVariation.unitname}</p> */}
          <span className="text-lg font-bold">| Price : </span>
          <MenuItemPricing
            className="flex items-center gap-2"
            item={selectedVariation}
          />
        </div>
        <p className="text-muted-foreground">{selectedVariation.description}</p>
        <MenuItemVariations
          item={item}
          selectedVariation={selectedVariation}
          setSelectedVariation={setSelectedVariation}
          toggleMenuItemDetails={toggleMenuItemDetails}
        />
        <MenuItemOptions
          item={selectedVariation}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          toggleMenuItemDetails={toggleMenuItemDetails}
        />
        {!selectedVariation.mostlyBoughtTogether && (
          <MostBoughtTogether
            mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
            isStoreOpen={isStoreOpen}
          />
        )}
      </div>
      <MenuDetailControls
        selectedVariation={selectedVariation}
        selectedOption={selectedOption}
        toggleMenuItemDetails={toggleMenuItemDetails}
      />
    </DialogContent>
  );
};

export default MenuItemDetail;
