"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useStorePage } from "@/hooks/useStorePage";
import { API_URL } from "@/services/apiClient";
import { MenuItem, Review } from "@/utils/types";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MenuItemDetail from "../menu/menu-item-detail";
import { Dialog } from "../ui/dialog";

type StoreReviewProps = {
  review: Review & { products: Review[] };
};

const StoreReview: React.FC<StoreReviewProps> = ({ review }) => {
  const { menuData, storeId, mostlyBoughtTogetherItems } = useStorePage();
  const { storeData } = useStoreInfo(storeId);

  const [avatarErr, setAvatarErr] = useState(false);
  const [productImageErrors, setProductImageErrors] = useState<
    Record<number, boolean>
  >({});
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isMenuItemDetailsOpen, setIsMenuItemDetailsOpen] =
    useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const findProduct = (productId: number) =>
    menuData.find((item) => item.productDetailId === productId);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const checkOverflow = () => {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      };

      checkOverflow();

      window.addEventListener("resize", checkOverflow);
      return () => {
        window.removeEventListener("resize", checkOverflow);
      };
    }
  }, [review.products]); // Trigger when product list changes

  const onAddProduct = (productId: number) => {
    const product = findProduct(productId);
    if (!product) {
      return;
    }
    setSelectedProduct(product);
    setIsMenuItemDetailsOpen(true);
  };

  const toggleMenuItemDetails = () => {
    setIsMenuItemDetailsOpen(false);
    setSelectedProduct(null);
  };

  const scrollProducts = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  // Drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // scroll-fast multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const profileUrl = review?.avatar?.includes("https")
    ? review?.avatar
    : API_URL + review?.avatar;

  return (
    <div
      key={review.id}
      className="bg-card rounded-lg border p-4 space-y-3 w-full"
    >
      {selectedProduct && (
        <Dialog
          modal
          open={isMenuItemDetailsOpen}
          onOpenChange={toggleMenuItemDetails}
        >
          <MenuItemDetail
            item={selectedProduct}
            mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
            toggleMenuItemDetails={toggleMenuItemDetails}
            isStoreOpen={storeData?.isStoreOpen ?? false}
          />
        </Dialog>
      )}
      {/* User Info */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {profileUrl ? (
            <Image
              src={avatarErr ? "/no-image.png" : profileUrl}
              alt={profileUrl}
              width={32}
              height={32}
              className="rounded-full"
              onError={() => setAvatarErr(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{review.userName?.toUpperCase()}</span>
        </div>
        <span>•</span>
        <span className="text-sm text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= review.ratingScore
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      {review.reviewRemarks && (
        <p className="text-sm">{review.reviewRemarks}</p>
      )}

      {/* Liked Items */}
      {review.products && review.products.length > 0 && (
        <div className="space-y-2 w-full">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Liked {review.products.length} items
            </p>
            {isOverflowing && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollProducts("left")}
                  className="p-1 rounded-full border-1 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollProducts("right")}
                  className="p-1 rounded-full border-1 cursor-pointer"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div>
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`hide-scrollbar flex items-center gap-2 overflow-x-auto max-w-[calc(100dvw-6rem)] md:max-w-[calc(100dvw-18rem)] lg:max-w-[calc(100dvw-46rem)] xl:max-w-[calc(100dvw-83rem)] cursor-grab  ${
                isDragging ? "cursor-grabbing" : ""
              }`}
            >
              {review.products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-md  flex-shrink-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Image
                      src={
                        productImageErrors[index]
                          ? "/no-image.png"
                          : API_URL + product.avatar
                      }
                      alt={product.productName}
                      width={50}
                      height={50}
                      className="rounded-md object-contain max-w-[50px] max-h-[50px]"
                      onError={() =>
                        setProductImageErrors((prev) => ({
                          ...prev,
                          [index]: true,
                        }))
                      }
                    />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {product.productName}
                      </p>
                      <p className="text-sm text-primary">
                        {product.currencyCode} {product.unitPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {product.reviewRemarks && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="p-1 rounded-full border-1 cursor-pointer">
                              <InfoIcon className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[200px] text-sm">
                              {product.reviewRemarks}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <button
                      onClick={() => onAddProduct(product.productDetailId)}
                      className="p-1 rounded-full bg-background border-1 text-foreground cursor-pointer"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreReview;
