import { OrderProduct } from "@/utils/types";
import { Card, CardContent } from "../ui/card";
import { useLOV } from "@/context/lov-context";
import {
  Mail,
  Phone,
  User,
  Truck,
  Users,
  ScrollText,
  MapPin,
  Table,
  MessageCircleMore,
  ChartColumnStacked,
} from "lucide-react";
import { Separator } from "../ui/separator";
import moment from "moment";

type OrderDetailProps = {
  order: OrderProduct & {
    bookingjson?: string;
  };
};

export type CustomerInfo = {
  name?: string;
  email?: string;
  contact?: string;
  whatsapp?: string;
  state?: string;
};

export type BookingInfo = {
  id: number;
  RestaurantTableId: number;
  guestname: string;
  SeatId: number;
  starttime: string;
  EndTime: string;
};

const OrderDetails: React.FC<OrderDetailProps> = ({ order }) => {
  const { lovs } = useLOV();
  // console.log({ order });
  const isDeliveryOption =
    order.deliveryOptionId !== 0 && order.saleTypeId === 3
      ? lovs?.deliveryoptions?.find((d) => d.id === order.deliveryOptionId)
          ?.name
      : null;

  const parseCustomerInfo: CustomerInfo | null = (() => {
    if (!order?.customerInfo || typeof order.customerInfo !== "string") {
      return null;
    }

    try {
      return JSON.parse(order.customerInfo) as CustomerInfo;
    } catch (error) {
      console.error("Error parsing customerInfo:", error);
      return null;
    }
  })();

  const parseBookingInfo: BookingInfo[] | null = (() => {
    if (!order?.bookingjson || typeof order.bookingjson !== "string") {
      return null;
    }

    try {
      return JSON.parse(order.bookingjson) as BookingInfo[];
    } catch (error) {
      console.error("Error parsing bookingjson:", error);
      return null;
    }
  })();

  const groupedBookings = parseBookingInfo?.reduce((acc, booking) => {
    const tableId = booking.RestaurantTableId;
    if (!acc[tableId]) {
      acc[tableId] = [];
    }
    acc[tableId].push(booking);
    return acc;
  }, {} as Record<number, BookingInfo[]>);

  // console.log(groupedBookings);

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
  }) => (
    <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
      <div className="flex items-center gap-2 shrink-0 min-w-[50px]">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground break-words max-w-full">
        {value}
      </span>
    </div>
  );

  return (
    <Card className="p-0 shadow-sm rounded-xl border">
      <CardContent className="p-2 space-y-2">
        <h2 className="text-xl font-bold">Order Details</h2>
        <Separator />

        <div className="space-y-4 text-sm">
          {isDeliveryOption && (
            <InfoItem
              icon={Truck}
              label="Delivery Option:"
              value={isDeliveryOption}
            />
          )}
          {order?.orderNote && (
            <InfoItem
              icon={ScrollText}
              label="Order Note:"
              value={order.orderNote}
            />
          )}
          {order?.deliveryNote && (
            <InfoItem
              icon={ScrollText}
              label="Delivery Note:"
              value={order.deliveryNote}
            />
          )}
          {order?.address && (
            <InfoItem
              icon={MapPin}
              label="Order Address:"
              value={order.address}
            />
          )}
          {order?.guestscount > 0 && (
            <InfoItem icon={Users} label="Guests:" value={order.guestscount} />
          )}
          {parseCustomerInfo?.name && (
            <InfoItem
              icon={User}
              label="Name:"
              value={parseCustomerInfo.name}
            />
          )}
          {parseCustomerInfo?.email && (
            <InfoItem
              icon={Mail}
              label="Email:"
              value={parseCustomerInfo.email}
            />
          )}
          {parseCustomerInfo?.contact && (
            <InfoItem
              icon={Phone}
              label="Contact:"
              value={parseCustomerInfo.contact}
            />
          )}
          {parseCustomerInfo?.whatsapp && (
            <InfoItem
              icon={MessageCircleMore}
              label="WhatsApp:"
              value={parseCustomerInfo.whatsapp}
            />
          )}
          {parseCustomerInfo?.state && (
            <InfoItem
              icon={ChartColumnStacked}
              label="State:"
              value={parseCustomerInfo.state}
            />
          )}
          {groupedBookings && Object.keys(groupedBookings).length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-primary" />
                <span className="font-semibold">Table Booking:</span>
              </div>
              <div className="flex flex-col gap-2 pl-6">
                {Object.entries(groupedBookings).map(([tableId, bookings]) => (
                  <div key={tableId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          Table {tableId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({bookings.length}{" "}
                          {bookings.length > 1 ? "seats" : "seat"})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col p-2 border rounded-md bg-muted/20">
                      <p className="text-sm font-medium">
                        Seats #{bookings?.map((b) => b.SeatId)?.join(", ")}
                      </p>
                      <p className="text-sm font-medium">
                        Guest : {bookings[0]?.guestname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {moment(bookings[0]?.starttime).format(
                          "hh:mm A, DD MMM YYYY"
                        )}{" "}
                        -{" "}
                        {moment(bookings[0]?.EndTime).format(
                          "hh:mm A, DD MMM YYYY"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetails;
