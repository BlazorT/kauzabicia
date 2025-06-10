// src/components/menu/MenuItem/components/MenuItemPricing.tsx
import { useConfig } from "@/context/config-context";
import { useMenuItem } from "@/hooks/useMenuItem";
import { cn } from "@/lib/utils";
import { MenuItem as MenuItemType } from "@/utils/types";

interface MenuItemPricingProps {
  item: MenuItemType;
  showOfferLabel?: boolean;
  showPoints?: boolean;
  className?: string;
  priceClassName?: string;
}

export const MenuItemPricing = ({
  item,
  showOfferLabel = true,
  showPoints = true,
  className,
  priceClassName,
}: MenuItemPricingProps) => {
  const { displayPrice, originalPrice, offerLabel, hasVariations } =
    useMenuItem(item);

  const { config } = useConfig();

  return (
    <div className={`${className}`}>
      {hasVariations ? (
        <p className="text-lg font-semibold">from {displayPrice}</p>
      ) : (
        <>
          <div
            className={cn(
              "flex items-baseline gap-2 text-lg font-semibold ",
              priceClassName
            )}
          >
            <p className="text-foreground">{displayPrice}</p>
            {originalPrice && (
              <p className="text-primary text-sm line-through">
                {originalPrice}
              </p>
            )}
          </div>
          {showOfferLabel && offerLabel && (
            <p className="text-sm text-green-600">{offerLabel}</p>
          )}
          {showPoints && config?.displayRewardPoints && item.points > 0 && (
            <p className="text-xs text-green-600">+{item.points} points</p>
          )}
        </>
      )}
    </div>
  );
};
