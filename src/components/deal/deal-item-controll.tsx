import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { useGetDealDetail } from "@/hooks/useMenu";
import {
  getValidDealCode,
  isDealAvailable,
  normalizeWeekDays,
} from "@/utils/menuUtils";
import { DealProduct } from "@/utils/types";
import { Loader2, Plus, Trash2 } from "lucide-react";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DealItemProps } from "./deal-item";
import { toast } from "sonner";
import { standardDaysMap } from "@/constants/constants";

const DealItemControll: React.FC<DealItemProps> = ({
  dealItem,
  isStoreOpen,
}) => {
  const {
    data: dealDetailResponse,
    isPending,
    isError,
  } = useGetDealDetail(dealItem.id);
  // console.log(dealItem.id);
  const { addItem, items, clearCart } = useCart();
  const { showAlert } = useAlert();
  const params = useParams();
  const slug = params.slug || [];

  const encodedDealId = slug[1]; // optional
  const dealProducts = useMemo(
    () => (dealDetailResponse as { data: { data: DealProduct[] } })?.data?.data,
    [dealDetailResponse]
  );

  useEffect(() => {
    const dealId = getValidDealCode(encodedDealId);
    if (dealId && dealId === dealItem.id && dealProducts?.length > 0) {
      onAddDeal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encodedDealId, dealItem, dealProducts]);

  if (isError) return null;

  const addDealtoCart = () => {
    dealProducts?.forEach((item) => {
      addItem({
        producturl: item.producturl,
        productname: item.productName,
        productDetailId: item.productDetailId,
        unitprice: item.defaultFixPrice,
        quantity: item.schemeBundleQty,
        storeId: item.storeId,
        dealPrice: item.dealPrice,
        dealCode: dealItem.dealCode,
        schemeAmount: dealItem.schemeAmount,
        currencycode: dealItem.currencyCode,
        isDeal: true,
        id: 0,
        linediscount: 0,
        productId: 0,
        description: "",
        offerPerc: 0,
        offerQty: 0,
        defaultFixPrice: 0,
        categoryid: 0,
        productcategory: "",
        unitname: "",
        isSpecial: 0,
        isHalal: 0,
        isFavourite: 0,
        mostlyBoughtTogether: 0,
        points: 0,
        status: 0,
        productOptionsJSON: "",
        tax: 0,
        kitchenTimeInMins: 0,
      });
    });
    toast.success(`${dealItem.dealCode} deal has been added to cart.`);
  };

  const isDealActive = isDealAvailable(
    dealItem.startTime,
    dealItem.endTime,
    normalizeWeekDays(dealItem.dealTarget),
    moment()
  );

  const dealNotActiveWarning = () => {
    if (!isDealActive) {
      const weekdays = normalizeWeekDays(dealItem.dealTarget);

      const availableDays: string[] = [];
      weekdays.forEach((weekday) => {
        availableDays.push(
          standardDaysMap[weekday as keyof typeof standardDaysMap]
        );
      });
      const startDate = moment(dealItem.startTime)
        .local()
        .format("DD MMM YYYY");
      const endDate = moment(dealItem.endTime).local().format("DD MMM YYYY");
      const startTime = moment(dealItem.startTime).local().format("h:mm A");
      const endTime = moment(dealItem.endTime).local().format("h:mm A");

      showAlert({
        title: `${dealItem.dealCode} Not Available`,
        description: "",
        content: (
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <p style={{ marginBottom: 8 }}>
              ⚠️ This deal is currently unavailable. Please review the
              availability details below:
            </p>

            <div style={{ marginBottom: 10 }}>
              <strong>🗓 Deal Days:</strong>
              <div>{availableDays.join(", ")}</div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <strong>⏰ Deal Timings:</strong>
              <div>{`${startTime} - ${endTime}`}</div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <strong>📅 Validity:</strong>
              <div>
                From <strong>{startDate}</strong> To <strong>{endDate}</strong>
              </div>
            </div>
          </div>
        ),
        confirmText: "Okay, Got It",
      });
    }
  };

  const onAddDeal = () => {
    if (!isDealActive || !isStoreOpen) {
      dealNotActiveWarning();
      return;
    }
    if (items.length > 0) {
      if (items[0]?.dealCode === dealItem.dealCode) return;
      showAlert({
        title: "Heads Up!",
        description:
          "Adding this deal will remove the items already in your cart. Do you want to continue?",
        confirmText: "Add Deal",
        cancelText: "Cancel",
        onConfirm: () => {
          clearCart();
          addDealtoCart();
        },
      });
      return;
    } else {
      addDealtoCart();
    }
  };

  const onRemoveDeal = () => {
    showAlert({
      title: "Remove Deal",
      description: `Are you want to remove deal ${dealItem.dealCode} from your cart?`,
      confirmText: "Ok",
      onConfirm: () => {
        clearCart();
      },
      cancelText: "Cancel",
    });
  };
  return (
    <div
      className={`border rounded-full p-1 cursor-pointer ${
        isDealActive
          ? ""
          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
      }`}
    >
      {isPending ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : dealItem.dealCode === items[0]?.dealCode ? (
        <Trash2 size={18} className="text-destructive" onClick={onRemoveDeal} />
      ) : (
        <Plus
          size={18}
          onClick={isDealActive ? onAddDeal : undefined}
          className={`transition-opacity ${
            isDealActive
              ? "cursor-pointer text-primary"
              : "cursor-not-allowed opacity-50"
          }`}
        />
      )}
    </div>
  );
};

export default DealItemControll;
