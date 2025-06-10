import { API_URL } from "@/services/apiClient";
import { MenuItem } from "@/utils/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { DialogContent, DialogTitle } from "../ui/dialog";
import MenuItemVariations from "./meni-item-vairations";
import MenuDetailControls from "./menu-detail-controls";
import MenuItemOptions from "./menu-item-options";
import { MenuItemPricing } from "./menu-item-pricing";
import { MenuItemTags } from "./menu-item-tags";
import MostBoughtTogether from "./menu-most-bought";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

// Add custom styles for lightbox

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
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(5);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    setSelectedVariation(
      item.variationCount && item.variationCount > 1 && item.variations
        ? item.variations[0]
        : item
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(carouselApi.scrollSnapList().length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState); // Clean up on unmount
    };
  }, [carouselApi]);

  useEffect(() => {
    if (selectedVariation) {
      // Create an array of image URLs
      const urls = Array.from({ length: 5 }).map(() =>
        imageError ? "/no-image.png" : API_URL + selectedVariation.producturl
      );
      setImageUrls(urls);
    }
  }, [selectedVariation, imageError]);

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const dimensions = 54;

  if (!selectedVariation) return null;
  // console.log({ imageUrls });
  return (
    <>
      <DialogContent
        aria-describedby="menu-detail"
        aria-description="menu-detial"
        title="menu-detail"
        className="max-w-[90%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[50%] xl:max-w-[40%] p-0 max-h-[90vh] gap-1 overflow-y-auto"
      >
        <DialogTitle className="hidden"></DialogTitle>
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          setApi={setCarouselApi}
          className="w-full h-60 justify-center items-center"
        >
          <CarouselContent>
            {imageUrls.map((image, index) => (
              <CarouselItem key={index}>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(index);
                    setIsLightboxOpen(true);
                  }}
                >
                  <Image
                    src={image}
                    alt={selectedVariation.productname}
                    sizes="100vw"
                    width={dimensions}
                    height={dimensions}
                    className="object-contain w-full h-60"
                    onError={() => setImageError(true)}
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
                          src="/halal.png"
                          alt="Halal"
                          width={dimensions}
                          height={dimensions}
                          style={{
                            filter: "invert(1)",
                          }}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute bottom-[-12px] left-0 right-0 flex justify-center space-x-2 z-20">
            {Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  currentIndex === index ? "bg-primary" : "bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </Carousel>

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
          <p className="text-muted-foreground">
            {selectedVariation.description}
          </p>
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
      <Lightbox
        className="z-[9999999999]"
        open={isLightboxOpen}
        styles={{ container: { zIndex: 99999999 } }}
        close={() => setIsLightboxOpen(false)}
        index={lightboxIndex}
        slides={imageUrls.map((img) => ({
          src: img,
          title: selectedVariation.productname,
          description: selectedVariation.description,
        }))}
        plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Zoom]}
      />
    </>
  );
};

export default MenuItemDetail;
