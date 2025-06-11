import { useOrder } from "@/context/order-context";
import { HandCoins } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect } from "react";
import { useConfig } from "@/context/config-context";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { USER_ROLE } from "@/constants/constants";
import { getTaxAmount } from "@/utils/cartUtils";

const ServiceCharges = () => {
  const { config } = useConfig();
  const { totalPrice } = useCart();
  const { user } = useAuth();

  const { setOrderInfo, orderInfo } = useOrder();

  useEffect(() => {
    if (!config) return;
    setOrderInfo((prev) => ({
      ...prev,
      serviceCharges: parseFloat(
        getTaxAmount(totalPrice, config.serviceCharges ?? 0)
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, config]);

  if (user?.roleId === USER_ROLE.USER) return null;

  return (
    <Card className="px-2 py-2 w-full">
      <CardContent className="px-0 relative space-y-2">
        <div className="flex items-center gap-2">
          <HandCoins className="flex-shrink-0" />
          <Label>Service Charges</Label>
        </div>
        <Input
          placeholder="Service Charges"
          value={orderInfo.serviceCharges}
          onChange={(e) =>
            setOrderInfo((prev) => ({
              ...prev,
              serviceCharges:
                e.target.value === "" ? 0 : parseFloat(e.target.value),
            }))
          }
          maxLength={50}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceCharges;
