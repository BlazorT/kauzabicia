/* eslint-disable react-hooks/exhaustive-deps */
// src/components/checkout/order-payment.tsx
import { paymentGatewayDescriptions } from "@/constants/constants";
import { useCart } from "@/context/cart-context";
import { useConfig } from "@/context/config-context";
import { useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { usePaymentGateways } from "@/hooks/useOrder";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  filterActiveGateways,
  getLovsPaymentMethods,
  getPaymentMethods,
  isPaymentForced,
} from "@/utils/paymentUtils";
import { Loader2, Wallet } from "lucide-react";
import { useEffect, useMemo } from "react";
import { ErrorState } from "../store/store-status";
import { CollapsibleCard } from "../ui/collapsible";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { PaymentForcedMessage } from "./payment-forced-method";
import { PaymentMethodCard } from "./payment-method-card";
import { useAuth } from "@/context/auth-context";

export default function OrderPayment() {
  const { items } = useCart();
  const { lovs } = useLOV();
  const { config } = useConfig();
  const { user } = useAuth();

  const { orderInfo, setOrderInfo } = useOrder();
  const { data, isPending, isError, error } = usePaymentGateways(
    items[0]?.storeId
  );
  const { storeData } = useStoreInfo(items[0]?.storeId?.toString() ?? "");
  const paymentForced = useMemo(
    () => isPaymentForced(orderInfo, config, user),
    [config, orderInfo, user]
  );
  const paymentGatewaysData = useMemo(
    () => filterActiveGateways({ data: data?.data }),
    [data]
  );

  // console.log(data);

  const paymentMethods = useMemo(
    () => getPaymentMethods(lovs, paymentGatewaysData),
    [lovs, paymentGatewaysData, orderInfo.orderType]
  );

  useEffect(() => {
    if (paymentForced) {
      setOrderInfo((prev) => ({
        ...prev,
        paymentMethodId: 2,
      }));
    }
  }, [paymentForced]);

  // useEffect(() => {
  //   if (paymentForced && paymentGatewaysData[0]) {
  //     setOrderInfo((prev) => ({
  //       ...prev,
  //       paymentMethodId: paymentGatewaysData[0].id,
  //       paymentGateway: paymentGatewaysData[0],
  //       paymentGatewayId: paymentGatewaysData[0].id,
  //     }));
  //   }
  // }, [paymentForced, paymentGatewaysData, setOrderInfo]);

  if (isPending) return <LoaderState />;
  if (isError) return <ErrorState message={error?.message} />;
  // console.log(paymentMethods);
  return (
    <CollapsibleCard
      isCollapsible={false}
      initialOpen
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <Wallet />
          <Label>Payment</Label>
        </div>
      }
    >
      {paymentForced && (
        <PaymentForcedMessage
          storeName={storeData?.store?.name}
          orderType={orderInfo.orderType}
        />
      )}
      <RadioGroup
        onValueChange={(value) => {
          setOrderInfo((prev) => ({
            ...prev,
            paymentMethodId: parseInt(value),
          }));
        }}
        value={orderInfo.paymentMethodId?.toString()}
      >
        <div className="w-full flex items-center justify-center space-x-10">
          {getLovsPaymentMethods(lovs, orderInfo.orderType)?.map((pm) => {
            return (
              <div key={pm.id} className="flex space-x-2">
                <RadioGroupItem
                  id={pm.id?.toString()}
                  value={pm.id?.toString()}
                  checked={orderInfo.paymentMethodId === pm.id}
                  className="w-5 h-5 aspect-square rounded-full border-2 border-muted-foreground text-primary "
                  disabled={paymentForced && (pm.id === 1 || pm.id === 3)}
                />
                <Label
                  htmlFor={pm.id.toString()}
                  className="w-full aria-disabled:opacity-50"
                  aria-disabled={paymentForced && (pm.id === 1 || pm.id === 3)}
                >
                  {pm.name}
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {orderInfo.paymentMethodId === 2 && (
        <RadioGroup
          onValueChange={(value) => {
            const parsedValue = JSON.parse(value);
            console.log({ parsedValue });
            setOrderInfo((prev) => ({
              ...prev,
              paymentMethodId:
                parsedValue.id === 1 || parsedValue.id === 3
                  ? parsedValue.id
                  : 2,
              paymentGateway: parsedValue,
              paymentGatewayId: parsedValue.id,
            }));
          }}
          value={orderInfo.paymentGatewayId.toString()}
          className="w-full flex flex-wrap items-center gap-6 cursor-pointer"
        >
          <div className="w-full flex flex-col gap-4">
            {paymentMethods?.map((gateway) => {
              const key =
                (gateway.name?.toLowerCase() as keyof typeof paymentGatewayDescriptions) ??
                (gateway.id.toString() as keyof typeof paymentGatewayDescriptions);
              const description =
                paymentGatewayDescriptions[
                  orderInfo.jazzCashMode === "card" ? "default" : key
                ] ?? null;

              return (
                <PaymentMethodCard
                  key={gateway.id}
                  gateway={gateway}
                  isForced={paymentForced}
                  isSelected={orderInfo.paymentGatewayId === gateway.id}
                  description={description}
                />
              );
            })}
          </div>
        </RadioGroup>
      )}
    </CollapsibleCard>
  );
}

const LoaderState = () => (
  <div className="flex items-center justify-center min-h-48 gap-4">
    <Loader2 className="animate-spin" />
    <p>Loading payment gateways...</p>
  </div>
);
