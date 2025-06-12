"use client";

import CartSidebar from "@/components/cart/cart-sidebar";
import { CategoryNav } from "@/components/category/category-nav";
import ManagedOrder from "@/components/checkout/managed-order";
import DealItem from "@/components/deal/deal-item";
import { MenuItem } from "@/components/menu/menu-item";
import { BookingInfo, CustomerInfo } from "@/components/order/order-detail";
import { StoreHero } from "@/components/store/store-hero";
import { StoreLayout } from "@/components/store/store-layout";
import Spinner from "@/components/ui/spinner";
import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { ConfigState, useConfig } from "@/context/config-context";
import { useOrder } from "@/context/order-context";
import { useGetConfig } from "@/hooks/useInitialData";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useStorePage } from "@/hooks/useStorePage";
import {
  DealItem as DealItemType,
  MenuItem as MenuItemType,
} from "@/utils/types";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
import { RefObject, useEffect, useMemo, useState } from "react";

export default function StorePage() {
  const {
    storeId,
    categorizedMenu,
    isLoading,
    isError,
    activeCategory,
    setActiveCategory,
    canScrollLeft,
    canScrollRight,
    scrollRef,
    scrollLeft,
    scrollRight,
    scrollToCategory,
    mostlyBoughtTogetherItems,
    menuData,
    saleId,
    order_products,
  } = useStorePage();

  const { storeData } = useStoreInfo(storeId);
  const { addItem } = useCart();
  const { setOrderInfo } = useOrder();
  const searchParams = useSearchParams();
  const isStoreOpen = storeData?.isStoreOpen ?? false;

  const showProductId = searchParams.get("id");

  const [searchQuery, setSearchQuery] = useState("");

  // Step 1: Flatten all productDetailIds from the menu

  const filteredMenu = useMemo(() => {
    if (!searchQuery) return categorizedMenu;

    return categorizedMenu
      .map((category) => ({
        ...category,
        items: (category.items as (MenuItemType | DealItemType)[]).filter(
          (item) => {
            if ("productname" in item) {
              return (
                item.productname
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                (item.description &&
                  item.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))
              );
            }
            if ("dealCode" in item) {
              return item.dealCode
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            }
            return false;
          }
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categorizedMenu, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useGetConfig(parseInt(storeId, 10));

  const { setConfig } = useConfig();

  useEffect(() => {
    if (!config) return;

    if (config && config.status === true) {
      setConfig(config.data as ConfigState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const { items, clearCart, storeId: cartSId, removeItem } = useCart();
  const { showAlert } = useAlert();
  const router = useRouter();

  const allMenuItemIds = useMemo(() => {
    return menuData.map((item) => item.productDetailId);
  }, [menuData]);

  // Step 2: Find cart items not present in menu
  const missingCartItems = useMemo(() => {
    if (items.length === 0 || allMenuItemIds.length === 0) return [];
    return items.filter(
      (cartItem) => !allMenuItemIds.includes(cartItem.productDetailId)
    );
  }, [items, allMenuItemIds]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length === 0) return;

      const message =
        "You have items in your cart. Are you sure you want to leave this page?";
      e.preventDefault();
      e.returnValue = message; // Required for Chrome

      return message; // For some older browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [items]);

  useEffect(() => {
    if (
      missingCartItems.length === 0 ||
      missingCartItems?.[0]?.storeId !== parseInt(storeId)
    )
      return;

    showAlert({
      title: "Items Removed from Cart",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The following products are no longer available on the menu and will
            be removed from your cart:
          </p>
          <ul className="space-y-1 list-disc list-inside text-left text-foreground">
            {missingCartItems.map((item) => (
              <li key={item.productDetailId}>
                <span className="font-medium">{item.productname}</span>
                {item.unitname ? ` - ${item.unitname}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ),
      description: "",
      confirmText: "Got it",
      onConfirm: () => {
        missingCartItems.forEach((item) => removeItem(item.productDetailId));
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingCartItems, storeId]);

  useEffect(() => {
    const cartStoreId = cartSId?.toString();
    if (items.length > 0 && cartStoreId && cartStoreId !== storeId) {
      showAlert({
        title: "Cart Items from Another Store",
        description: `You have items in your cart from another store. Do you want to continue with this store or clear the cart and proceed with previous store?`,
        onConfirm: () => {
          // Redirect to the previous storeId
          router.push(`/${btoa(cartStoreId)}`);
        },
        onCancel: () => {
          // Clear the cart and proceed with the new storeId
          clearCart();
        },
        cancelText: "Clear Cart & Proceed",
        confirmText: "Continue with Previous Store",
      });
    } else if (items.length === 0 || !cartStoreId) {
      // Set the current storeId in the cart context if the cart is empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, items, cartSId]);

  useEffect(() => {
    if (filteredMenu.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = Number(entry.target.id.replace("category-", ""));
            setActiveCategory(categoryId);
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -80% 0px", // tweak for better responsiveness
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll('[id^="category-"]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMenu]);

  useEffect(() => {
    if (
      !saleId ||
      order_products?.length === 0 ||
      !storeData ||
      menuData?.length === 0
    )
      return;
    onManageOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId, storeData, order_products, menuData]);

  const onManageOrder = () => {
    if (!storeData?.isStoreOpen) {
      showAlert({
        title: "Store Closed",
        description: `The ${
          storeData?.store?.name
        } is closed on ${moment().format("DD-MM-YYYY, hh:mm")}`,
        confirmText: "OK",
      });
      return;
    }

    addOrderToCart();
  };
  // console.log({ order_products });
  const addOrderToCart = () => {
    const unavailableItems = [];
    const order = order_products[0];

    const updatedItems: MenuItemType[] = order_products
      .map((orderItem) => {
        const menuItem = menuData.find(
          (item) => item.productDetailId === orderItem.productDetailId
        );
        if (menuItem) {
          let offerQty = 0;
          let disPercent = 0;

          disPercent = parseFloat(menuItem?.offerPerc?.toFixed(2) ?? 0);
          offerQty = menuItem?.offerQty ?? 0;

          return {
            ...orderItem,
            ...menuItem,
            orderId: saleId,
            quantity: orderItem.totalLoadedQty,
            order: order_products[0],
            saleDetailId: orderItem.saleDetailId,
            offerQty: offerQty ?? 0,
            offerPerc: disPercent ?? 0,
            initialLineDiscount: menuItem?.linediscount ?? 0,
          };
        }
        unavailableItems.push(orderItem);
        return null; // Return null if no match found
      })
      .filter((item) => item !== null) as MenuItemType[]; // Ensure the filtered result is MenuItem[]

    if (updatedItems.length == 0) {
      showAlert({
        title: "Info",
        description: `No items found for this order at this moment. Please try again later.`,
        confirmText: "OK",
      });
      return;
    }
    updatedItems.forEach((item: MenuItemType) => {
      addItem(item);
    });
    const parseCustomerInfo: CustomerInfo | null = (() => {
      if (!order?.customerInfo || typeof order.customerInfo !== "string") {
        return null;
      }

      try {
        return JSON.parse(order.customerInfo) as CustomerInfo;
      } catch (error) {
        console.error("Error parsing customerInfo:", error);
        return null;
      }
    })();

    const parseBookingInfo: BookingInfo[] | null = (() => {
      if (!order?.bookingjson || typeof order.bookingjson !== "string") {
        return null;
      }

      try {
        return JSON.parse(order.bookingjson) as BookingInfo[];
      } catch (error) {
        console.error("Error parsing bookingjson:", error);
        return null;
      }
    })();
    // console.log({ order });
    // console.log(parseBookingInfo);
    setOrderInfo((prev) => ({
      ...prev,
      deliveryCharges: order?.deliveryCharges ?? 0,
      voucherDiscount: order?.voucherAmount ?? 0,
      voucherCode: order?.voucherCode ?? "",
      isRedeemPoints: order?.pointsAmount ? true : false,
      pointsDiscount: order?.pointsAmount ?? 0,
      tipAmount: order?.tipAmount ?? 0,
      name: parseCustomerInfo?.name ?? "",
      email: parseCustomerInfo?.email ?? "",
      phone: parseCustomerInfo?.contact ?? "",
      guests: order?.guestscount?.toString(),
      paymentMethodId: 1,
      orderType: order?.saleTypeId,
      deliveryOption: order?.deliveryOptionId,
      deliveryNote: order?.deliveryNote,
      address: order?.address,
      orderNote: order?.orderNote,
      selectedSeats: parseBookingInfo
        ? parseBookingInfo?.map((booking) => ({
            tableId: booking.RestaurantTableId,
            seatIndex: booking.SeatId - 1,
          }))
        : [],
    }));
    router.replace(
      `/${btoa(order?.sku)}/?saleId=${btoa(order?.saleId?.toString())}`
    );
    // toggleShowMenu();
  };

  if (isLoading || configLoading) return <Spinner />;
  if (isError || configError)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load menu
      </div>
    );
  if (!categorizedMenu || categorizedMenu.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        No menu items available
      </div>
    );

  return (
    <StoreLayout>
      <StoreHero storeId={storeId} handleSearch={handleSearch} />
      {/* <MenuSearch onSearch={handleSearch} /> */}
      {saleId && <ManagedOrder saleId={saleId?.toString()} />}
      {filteredMenu.length > 1 && (
        <CategoryNav
          categories={filteredMenu}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          scrollToCategory={scrollToCategory}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          scrollLeft={scrollLeft}
          scrollRight={scrollRight}
          scrollRef={scrollRef as RefObject<HTMLDivElement>}
        />
      )}

      {/* Main Menu and Cart Sidebar */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Menu Content */}
        <div className="flex-1">
          {filteredMenu.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-2 scroll-mt-20"
            >
              {filteredMenu.length > 1 && (
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              )}

              <div className="row-gap-4 gap-2 grid grid-cols-1 lg:grid-cols-2">
                {category.items.map((item) =>
                  category.name === "Deals" ? (
                    <DealItem
                      key={item?.id?.toString()}
                      dealItem={item as DealItemType}
                      isStoreOpen={isStoreOpen}
                    />
                  ) : (
                    <MenuItem
                      key={(item as MenuItemType).productDetailId}
                      item={item as MenuItemType}
                      mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
                      isStoreOpen={isStoreOpen}
                      showProductId={showProductId}
                    />
                  )
                )}
              </div>
            </section>
          ))}
        </div>
        {/* Cart Sidebar */}
        <CartSidebar saleId={saleId} />
      </div>
    </StoreLayout>
  );
}
