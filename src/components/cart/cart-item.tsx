import { useAlert } from "@/context/alert-context";
import { CartItem as CartItemType, useCart } from "@/context/cart-context";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MenuItemPricing } from "../menu/menu-item-pricing";
import { Input } from "../ui/input";

interface CartItemProps {
  item: CartItemType;
  increase: () => void;
  decrease: () => void;
  remove: () => void;
}

export default function CartItem({
  item,
  increase,
  decrease,
  remove,
}: CartItemProps) {
  const { increaseQuantityByAmount } = useCart();
  const { showAlert } = useAlert();

  const [qtyAmount, setQtyAmount] = useState(0);

  const quantity = item?.quantity || 0;

  const hasOffer = item.offerPerc > 0;

  const isDiscountUnlocked = hasOffer && item.quantity >= item.offerQty;
  const prevUnlockedRef = useRef(false);

  useEffect(() => {
    if (quantity) {
      setQtyAmount(quantity);
    }
  }, [quantity]);

  useEffect(() => {
    if (isDiscountUnlocked && !prevUnlockedRef.current) {
      showAlert({
        title: "Congrats!",
        description: `You have got ${item.offerPerc}% off! on ${item.productname} ${item.unitname}`,
        confirmText: "Close",
      });

      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
    }

    prevUnlockedRef.current = isDiscountUnlocked;
  }, [isDiscountUnlocked, item, showAlert]);

  const handleDecreaseOrRemove = () => {
    const quantity = item?.quantity || 0;
    if (quantity === 1) {
      showAlert({
        title: "Remove Item",
        description: `Are you sure you want to remove ${item.productname}-${item.unitname} from your cart?`,
        confirmText: "OK",
        onConfirm: () => {
          remove();
        },
        cancelText: "Cancel",
      });
    } else {
      decrease();
    }
  };

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
        handleDecreaseOrRemove();
      } else {
        increaseQuantityByAmount(item.productDetailId, num);
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
        handleDecreaseOrRemove();
      } else {
        increaseQuantityByAmount(item.productDetailId, clamped);
      }
    }
  };
  const onDoubleClick = () => {
    increase();
  };
  return (
    <div
      className="flex items-center justify-between p-2 hover:shadow-sm hover:drop-shadow-muted-foreground"
      onDoubleClick={onDoubleClick}
    >
      <div className="flex-1 overflow-hidden">
        <h3 className="font-medium truncate">
          {item.isDeal ? item.quantity + "x" : ""} {item.productname}{" "}
          {item.unitname ? "- " + item.unitname : ""}
        </h3>
        {/* <p className="text-sm text-muted-foreground truncate">
          {item.unitname}
        </p> */}

        {/* {isDiscountUnlocked && (
          <div className="mt-1 flex items-center gap-1 text-sm text-green-600 animate-pulse">
            <span>🎉</span>
            <span>Congrats! You&apos;ve got {item.offerPerc}% off!</span>
          </div>
        )} */}
        <MenuItemPricing item={item} />
      </div>
      {!item.isDeal && (
        <div className="flex items-center gap-2 border-secondary border-2 p-2 rounded-full hover:shadow-sm hover:shadow-muted-foreground/10 transition-transform duration-200">
          <div onClick={() => handleDecreaseOrRemove()}>
            {item.quantity === 1 ? (
              <Trash2 size={20} className="text-red-400" />
            ) : (
              <Minus size={20} />
            )}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            value={qtyAmount === 0 ? "" : qtyAmount} // show empty instead of 0
            className="w-5 text-sm font-medium border-none bg-transparent px-0 py-0 dark:bg-transparent h-6 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <div onClick={increase}>
            <Plus size={20} />
          </div>
        </div>
      )}
    </div>
  );
}
