// src/components/menu/MenuItem/components/MenuItemImage.tsx
import Image from "next/image";
import { useState } from "react";
import { API_URL } from "@/services/apiClient";

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
    <div className="relative w-[6rem] h-[6rem] flex-shrink-0">
      <Image
        src={productUrl && !imageError ? API_URL + productUrl : "/no-image.png"}
        alt={productName}
        fill
        sizes="(max-width: 768px) 96px, 96px"
        className="object-cover rounded-lg"
        onError={() => setImageError(true)}
        priority={isSpecial}
        placeholder="blur"
        blurDataURL="/no-image.png"
      />
      {isHalal && (
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
  );
};
