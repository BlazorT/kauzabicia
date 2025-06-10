import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useLocation } from "@/context/location-context";
import { LOV, useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const CartTabs = () => {
  const { orderInfo, setOrderInfo } = useOrder();
  const { lovs } = useLOV();
  const { items } = useCart();
  const { config } = useConfig();
  const { checkLocationPermission, selectedPosition } = useLocation();
  const { showAlert } = useAlert();
  const { storeData } = useStoreInfo(items[0]?.storeId?.toString() ?? "");

  const router = useRouter();

  const isAllNotDisabled = useMemo(() => {
    if (!config) return false;
    return (
      !config?.dineInAllowed &&
      !config?.takeAwayAllowed &&
      !config?.isDeliveryAllowed
    );
  }, [config]);

  useEffect(() => {
    if (isAllNotDisabled) {
      showAlert({
        title: "Info",
        description: `This time ${
          storeData?.store?.name ?? ""
        } is not accepting any kind of order, thank you for your interest.`,
        confirmText: "OK",
        onConfirm: () => {
          router.replace(`/${btoa(items[0].storeId.toString())}`);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllNotDisabled, storeData?.store]);

  const onTabChange = async (value: string) => {
    if (
      value === "3" &&
      (selectedPosition === null || selectedPosition?.[0] === 0)
    ) {
      const permission = await checkLocationPermission();
      if (permission !== "granted") {
        showAlert({
          title: "Warning",
          description:
            "For delivery, need location, please allow locations and try another time!!!",
          confirmText: "OK",
        });
        return;
      }
    }

    const paymentMethodId = orderInfo.paymentMethodId;
    setOrderInfo((prev) => ({
      ...prev,
      orderType: parseInt(value, 10),
      paymentMethodId:
        paymentMethodId === 1 && value === "3"
          ? 3
          : paymentMethodId === 3 && value === "1"
          ? 1
          : paymentMethodId,
    }));
  };

  const getImageSrc = (type: LOV) => {
    switch (type.id) {
      case 1:
        return "/dinein.png";
      case 2:
        return "/take-away.png";
      case 3:
        return "/delivery.png";
      default:
        return "/dinein.png";
    }
  };

  const isDeliveryAllowed = config?.isDeliveryAllowed;
  const takeAwayAllowed = config?.takeAwayAllowed;
  const dineInAllowed = config?.dineInAllowed;

  useEffect(() => {
    if (orderInfo.orderType === 3 && !isDeliveryAllowed) {
      setOrderInfo((prev) => ({
        ...prev,
        orderType: takeAwayAllowed ? 2 : 1,
      }));
    } else if (orderInfo.orderType === 2 && !takeAwayAllowed) {
      setOrderInfo((prev) => ({
        ...prev,
        orderType: isDeliveryAllowed ? 3 : 1,
      }));
    } else if (orderInfo.orderType === 1 && !dineInAllowed) {
      setOrderInfo((prev) => ({
        ...prev,
        orderType: isDeliveryAllowed ? 3 : 2,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeliveryAllowed, takeAwayAllowed, dineInAllowed]);

  return (
    <Tabs
      value={orderInfo.orderType?.toString()}
      className="w-full relative"
      onValueChange={onTabChange}
    >
      <TabsList className="w-full h-auto lg:h-14 items-center flex flex-row justify-center gap-2 p-1">
        {lovs?.ordertypes
          .filter((type) => (!config?.isDeliveryAllowed ? type.id !== 3 : true))
          .filter((type) => (!config?.takeAwayAllowed ? type.id !== 2 : true))
          .filter((type) => (!config?.dineInAllowed ? type.id !== 1 : true))
          .sort((a, b) => b.id - a.id)
          .map((type) => (
            <TabsTrigger
              key={type.id}
              value={type.id?.toString()}
              className="w-full lg:w-auto h-12 px-2 py-2 flex items-center justify-center gap-1"
            >
              <Image
                src={getImageSrc(type)}
                alt={type.name}
                width={38}
                height={38}
                className="object-cover brightness-50 hidden md:block"
              />
              <span className="text-sm md:text-base">{type.name}</span>
            </TabsTrigger>
          ))}
      </TabsList>
    </Tabs>
  );
};

export default CartTabs;
