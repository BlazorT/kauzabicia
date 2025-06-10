import { LOV, useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { Truck } from "lucide-react";
import { CollapsibleCard } from "../ui/collapsible";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

export default function DeliveryOptions() {
  const { lovs } = useLOV();
  const { orderInfo, setOrderInfo } = useOrder();

  if (orderInfo.orderType !== 3) return null;

  if (!lovs?.deliveryoptions || lovs?.deliveryoptions?.length === 0)
    return null;
  return (
    <CollapsibleCard
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <Truck />
          <Label>Delivery Options</Label>
        </div>
      }
    >
      <RadioGroup
        onValueChange={(value) =>
          setOrderInfo((prev) => ({
            ...prev,
            deliveryOption: parseInt(value, 10),
          }))
        }
        value={orderInfo.deliveryOption.toString()}
        className="w-full flex items-center justify-center flex-wrap gap-6 cursor-pointer"
      >
        {lovs?.deliveryoptions?.map((item: LOV) => (
          <div key={item.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={item.id.toString()}
              id={item.id.toString()}
              //   className="juc"
            />
            <Label htmlFor={item.id.toString()}>
              <p className="text-sm font-bold">{item.name}</p>
            </Label>
          </div>
        ))}
      </RadioGroup>
      {orderInfo.deliveryOption === 2 && (
        <Textarea
          value={orderInfo.deliveryNote}
          onChange={(e) =>
            setOrderInfo((prev) => ({ ...prev, deliveryNote: e.target.value }))
          }
          placeholder="Delivery instructions e.g. Apartment name, floor number, etc."
          maxLength={255}
          className="resize-none"
        />
      )}
    </CollapsibleCard>
  );
}
