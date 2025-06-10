import { useAddToFavorite } from "@/hooks/useMenu";
import { MenuItem } from "@/utils/types";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MenuItemFavoriteProps = {
  item: MenuItem;
};

const MenuItemFavorite: React.FC<MenuItemFavoriteProps> = ({ item }) => {
  const { mutate: addToFavorite, isPending } = useAddToFavorite();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [favStores, setFavStores] = useState<{
    [key: number]: { isFav: boolean };
  }>({});

  if (!item) return;

  const stored = JSON.parse(localStorage.getItem("favStores") || "{}");
  const onAddToFav = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;

    // Call API and then add
    addToFavorite(
      {
        status: stored[item.productDetailId]?.isFav ? 2 : 1,
        storeId: item.storeId,
        productDetailId: item.productDetailId,
      },
      {
        onSuccess: (res) => {
          if (res?.status === true) {
            const updated = {
              ...stored,
              [item.productDetailId]: { isFav: true },
            };
            if (stored[item.productDetailId]?.isFav) {
              // Remove from fav
              delete stored[item.productDetailId];
              localStorage.setItem("favStores", JSON.stringify(stored));
              setFavStores({ ...stored });
              toast.success(
                `${item?.productname ?? ""} - ${
                  item.unitname
                } removed from favorites`
              );
            } else {
              setFavStores(updated);
              localStorage.setItem("favStores", JSON.stringify(updated));
              toast.success(
                `Thank you for adding ${item?.productname ?? ""} - ${
                  item.unitname
                } to your favorites`
              );
            }
          }
        },
      }
    );
  };

  return (
    <div onClick={onAddToFav} aria-disabled={isPending} className="">
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Heart
            size={22}
            fill={
              stored && stored[item.productDetailId]?.isFav
                ? "red"
                : "transparent"
            }
            className={`${
              stored && stored[item.productDetailId]?.isFav
                ? "text-red-400"
                : ""
            }`}
          />
        </>
      )}
    </div>
  );
};

export default MenuItemFavorite;
