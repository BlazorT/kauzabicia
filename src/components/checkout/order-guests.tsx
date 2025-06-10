import { useOrder } from "@/context/order-context";
import { COLLAPSIBLE_REF, Table } from "@/utils/types";
import { Loader2, Users } from "lucide-react";
import { RefObject, useState } from "react";
import { CollapsibleCard } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import TableBooking from "./table-booking";
import { Button } from "../ui/button";
import { useCart } from "@/context/cart-context";
import { useGetTable } from "@/hooks/useMenu";

type OrderGuestsProps = {
  guestsCollapsibleRef: RefObject<COLLAPSIBLE_REF | null>;
};

export default function OrderGuests({
  guestsCollapsibleRef,
}: OrderGuestsProps) {
  const { orderInfo, setOrderInfo } = useOrder();
  const { items } = useCart();
  const { data, isPending } = useGetTable(items?.[0]?.storeId ?? 1);

  const tablesData = (data?.data ?? []) as Table[] | [];
  const [isOpen, setIsOpen] = useState(false);

  if (orderInfo.orderType !== 1) return null;

  return (
    <CollapsibleCard
      ref={guestsCollapsibleRef as RefObject<COLLAPSIBLE_REF>}
      isCollapsible={true}
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <Users />
          <Label htmlFor="numberOfGuests">
            {tablesData?.length === 0 ? "Number of Guests" : "Table Booking"}
          </Label>
          <span className="text-red-400 font-semibold text-xl leading-none">
            *
          </span>
        </div>
      }
    >
      {isPending ? (
        <Loader2 className="animate-spin h4-w-4" />
      ) : (
        <>
          {/* Show Input only when no seats are selected */}
          {tablesData.length === 0 || orderInfo.selectedSeats?.length === 0 ? (
            <Input
              id="numberOfGuests"
              value={orderInfo.guests}
              required={orderInfo.orderType === 1}
              onChange={(e) => {
                if (e.target.value.length > 2) {
                  return;
                }
                setOrderInfo((prev) => ({ ...prev, guests: e.target.value }));
              }}
              placeholder="Number of guests"
              type="number"
              className="mb-4"
            />
          ) : null}

          {/* Show table booking button if tables are available */}
          {tablesData.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsOpen(true)}
            >
              {orderInfo?.selectedSeats?.length > 0
                ? `${orderInfo?.selectedSeats?.length} seats booked`
                : "Select Table"}
            </Button>
          )}
        </>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          aria-describedby="table-booking"
          className="fixed top-[50%] left-[50%] z-50 grid w-[100vw] sm:max-w-none sm:w-[90vw] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200"
        >
          <DialogDescription className="hidden"></DialogDescription>
          <DialogHeader className="flex-none">
            <DialogTitle>Select Your Table</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <TableBooking onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </CollapsibleCard>
  );
}
