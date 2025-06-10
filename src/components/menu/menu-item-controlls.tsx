// src/components/menu/MenuItem/components/MenuItemControls.tsx
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem as MenuItemType } from "@/utils/types";
import { useAlert } from "@/context/alert-context";
import { Input } from "../ui/input";
import { getOptions } from "@/utils/menuUtils";
import { useLocation } from "@/context/location-context";

interface MenuItemControlsProps {
  item: MenuItemType;
  toggleMenuItemDetails: () => void;
  mostlyBoughtTogetherItems: MenuItemType[];
  isStoreOpen: boolean;
}

export const MenuItemControls = ({
  item,
  toggleMenuItemDetails,
  mostlyBoughtTogetherItems,
  isStoreOpen,
}: MenuItemControlsProps) => {
  const {
    addItem,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    findCartItem,
    increaseQuantityByAmount,
    items,
  } = useCart();

  const { requestUserLocation } = useLocation();
  const foundItem = findCartItem(item.productDetailId);

  const hasVariations = useMemo(
    () => item?.variationCount && item?.variationCount > 1,
    [item?.variationCount]
  );

  const hasOptions = useMemo(() => getOptions(item)?.length > 0, [item]);

  const hasMostlyBoughtTogether = useMemo(
    () =>
      mostlyBoughtTogetherItems?.length > 0 && item?.mostlyBoughtTogether === 0,
    [mostlyBoughtTogetherItems, item?.mostlyBoughtTogether]
  );

  const variationsInCart = useMemo(() => {
    if (!hasVariations) return 0;
    let count = 0;
    const cartVariations = item?.variations;
    if (!cartVariations) return 0;
    cartVariations.forEach((variation) => {
      const find = findCartItem(variation.productDetailId);
      if (find) count += find.quantity;
    });
    return count;
  }, [hasVariations, item, findCartItem]);

  const quantity = variationsInCart || foundItem?.quantity || 0;

  const isDeal = useMemo(() => items?.[0]?.isDeal, [items]);

  // console.log({ isDeal });
  // console.log({
  //   variationsInCart,
  //   item: item.productname,
  //   hasVariations,
  //   quantity,
  // });
  const { showAlert } = useAlert();
  const [isExpanded, setIsExpanded] = useState(false);
  const [qtyAmount, setQtyAmount] = useState(0);
  const [interactionTimer, setInteractionTimer] =
    useState<NodeJS.Timeout | null>(null);

  const resetTimer = (timer?: number) => {
    if (interactionTimer) clearTimeout(interactionTimer);
    setInteractionTimer(setTimeout(() => setIsExpanded(false), timer ?? 2000));
  };

  useEffect(() => {
    if (quantity) {
      setQtyAmount(quantity);
    }
  }, [quantity]);

  useEffect(() => {
    if (isExpanded) resetTimer();
    return () => {
      if (interactionTimer) clearTimeout(interactionTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const handleAddItem = () => {
    if (!isStoreOpen || isDeal) return;
    requestUserLocation();
    if (hasVariations || hasOptions || hasMostlyBoughtTogether) {
      toggleMenuItemDetails();
    } else {
      addItem(item);
      setIsExpanded(true);
    }
  };

  const handleIncrease = () => {
    if (!isStoreOpen || isDeal) return;
    increaseQuantity(item.productDetailId);
    resetTimer();
  };

  const handleDecreaseOrRemove = () => {
    if (!isStoreOpen || isDeal) return;
    if (quantity === 1) {
      showAlert({
        title: "Remove Item",
        description: `Are you sure you want to remove ${item.productname}-${item.unitname} from your cart?`,
        confirmText: "Ok",
        onConfirm: () => {
          removeItem(item.productDetailId);
        },
        cancelText: "Cancel",
      });
    } else {
      decreaseQuantity(item.productDetailId);
    }
    resetTimer();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStoreOpen || isDeal) return;
    const raw = e.target.value;

    // Allow empty string temporarily
    if (raw === "") {
      setQtyAmount(0); // show empty state
      return;
    }

    // Prevent non-numeric input or more than 2 digits
    if (!/^\d{1,2}$/.test(raw)) return;

    // Prevent leading zeros like "01", "05"
    if (raw.length >= 1 && raw.startsWith("0")) return;

    let num = Number(raw);

    // Clamp between 1 and 99
    num = Math.max(0, Math.min(99, num));
    setQtyAmount(num);

    if (num !== quantity) {
      if (num === 0) {
        handleDecreaseOrRemove();
      } else {
        increaseQuantityByAmount(item.productDetailId, num);
      }
    }

    resetTimer();
  };
  const handleInputBlur = () => {
    if (!isStoreOpen || isDeal) return;
    const clamped = Math.min(Math.max(qtyAmount, 1), 99);
    if (clamped !== qtyAmount) {
      setQtyAmount(clamped);
    }

    if (clamped !== quantity) {
      if (clamped === 1) {
        handleDecreaseOrRemove();
      } else {
        increaseQuantityByAmount(item.productDetailId, clamped);
      }
    }
  };

  const handleFocus = () => {
    resetTimer(5000);
  };

  return (
    <div className="z-1" onClick={(e) => e.stopPropagation()}>
      {foundItem || variationsInCart > 0 ? (
        <div className="relative">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 border-secondary border-2 p-1 rounded-full hover:shadow-sm hover:shadow-muted-foreground/10 bg-background"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecreaseOrRemove}
                  className="cursor-pointer p-1"
                >
                  {quantity === 1 ? (
                    <Trash2 size={18} className="text-destructive" />
                  ) : (
                    <Minus size={18} />
                  )}
                </motion.div>
                {/* Input field for quantity */}
                <Input
                  type="text"
                  inputMode="numeric"
                  value={qtyAmount === 0 ? "" : qtyAmount} // show empty instead of 0
                  className="w-5 text-sm font-medium border-none bg-background px-0 py-0 dark:bg-background h-6 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onFocusCapture={handleFocus}
                />

                {/* <span className="px-2 text-sm font-medium">{quantity}</span> */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleIncrease}
                  className="cursor-pointer p-1"
                >
                  <Plus size={18} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer shadow-sm"
                onClick={() => {
                  if (!isStoreOpen || isDeal) return;
                  if (hasVariations || hasOptions || hasMostlyBoughtTogether) {
                    toggleMenuItemDetails();
                  } else {
                    setIsExpanded(true);
                  }
                }}
              >
                <span className="text-sm font-medium">{quantity}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          onClick={handleAddItem}
          whileHover={isStoreOpen ? { scale: 1.05 } : undefined}
          whileTap={isStoreOpen ? { scale: 0.95 } : undefined}
          className={`border rounded-full p-1 cursor-pointer ${
            !isStoreOpen || isDeal
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-card border-muted-foreground"
          }`}
        >
          <Plus size={18} />
        </motion.div>
      )}
    </div>
  );
};
