import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { ErrorVariant, useError } from "@/context/error-context";
import { useOrder } from "@/context/order-context";
import { useGetPoints } from "@/hooks/useOrder";
import { getTotalOrderAmount } from "@/utils/cartUtils";
import { COLLAPSIBLE_REF, POINTS_RESPONSE } from "@/utils/types";
import { Gift, Loader2, RotateCw } from "lucide-react";
import { RefObject, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { CollapsibleCard } from "../ui/collapsible";
import { Input } from "../ui/input";

type OrderPointsProps = {
  customerCollapsibleRef: RefObject<COLLAPSIBLE_REF | null>;
};

export default function OrderPoints({
  customerCollapsibleRef,
}: OrderPointsProps) {
  const { orderInfo, setOrderInfo } = useOrder();
  const { setError } = useError();
  const { config } = useConfig();
  const { totalPrice, items } = useCart();
  const { mutate: getPoints, isPending } = useGetPoints();

  const [points, setPoints] = useState<number>(0);
  const [redeemPoints, setRedeemPoints] = useState("");

  const collapsibleRef = useRef<COLLAPSIBLE_REF>(null);

  const billAmount = useMemo(() => {
    return getTotalOrderAmount(totalPrice, config, orderInfo);
  }, [totalPrice, config, orderInfo]);

  const canRedeemPoints = useMemo(() => {
    const wieghtage =
      config?.pointsOfferWeightPerc != null &&
      config?.pointsOfferWeightPerc !== 0
        ? Number(config.pointsOfferWeightPerc)
        : 100; // Ensure weightage is a number
    const maxPointsAllowed = (Number(billAmount) * 100) / wieghtage; // Convert back to points with fallback to prevent division by zero
    // console.log({ points, maxPointsAllowed, wieghtage });
    // Ensure points is a number and apply rounding after the min calculation
    const result = Math.min(Number(points), maxPointsAllowed);
    return parseFloat(result.toFixed(2)); // Ensure to keep only two decimals
  }, [config?.pointsOfferWeightPerc, billAmount, points]);

  if (orderInfo.voucherDiscount > 0) return null;

  const handleGetPoints = () => {
    if (!orderInfo.phone) {
      // toast.warning("Please enter your phone number");
      // const phoneInput = document.getElementById("phone");
      // if (phoneInput) {
      //   phoneInput.focus();
      // }
      customerCollapsibleRef?.current?.setIsOpen(true);
      setTimeout(() => {
        const phoneInput = document.getElementById("phone");
        if (phoneInput) {
          phoneInput.focus();
        }
      }, 200);
      setError({
        title: "Error",
        message: "Please enter your phone number",
        variant: ErrorVariant.Error,
      });

      return;
    }
    getPoints(
      { contact: orderInfo.phone },
      {
        onSuccess: (data) => {
          if (data && data.status && data.data) {
            const pointsData = data.data as POINTS_RESPONSE;
            if (pointsData?.status == 1) {
              // toast.success(pointsData?.message);
              const points = pointsData?.totalPoints;
              setPoints(points);
              collapsibleRef.current?.setIsOpen(true);
            } else if (pointsData && pointsData?.status == 0) {
              setPoints(0);
              setError({
                title: "No enough points",
                message: pointsData?.message,
                variant: ErrorVariant.Error,
              });
            }
          } else {
            setPoints(0);
            // toast.error(data?.message ?? "Something went wrong");
          }
        },
      }
    );
  };
  const handleRedeemPoints = () => {
    if (redeemPoints == "") {
      setError({
        title: "Warning",
        message: "Please enter points to redeem",
        variant: ErrorVariant.Warning,
      });
      setOrderInfo({
        ...orderInfo,
        isRedeemPoints: false,
        pointsRedeemed: 0,
        pointsDiscount: 0,
        paidAmount: 0,
      });
      return;
    }
    const wieghtage =
      config?.pointsOfferWeightPerc == 0
        ? 100
        : config?.pointsOfferWeightPerc ?? 0;
    const calculateDiscount = (parseFloat(redeemPoints) * wieghtage) / 100;
    setOrderInfo({
      ...orderInfo,
      isRedeemPoints: true,
      pointsRedeemed: parseFloat(redeemPoints),
      pointsDiscount: calculateDiscount,
      paidAmount: calculateDiscount,
    });
    setError({
      message: `You have redeemed ${redeemPoints} points`,
      variant: ErrorVariant.Success,
    });
    // toast.success(`You have redeemed ${redeemPoints} points`);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(",") || value.includes("-")) return;

    // Allow only one decimal point
    if ((value.match(/\./g) || []).length > 1) return;

    // Allow only up to two digits after the decimal
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    if (Number(value) > canRedeemPoints) {
      setError({
        message: `You can redeem only ${canRedeemPoints?.toFixed(2)} points`,
      });
      // toast.error(`You can redeem only ${canRedeemPoints?.toFixed(2)} points`);
      return;
    }

    setRedeemPoints(value);
    if (value == "") return;
  };

  const handleRemovePoints = () => {
    setOrderInfo({
      ...orderInfo,
      isRedeemPoints: false,
      pointsRedeemed: 0,
      pointsDiscount: 0,
      paidAmount: 0,
    });
  };

  if (items?.[0]?.isDeal) return null;
  return (
    <CollapsibleCard
      className="bg-secondary"
      ref={collapsibleRef as RefObject<COLLAPSIBLE_REF>}
      initialOpen={false}
      showHelperText={false}
      isCollapsible={canRedeemPoints > 0}
      header={
        <div className="flex items-center gap-2">
          <Gift />
          <span className="text-sm font-medium">Reward Points</span>
          {!orderInfo.isRedeemPoints ? (
            <div
              onClick={handleGetPoints}
              className="flex items-center text-sm font-medium border rounded-md px-2 py-0"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "View Points"}
              {!isPending && <RotateCw className="ml-2 h-4 w-4" />}
            </div>
          ) : (
            <span className="text-xs text-primary font-medium">
              You have earned {items[0]?.currencycode}{" "}
              {orderInfo.pointsDiscount} for {orderInfo.pointsRedeemed} points
            </span>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2 bg-secondary">
        {canRedeemPoints > 0 && orderInfo.isRedeemPoints == false && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                You can redeem {canRedeemPoints?.toFixed(2)} points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={redeemPoints}
                onChange={handlePointsChange}
                placeholder="Enter points to redeem"
              />
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={handleRedeemPoints}
              >
                Redeem Points
              </Button>
            </div>
          </>
        )}
        {orderInfo.isRedeemPoints && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                You have earned {items[0]?.currencycode}{" "}
                {orderInfo.pointsDiscount} for {orderInfo.pointsRedeemed} points
              </span>
              <Button
                variant={"destructive"}
                size={"sm"}
                onClick={handleRemovePoints}
              >
                Remove Points
              </Button>
            </div>
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}
