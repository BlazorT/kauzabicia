import { Label } from "@radix-ui/react-label";
import { CircleX, ClipboardList } from "lucide-react";
import { CollapsibleCard } from "../ui/collapsible";
import { useAlert } from "@/context/alert-context";
import { useCart } from "@/context/cart-context";
import { useOrder } from "@/context/order-context";
import { useRouter } from "next/navigation";

const ManagedOrder = ({ saleId }: { saleId: string }) => {
  const { replace } = useRouter();
  const { showAlert } = useAlert();
  const { clearCart } = useCart();
  const { resetOrderInfo } = useOrder();

  const onCancelOrderEditing = () => {
    showAlert({
      title: "Cancel",
      description: `Are you sure you want to cancel editing of order#${saleId}?`,
      cancelText: "Cacnel",
      confirmText: "Yes",
      onConfirm: () => {
        clearCart();
        resetOrderInfo();
        replace("/dashboard/menu");
      },
    });
  };
  return (
    <CollapsibleCard
      isCollapsible={false}
      header={
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <ClipboardList />
            <Label htmlFor="orderVoucher">Managing Order #{saleId}</Label>
          </div>
          <CircleX
            onClick={onCancelOrderEditing}
            className="text-destructive"
          />
        </div>
      }
    >
      <div className="hidden"></div>
    </CollapsibleCard>
  );
};

export default ManagedOrder;
