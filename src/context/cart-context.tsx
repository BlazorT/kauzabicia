"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { MenuItem as MenuItemType, OrderProduct } from "@/utils/types";

export interface CartItem extends MenuItemType {
  quantity: number;
  optionId: number | undefined;
  isDeal?: boolean;
  dealCode?: string;
  dealPrice?: number;
  schemeAmount?: number;
  order?: OrderProduct | null;
  saleDetailId?: number;
}

interface CartContextProps {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  storeId: number;
  addItem: (
    item: MenuItemType & {
      optionId?: number | undefined;
      quantity?: number;
      isDeal?: boolean;
      dealCode?: string;
      dealPrice?: number;
      schemeAmount?: number;
      order?: OrderProduct | null;
    }
  ) => void;
  removeItem: (productDetailId: number) => void;
  increaseQuantity: (productDetailId: number) => void;
  decreaseQuantity: (productDetailId: number) => void;
  clearCart: () => void;
  findCartItem: (productDetailId: number) => CartItem | undefined;
  increaseQuantityByAmount: (productDetailId: number, amount: number) => void;
  addItemByAmount: (item: MenuItemType, amount: number) => void;
  updateOptionId: (productDetailId: number, optionId: number) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (
    item: MenuItemType & {
      optionId?: number;
      quantity?: number;
      isDeal?: boolean;
      dealCode?: string;
      dealPrice?: number;
      schemeAmount?: number;
      order?: OrderProduct | null;
    }
  ) => {
    const {
      optionId = undefined,
      quantity = 1,
      isDeal = false,
      dealCode = "",
      dealPrice = 0,
      schemeAmount = 0,
      order = null,
      ...rest
    } = item;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productDetailId === rest.productDetailId
      );

      if (existing) {
        return prev.map((i) =>
          i.productDetailId === rest.productDetailId
            ? { ...i, quantity: item.quantity ? item.quantity : i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          ...rest,
          quantity,
          optionId,
          isDeal,
          dealCode,
          dealPrice,
          schemeAmount,
          order,
        },
      ];
    });
  };

  const addItemByAmount = (item: MenuItemType, amount: number) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productDetailId === item.productDetailId
      );
      if (existing) {
        return prev.map((i) =>
          i.productDetailId === item.productDetailId
            ? { ...i, quantity: i.quantity + amount }
            : i
        );
      }
      return [...prev, { ...item, quantity: amount, optionId: undefined }];
    });
  };

  const removeItem = (productDetailId: number) => {
    setItems((prev) =>
      prev.filter((i) => i.productDetailId !== productDetailId)
    );
  };

  const increaseQuantity = (productDetailId: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productDetailId === productDetailId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const increaseQuantityByAmount = (
    productDetailId: number,
    amount: number
  ) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productDetailId === productDetailId ? { ...i, quantity: amount } : i
      )
    );
  };

  const decreaseQuantity = (productDetailId: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productDetailId === productDetailId) {
            const qty = i.quantity - 1;
            return { ...i, quantity: qty };
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const updateOptionId = (productDetailId: number, optionId: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productDetailId === productDetailId ? { ...i, optionId } : i
      )
    );
  };

  const findCartItem = (productDetailId: number) => {
    return items.find((i) => i.productDetailId === productDetailId);
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items?.[0]?.isDeal
    ? items?.[0]?.dealPrice ?? 0
    : items.reduce((sum, i) => {
        let discountedPrice = 0;
        if (i.offerPerc > 0) {
          if (i.quantity >= i.offerQty) {
            discountedPrice = (i.unitprice * i.offerPerc) / 100;
          } else {
            discountedPrice = i.linediscount;
          }
        } else {
          discountedPrice = i.linediscount;
        }
        const taxAmount = (i.tax / 100) * (i.unitprice - discountedPrice);
        return sum + i.quantity * (i.unitprice - discountedPrice + taxAmount);
      }, 0);

  const storeId = items[0]?.storeId ?? 0;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        storeId,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        findCartItem,
        increaseQuantityByAmount,
        addItemByAmount,
        updateOptionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
