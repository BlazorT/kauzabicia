// src/app/[storeId]/hooks/useStorePage.ts
import { useGetDealz, useMenu } from "@/hooks/useMenu";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { organizeMenuByCategory } from "../utils/menuUtils";
import moment from "moment";
import { DealItem, MenuItem, OrderProduct } from "@/utils/types";
import { useFetchOrderDetails } from "./useOrder";
import { useAuth } from "@/context/auth-context";
import { USER_ROLE } from "@/constants/constants";

export const useStorePage = (id?: string) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const slug = params.slug || [];

  const encodedStoreId = id ?? btoa(JSON.stringify(1)); // always present
  const encodedSaleId =
    user && user?.roleId !== USER_ROLE.USER ? searchParams.get("saleId") : null;

  // const encodedStoreId = params.storeId; // Get the potentially encoded storeId
  // const dealCode = params.dealCode; // will be undefined if not provided
  let storeId: string | null = null;
  let saleId: string | null = null;
  let isNumericStoreId = false;
  // let isNumericSaleId = false;

  if (typeof encodedStoreId === "string") {
    try {
      const base64Str = decodeURIComponent(encodedStoreId);
      const decodedId = atob(base64Str);
      // console.log({ decodedId });
      if (/^\d+$/.test(decodedId)) {
        isNumericStoreId = true;
        storeId = decodedId;
      } else {
        console.warn("Decoded storeId is not numeric:", decodedId);
      }
    } catch (e) {
      console.warn("Failed to decode storeId:", e);
    }
  }
  if (typeof encodedSaleId === "string") {
    try {
      const base64Str = decodeURIComponent(encodedSaleId);
      const decodedId = atob(base64Str);
      // console.log({ decodedId });
      if (/^\d+$/.test(decodedId)) {
        // isNumericSaleId = true;
        saleId = decodedId;
      } else {
        console.warn("Decoded storeId is not numeric:", decodedId);
      }
    } catch (e) {
      console.warn("Failed to decode storeId:", e);
    }
  }

  // If the storeId is not numeric after decoding attempt, show 404
  if (!storeId || !isNumericStoreId || slug.length > 2) {
    notFound();
  }
  // console.log(saleId);
  // // If the saleId is not numeric after decoding attempt, show 404
  // if (!saleId || !isNumericSaleId) {
  //   notFound();
  // }
  // console.log(saleId);

  // Cast the validated storeId to string for use in the hook
  const validStoreId = storeId as string;

  const {
    data: menuResponse,
    isLoading,
    isError,
  } = useMenu(validStoreId, moment().format("YYYY-MM-DDTHH:mm:ss"));

  const { data: dealResponse, isLoading: isDealsLoading } = useGetDealz(
    parseInt(validStoreId)
  );
  // console.log({ menuResponse });
  const { data: orderDetailRes } = useFetchOrderDetails(
    saleId ? saleId?.toString() : null
  );
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const menuData = useMemo(() => menuResponse?.data ?? [], [menuResponse]);
  const order_products = useMemo(
    () => orderDetailRes?.data ?? [],
    [orderDetailRes]
  ) as OrderProduct[];

  const categorizedMenu = useMemo(() => {
    if (!menuResponse?.data || !Array.isArray(menuResponse.data)) return [];
    // Type guard to ensure data is MenuItem[]
    if (!menuResponse.data[0] || !("productId" in menuResponse.data[0]))
      return [];

    const categorized = organizeMenuByCategory(menuResponse.data as MenuItem[]);
    const deals = (dealResponse?.data as DealItem[]) ?? [];
    if (deals.length > 0) {
      categorized.unshift({
        id: Math.floor(100000 + Math.random() * 900000),
        name: "Deals",
        items: deals,
      });
    }

    return categorized;
  }, [menuResponse?.data, dealResponse?.data]);

  const mostlyBoughtTogetherItems = useMemo(() => {
    if (!menuResponse?.data || !Array.isArray(menuResponse.data)) return [];
    const items = menuResponse.data as MenuItem[];
    return items.filter((item) => item.mostlyBoughtTogether);
  }, [menuResponse?.data]);

  // Set up intersection observer for category sections
  useEffect(() => {
    if (categorizedMenu.length === 0) return;

    // Ensure activeCategory is based on the first category ID if menu is available
    if (categorizedMenu[0]?.id !== undefined) {
      setActiveCategory(categorizedMenu[0].id);
    }

    const options = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = Number(entry.target.id.replace("category-", ""));
          setActiveCategory(categoryId);

          const button = document.querySelector(
            `[data-category-button="${categoryId}"]`
          );
          if (button && scrollRef.current) {
            const scrollLeft =
              (button as HTMLElement).offsetLeft -
              (scrollRef.current.offsetWidth -
                (button as HTMLElement).offsetWidth) /
                2;
            scrollRef.current.scrollTo({
              left: scrollLeft,
              behavior: "smooth",
            });
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options);
    // Observe elements with IDs starting with "category-" only after categorizedMenu is ready
    if (categorizedMenu.length > 0) {
      document.querySelectorAll('[id^="category-"]').forEach((section) => {
        observerRef.current?.observe(section);
      });
    }

    return () => observerRef.current?.disconnect();
  }, [categorizedMenu]); // Added categorizedMenu as a dependency

  // Update scroll buttons visibility
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateButtons = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft + container.clientWidth < container.scrollWidth - 1
      );
    };

    updateButtons();
    container.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      container.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [categorizedMenu]); // Added categorizedMenu as a dependency

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const scrollToCategory = (categoryId: number) => {
    const element = document.getElementById(`category-${categoryId}`);
    const header = document.querySelector(".sticky.top-0"); // Assuming your header has these classes
    if (element && header) {
      const headerHeight = (header as HTMLElement).offsetHeight;
      // Scroll to the element, accounting for header height
      const targetPosition =
        element.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  return {
    storeId: validStoreId,
    categorizedMenu,
    isLoading: isLoading || isDealsLoading,
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
    menuData: menuData as MenuItem[],
    order_products,
    saleId,
  };
};
