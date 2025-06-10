// src/components/menu/MenuItem/components/MenuItemImage.tsx
import { API_URL } from "@/services/apiClient";
import Image from "next/image";
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface MenuItemImageProps {
  productUrl?: string;
  productName: string;
  isSpecial: boolean;
  isHalal?: boolean;
}

export const MenuItemImage = ({
  productUrl,
  productName,
  isSpecial,
  isHalal,
}: MenuItemImageProps) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = 34;

  return (
    <Carousel
      className="flex flex-1/6 justify-center items-center"
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem
            key={index}
            className="relative flex-shrink-0 flex items-center justify-center"
          >
            <Image
              src={
                productUrl && !imageError
                  ? API_URL + productUrl
                  : "/no-image.png"
              }
              alt={productName}
              width={dimensions}
              height={dimensions}
              sizes="(max-width: 768px) 100px, 100px"
              className="object-cover rounded-md w-full h-full"
              onError={() => setImageError(true)}
              priority={isSpecial}
              placeholder="blur"
              blurDataURL="/no-image.png"
            />
            {isHalal && (
              <span
                className={`absolute left-4 inline-flex items-center justify-center rounded-full bg-red-600`}
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
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
