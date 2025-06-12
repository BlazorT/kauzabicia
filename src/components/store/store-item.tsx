import { useAddToFavorite } from "@/hooks/useMenu";
import { getImageUrlsFromVariation } from "@/utils/menuUtils";
import { MenuItem } from "@/utils/types";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card"; // Assuming Card is a shadcn/ui Card component
import { MenuItemPricing } from "../menu/menu-item-pricing";
import { Button } from "../ui/button";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useAlert } from "@/context/alert-context";

type StoreItemProps = {
  store: MenuItem;
};

const StoreItem: React.FC<StoreItemProps> = ({ store }) => {
  const router = useRouter();
  const { addItem } = useCart();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { mutate: addToFavorite, isPending } = useAddToFavorite();
  const [isDealPicErr, setDealPicErr] = useState(false);

  const onRestaurantClick = () => {
    if (!user) {
      showAlert({
        title: "Sign In!",
        description:
          "To see more details or for detailed view, your need login, please sign in and proceed!",
        confirmText: "Sign In Now",
        onConfirm: () => router.push(`/auth/signin`),
        cancelText: "Cancel",
      });
      return;
    }
    router.push(`/menu/?id=${store?.productId}`);
    // Handle click on the entire card if needed
  };

  const stored = JSON.parse(localStorage.getItem("favStores") || "{}");

  const onAddToFav = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    if (typeof window === "undefined") return;

    addToFavorite(
      {
        status: stored[store.productDetailId]?.isFav ? 2 : 1, // Toggle favorite status
        storeId: store.storeId,
        productDetailId: store.productDetailId,
      },
      {
        onSuccess: (res) => {
          if (res?.status === true) {
            const updated = { ...stored };
            if (stored[store.productDetailId]?.isFav) {
              // Remove from fav
              delete updated[store.productDetailId];
              localStorage.setItem("favStores", JSON.stringify(updated));
              toast.success(
                `${store?.productname ?? ""} - ${
                  store.unitname
                } removed from favorites`
              );
            } else {
              // Add to fav
              updated[store.productDetailId] = { isFav: true };
              localStorage.setItem("favStores", JSON.stringify(updated));
              toast.success(
                `Thank you for adding ${store?.productname ?? ""} - ${
                  store.unitname
                } to your favorites`
              );
            }
          }
        },
      }
    );
  };

  const onAddItem = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onClick from firing

    addItem(store);
    toast.success(
      `${store.productname} - ${store?.unitname} has been added to cart successfully.`
    );
    if (user) {
      router.push("/menu");
    }
  };
  return (
    <Card
      className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md border-1 flex flex-col h-full py-2" // Use flex-col for stacking
      onClick={onRestaurantClick}
    >
      {/* --- Image Section (at the top) --- */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 flex-shrink-0">
        {" "}
        {/* Fixed height for image container */}
        <Image
          src={
            isDealPicErr ? "/no-image.png" : getImageUrlsFromVariation(store)[0]
          }
          alt={store.productname} // Use product name for alt text
          fill // Image will fill this div
          className="object-fill transition-transform duration-300 group-hover:scale-105" // Cover and scale on hover
          onError={() => setDealPicErr(true)}
        />
      </div>
      <div
        onClick={onAddToFav}
        className="absolute top-3 right-3 z-[21] bg-white rounded-full p-1 shadow-lg border border-gray-300 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        ) : (
          <Heart
            size={16}
            fill={
              stored && stored[store.productDetailId]?.isFav
                ? "red"
                : "transparent"
            }
            className={`${
              stored && stored[store.productDetailId]?.isFav
                ? "text-red-400"
                : "text-black"
            }`}
          />
        )}
      </div>

      {/* --- Details Section (below the image) --- */}
      <div className="relative flex-1 px-3 flex flex-col justify-between space-y-1">
        {" "}
        {/* flex-1 allows it to grow */}
        {/* Product Name & Favorite Icon */}
        <div className="flex items-start justify-between">
          <p className="text-lg truncate pr-2">
            {" "}
            {/* Added pr-2 to prevent overlap */}
            {store.productname} - {store?.unitname}
          </p>
          {/* Heart Icon moved here, relative to this div */}
        </div>
        <div className="flex gap-1 items-center">
          <MenuItemPricing item={store} />
          <span className="text-lg font-semibold">{store?.currencycode}</span>
        </div>
        <Button
          onClick={onAddItem}
          className="text-bold text-base text-primary-foreground"
        >
          <ShoppingBag />
          Add to cart
        </Button>
        {/* You can add more details here, e.g., description, price, rating etc. */}
        {/* <p className="text-xs text-muted-foreground line-clamp-2">
          {store.description}
        </p> */}
      </div>
    </Card>
  );
};

export default StoreItem;
