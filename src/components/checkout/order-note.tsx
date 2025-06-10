import { useConfig } from "@/context/config-context";
import { useOrder } from "@/context/order-context";
import { StickyNote } from "lucide-react";
import { CollapsibleCard } from "../ui/collapsible";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function OrderNote() {
  const { config } = useConfig();
  const { orderInfo, setOrderInfo } = useOrder();
  if (!config) return null;
  if (!config.enableOrderNotes) return null;
  return (
    <CollapsibleCard
      initialOpen={false}
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <StickyNote />
          <Label htmlFor="orderNote">Order Note</Label>
        </div>
      }
    >
      <Textarea
        id="orderNote"
        value={orderInfo.orderNote}
        onChange={(e) =>
          setOrderInfo((prev) => ({ ...prev, orderNote: e.target.value }))
        }
        placeholder="e.g Special instructions"
        maxLength={250}
      />
    </CollapsibleCard>
  );
}
