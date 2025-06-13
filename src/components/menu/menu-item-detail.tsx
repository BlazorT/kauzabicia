import { MenuItem } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { DialogContent, DialogTitle } from "../ui/dialog";
import MenuItemVariations from "./meni-item-vairations";
import MenuDetailControls from "./menu-detail-controls";
import MenuItemOptions from "./menu-item-options";
import { MenuItemPricing } from "./menu-item-pricing";
import MostBoughtTogether from "./menu-most-bought";
import ImageCarousel from "../image-carousel";

interface MenuItemDetailProps {
  item: MenuItem;
  mostlyBoughtTogetherItems: MenuItem[];
  toggleMenuItemDetails: () => void;
  isStoreOpen: boolean;
  selectedImage: number;
  setSelectedImage: React.Dispatch<React.SetStateAction<number>>;
  setIsLightboxOpen: (value: boolean) => void;
  isLightboxOpen: boolean;
}

const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  mostlyBoughtTogetherItems,
  toggleMenuItemDetails,
  isStoreOpen,
  selectedImage,
  isLightboxOpen,
  setIsLightboxOpen,
  setSelectedImage,
}) => {
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
  }, [item]);

  if (!selectedVariation) return null;

  return (
    <DialogContent
      aria-describedby="menu-detail"
      aria-description="menu-detial"
      title="menu-detail"
      className="max-w-[90%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[80%] xl:max-w-[70%] p-0 max-h-[90vh] gap-1 overflow-y-auto"
    >
      <DialogTitle className="hidden"></DialogTitle>
      <div className="flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Left side - Image Carousel */}
        <div className="w-full md:w-1/2">
          <ImageCarousel
            item={selectedVariation}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            isLightboxOpen={isLightboxOpen}
            setIsLightboxOpen={setIsLightboxOpen}
          />
        </div>

        {/* Right side - Details */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="flex flex-row space-x-1 flex-wrap max-w-[90%]">
            <p className="text-lg font-bold">
              {selectedVariation.productname} - {selectedVariation.unitname}
            </p>
            <span className="text-lg font-bold">| Price : </span>
            <MenuItemPricing
              className="flex items-center gap-2"
              item={selectedVariation}
            />
          </div>
          <p
            className="text-muted-foreground  prose dark:prose-invert max-h-90 md:max-h-150 overflow-y-scroll hide-scrollbar"
            dangerouslySetInnerHTML={{ __html: selectedVariation.description }}
          />

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
          <MenuDetailControls
            selectedVariation={selectedVariation}
            selectedOption={selectedOption}
            toggleMenuItemDetails={toggleMenuItemDetails}
          />
        </div>
      </div>
    </DialogContent>
  );
};

export default MenuItemDetail;
