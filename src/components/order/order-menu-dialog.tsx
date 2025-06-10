import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useOrder } from "@/context/order-context";
import { useStorePage } from "@/hooks/useStorePage";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import {
  DealItem as DealItemType,
  MenuItem as MenuItemType,
  OrderProduct,
} from "@/utils/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CheckoutSummary from "../checkout/checkout-summary";
import { MenuItem } from "../menu/menu-item";
import { SearchBar } from "../menu/search-bar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Spinner from "../ui/spinner";

type OrderMenuDialogProps = {
  isVisible: boolean;
  toggleDialog: () => void;
  order: OrderProduct;
  products: OrderProduct[];
};

const OrderMenuDialog: React.FC<OrderMenuDialogProps> = ({
  isVisible,
  toggleDialog,
  order,
}) => {
  const router = useRouter();
  const { config } = useConfig();
  const { resetOrderInfo, orderInfo } = useOrder();
  const { clearCart, totalPrice } = useCart();
  const { categorizedMenu, isLoading, mostlyBoughtTogetherItems } =
    useStorePage(btoa(order?.sku));

  const [searchQuery, setSearchQuery] = useState("");

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
  // console.log({ order });
  const onSave = () => {
    // console.log(saleDetails);
    router.push(`/checkout/?saleId=${order?.saleId}`);
  };

  const onCancel = () => {
    clearCart();
    resetOrderInfo();
    toggleDialog();
  };
  if (!isVisible) return null;
  return (
    <Dialog open={isVisible}>
      {isLoading && <Spinner />}
      <DialogContent
        aria-describedby="order-menu"
        hideCloseButton
        className="max-w-[100%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[80%] xl:max-w-[80%]"
      >
        <DialogDescription className="hidden">Order Menu</DialogDescription>
        <DialogTitle className="hidden">Order Menu</DialogTitle>
        <DialogHeader className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <p className="text-lg font-semibold">Manage Order #{order?.saleId}</p>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search menu..."
            className="sm:w-80"
          />
          <Popover>
            <PopoverTrigger>
              <div className="flex gap-2 cursor-pointer">
                <p className="text-lg font-semibold">Total </p>
                <p className="text-lg font-semibold">
                  {order.currencyCode}{" "}
                  {getTotalOrderAmount(totalPrice, config, orderInfo)}{" "}
                  <span className="underline text-xs text-muted-foreground">
                    See summary
                  </span>
                </p>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-96 sm:w-100 mt-2">
              <CheckoutSummary />
            </PopoverContent>
          </Popover>
        </DialogHeader>

        <div className="h-[500px] overflow-y-auto px-1">
          {filteredMenu.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-4 scroll-mt-20"
            >
              {filteredMenu.length > 1 && (
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              )}

              <div className="row-gap-4 gap-2 grid grid-cols-1 lg:grid-cols-2">
                {category.items.map(
                  (item) =>
                    category.name !== "Deals" && (
                      <MenuItem
                        key={(item as MenuItemType).productDetailId}
                        item={item as MenuItemType}
                        mostlyBoughtTogetherItems={mostlyBoughtTogetherItems}
                        isStoreOpen={true}
                      />
                    )
                )}
              </div>
            </section>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Checkout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderMenuDialog;
