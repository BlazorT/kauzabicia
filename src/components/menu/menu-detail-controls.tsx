import { MenuItem } from "@/utils/types";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useCart } from "@/context/cart-context";
import { Input } from "../ui/input";
import { Minus, Plus, Trash } from "lucide-react";
import { useAlert } from "@/context/alert-context";
import { getOptions } from "@/utils/menuUtils";

type MenuDetailControlsProps = {
  selectedVariation: MenuItem;
  selectedOption: string | undefined;
  toggleMenuItemDetails: () => void;
};

const MenuDetailControls: React.FC<MenuDetailControlsProps> = ({
  selectedVariation,
  selectedOption,
  toggleMenuItemDetails,
}) => {
  const [qtyAmount, setQtyAmount] = useState(1);

  const {
    findCartItem,
    decreaseQuantity,
    removeItem,
    increaseQuantityByAmount,
    increaseQuantity,
    addItem,
  } = useCart();
  const { showAlert } = useAlert();

  const foundItem = findCartItem(selectedVariation.productDetailId);
  const quantity = foundItem?.quantity || 0;
  const options = getOptions(selectedVariation);

  useEffect(() => {
    if (quantity) {
      setQtyAmount(quantity);
    }
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        decreaseQuantity(selectedVariation.productDetailId);
      } else {
        increaseQuantityByAmount(selectedVariation.productDetailId, num);
      }
    }
  };
  const handleInputBlur = () => {
    const clamped = Math.min(Math.max(qtyAmount, 1), 99);
    if (clamped !== qtyAmount) {
      setQtyAmount(clamped);
    }

    if (clamped !== quantity) {
      if (clamped === 1) {
        decreaseQuantity(selectedVariation.productDetailId);
      } else {
        increaseQuantityByAmount(selectedVariation.productDetailId, clamped);
      }
    }
  };

  const closeModal = () => {
    if (
      selectedVariation?.variationCount &&
      selectedVariation?.variationCount < 2 &&
      options?.length === 0
    ) {
      toggleMenuItemDetails();
    }
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      addItem({
        ...selectedVariation,
        optionId: selectedOption ? parseInt(selectedOption, 10) : undefined,
      });
      closeModal();
    } else {
      showAlert({
        title: "Remove Item",
        description: `Are you sure you want to remove ${selectedVariation.productname}-${selectedVariation.unitname} from your cart?`,
        confirmText: "OK",
        onConfirm: () => {
          removeItem(selectedVariation.productDetailId);
          // closeModal();
          toggleMenuItemDetails();
        },
        cancelText: "Cancel",
      });
    }
  };

  const handleDecreaseOrRemove = () => {
    if (quantity === 1) {
      showAlert({
        title: "Remove Item",
        description: `Are you sure you want to remove ${selectedVariation.productname}-${selectedVariation.unitname} from your cart?`,
        confirmText: "Remove",
        onConfirm: () => {
          removeItem(selectedVariation.productDetailId);
        },
        cancelText: "Cancel",
      });
    } else {
      decreaseQuantity(selectedVariation.productDetailId);
    }
  };
  return (
    <div className="sticky bottom-0 flex items-center gap-2 bg-background p-2 z-50">
      {quantity > 0 && (
        <div className="flex flex-3/12 justify-around items-center gap-4 border-secondary border-2 p-2 rounded-xl hover:shadow-sm hover:shadow-muted-foreground/10 bg-background">
          {quantity === 1 ? (
            <Trash
              size={24}
              className="text-destructive"
              onClick={handleDecreaseOrRemove}
            />
          ) : (
            <Minus size={24} onClick={handleDecreaseOrRemove} />
          )}
          <Input
            type="text"
            inputMode="numeric"
            value={qtyAmount === 0 ? "" : qtyAmount} // show empty instead of 0
            className="w-5 text-sm font-medium border-none px-0 py-0 dark:bg-background h-6 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <Plus
            size={24}
            onClick={() => increaseQuantity(selectedVariation.productDetailId)}
          />
        </div>
      )}
      <Button
        disabled={options?.length > 0 && !selectedOption}
        className={`${quantity === 0 ? "flex-1" : "flex-3/4"} h-10`}
        onClick={handleAddToCart}
      >
        {quantity === 0 ? "Add to Cart" : "Remove from Cart"}
      </Button>
    </div>
  );
};

export default MenuDetailControls;
