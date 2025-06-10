"use client";

import { useCart } from "@/context/cart-context";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

const HeaderCart = () => {
  const { items } = useCart();

  const router = useRouter();

  const toMenu = () => {
    if (items.length === 0) return;
    else router.push(`/${btoa(items[0]?.storeId?.toString())}`);
  };
  return (
    <div
      className={`relative hover:scale-110 hover:duration-150`}
      onClick={toMenu}
    >
      <ShoppingCart
        className={`${
          items.length === 0 ? "cursor-not-allowed text-muted-foreground" : ""
        }`}
      />
      {items.length > 0 && (
        <div className="absolute w-4 h-4 top-[-8px] right-[-8px] text-xs items-center justify-center flex rounded-full text-primary-foreground bg-primary">
          {items.length}
        </div>
      )}
    </div>
  );
};

export default HeaderCart;
