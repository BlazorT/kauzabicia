import { USER_ROLE } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { useCancelTableBooking, useGetTable } from "@/hooks/useMenu";
import { cn, formatBookingTime, isBookingPassed } from "@/lib/utils";
import { getMaxKitchenTime } from "@/utils/cartUtils";
import { QUERY_KEYS } from "@/utils/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Users } from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "../store/store-status";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Spinner from "../ui/spinner";

// Types for table status
export type TableStatus =
  | "available"
  | "reserved"
  | "out-of-service"
  | "booked";
export type SeatStatus =
  | "available"
  | "selected"
  | "reserved"
  | "out-of-service"
  | "booked";

interface TableBookingProps {
  onClose: () => void;
}

// Interface for table data
interface Table {
  id: number;
  size: number;
  status: TableStatus;
  seats: SeatStatus[];
  seatBookingTime: Record<
    number,
    Array<{
      startTime: Date | string | null;
      endTime: Date | string | null;
      status: TableStatus;
      guestName: string;
      seatId: number;
    }>
  >;
  reservationTime?: string;
  name?: string;
}

// Define an interface for the booking type
interface Booking {
  seatId: number; // Adjust the type if necessary
  resStatusId: number;
  guestName: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
}

// Dummy data for tables

// Status colors - Added hex values for SVG fill
const statusColors = {
  available: { bg: "bg-green-500", fill: "#22c55e" }, // Brighter green
  reserved: { bg: "bg-yellow-500", fill: "#eab308" }, // Brighter yellow
  "out-of-service": { bg: "bg-red-500", fill: "#f43f5e" }, // Brighter red
  selected: { bg: "bg-blue-500", fill: "#0ea5e9" }, // Brighter blue
  booked: { bg: "bg-purple-500", fill: "#a855f7" }, // Brighter purple
};

// Chair SVG Component
const ChairIcon = ({ fill = "#000000" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    x="0px"
    y="0px"
    viewBox="0 0 100 125"
    style={{}}
    xmlSpace="preserve"
  >
    <path
      d="M87.7,12.5c-0.8-3.7-4.1-6.6-8.2-6.6H36.9c-4,0-7.4,2.8-8.2,6.5h-17C8,12.5,5,15.4,5,19.1v61.7c0,3.7,3,6.6,6.7,6.6h16.9  c0.7,3.9,4.1,6.8,8.2,6.8h42.7c3.8,0,7-2.5,8-5.8c4.2-0.4,7.5-3.9,7.5-8.2V20.6C95,16.5,91.8,13,87.7,12.5z M36.9,8.8h42.7  c2.5,0,4.5,1.6,5.2,3.8c-3.3,0.8-5.8,3.5-6.3,6.8H36.9c-3,0-5.4-2.4-5.4-5.3S33.9,8.8,36.9,8.8z M28.7,84.5h-17  c-2.1,0-3.8-1.7-3.8-3.7V19.1c0-2.1,1.7-3.7,3.8-3.7h16.9c0.6,4,4.1,7,8.2,7h41.4v55.5H36.9C32.8,77.8,29.4,80.7,28.7,84.5z   M79.5,91.4H36.9c-3,0-5.4-2.4-5.4-5.3s2.4-5.3,5.4-5.3h41.5c0.2,3.6,2.8,6.5,6.2,7.4C83.7,90,81.8,91.4,79.5,91.4z M92.1,80.2  c0,2.9-2.4,5.3-5.4,5.3s-5.4-2.4-5.4-5.3V20.6c0-2.9,2.4-5.3,5.4-5.3s5.4,2.4,5.4,5.3V80.2z"
      fill={fill}
    />
  </svg>
);

export default function TableBooking({ onClose }: TableBookingProps) {
  const { orderInfo, setOrderInfo } = useOrder();

  const { items } = useCart();
  const { lovs } = useLOV();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { mutate, isPending: cancelPendind } = useCancelTableBooking();

  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment()); // update every 60s
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const reservationstatuses = lovs?.reservationstatuses;
  // console.log(JSON.stringify(reservationstatuses));
  const {
    data,
    isPending: tablesPending,
    isError,
    error,
  } = useGetTable(items?.[0]?.storeId ?? 1);

  const isPending = cancelPendind || tablesPending;

  const mapStatus = (statusId: number): TableStatus => {
    const lovItem = reservationstatuses?.find((item) => item.id === statusId);

    switch (lovItem?.code?.toLowerCase()) {
      case "available":
        return "available";
      case "reserved":
        return "reserved";
      case "booked":
        return "booked";
      case "out of service":
        return "out-of-service";
      case "cancelled":
        return "available"; // Treat cancelled as available
      default:
        return "available"; // fallback
    }
  };

  const tablesData: Table[] = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];

    const orderStart = currentTime.clone();
    const kitchenTime = getMaxKitchenTime(items);
    const orderEnd = orderStart
      .clone()
      .add(kitchenTime < 30 ? 30 : kitchenTime, "minutes");

    return data.data
      .filter((tableItem) => tableItem.status !== 2)
      .map((tableItem) => {
        const totalSeats = Number(tableItem.seats);

        // Build bookingStatusMap by seatId
        const bookingStatusMap: Record<number, Booking[]> = {};
        (tableItem.tableBookings ?? []).forEach((booking: Booking) => {
          if (!bookingStatusMap[booking.seatId]) {
            bookingStatusMap[booking.seatId] = [];
          }
          bookingStatusMap[booking.seatId].push(booking);
        });

        const seatStatuses: SeatStatus[] = Array.from(
          { length: totalSeats },
          (_, i) => {
            const seatNumber = i + 1;
            const bookings = bookingStatusMap[seatNumber] || [];

            let resStatusId = 1; // default: available

            for (const booking of bookings) {
              const {
                startTime,
                endTime,
                resStatusId: originalStatusId,
              } = booking;
              if (startTime && endTime) {
                const bookingStart = moment(startTime);
                const bookingEnd = moment(endTime);

                const isOverlap =
                  orderStart.isBetween(
                    bookingStart,
                    bookingEnd,
                    undefined,
                    "[)"
                  ) ||
                  orderEnd.isBetween(
                    bookingStart,
                    bookingEnd,
                    undefined,
                    "(]"
                  ) ||
                  bookingStart.isBetween(
                    orderStart,
                    orderEnd,
                    undefined,
                    "[)"
                  ) ||
                  bookingEnd.isBetween(orderStart, orderEnd, undefined, "(]");

                if (isOverlap) {
                  resStatusId = originalStatusId;
                  break;
                }
              }
            }

            return mapStatus(resStatusId) as SeatStatus;
          }
        );

        const seatBookingTime: Record<
          number,
          Array<{
            startTime: Date | string | null;
            endTime: Date | string | null;
            status: TableStatus;
            guestName: string;
            seatId: number;
          }>
        > = {};

        Object.entries(bookingStatusMap).forEach(([seatId, bookings]) => {
          const seatNumber = Number(seatId);

          seatBookingTime[seatNumber] = (bookings || [])
            .filter((b) => b?.startTime && b?.endTime)
            .sort(
              (a, b) =>
                moment(b.startTime).valueOf() - moment(a.startTime).valueOf()
            )
            .map((b) => ({
              ...b,
              startTime: b.startTime,
              endTime: b.endTime,
              status: mapStatus(b.resStatusId),
              guestName: b.guestName,
            }));
        });

        return {
          id: tableItem.id,
          size: totalSeats,
          status: (seatStatuses?.[0] ?? "available") as TableStatus,
          seats: seatStatuses,
          seatBookingTime,
          name: tableItem?.name,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, reservationstatuses, currentTime]);

  // console.log({ tablesData, data });

  if (isError) {
    return <ErrorState message={error.message} />;
  }
  if (isPending) {
    return <Spinner />;
  }
  if (tablesData?.length === 0) {
    return <ErrorState message={"No tables available for bookings"} />;
  }

  // Calculate total available seats
  const totalAvailableSeats = tablesData.reduce((count, table) => {
    if (table.status === "available") {
      return count + table.seats.length; // Count all seats in available tables
    } else {
      return count;
    }
  }, 0);

  // Calculate total reserved seats
  const totalReservedSeats = tablesData.reduce((count, table) => {
    return count + table.seats.filter((seat) => seat === "reserved").length;
  }, 0);

  // Calculate total out of service seats
  const totalOutOfServiceSeats = tablesData.reduce((count, table) => {
    return (
      count + table.seats.filter((seat) => seat === "out-of-service").length
    );
  }, 0);

  // Calculate total booked seats
  const totalBookedSeats = tablesData.reduce((count, table) => {
    return count + table.seats.filter((seat) => seat === "booked").length;
  }, 0);

  const handleSeatClick = (tableId: number, seatIndex: number) => {
    const table = tablesData.find((t) => t.id === tableId);
    if (!table || table.seats[seatIndex] !== "available") return;

    setOrderInfo((prev) => {
      const seatKey = { tableId, seatIndex };
      const currentSeats = prev.selectedSeats || [];
      const exists = currentSeats.some(
        (seat) => seat.tableId === tableId && seat.seatIndex === seatIndex
      );

      const newSelectedSeats = exists
        ? currentSeats.filter(
            (seat) =>
              !(seat.tableId === tableId && seat.seatIndex === seatIndex)
          )
        : [...currentSeats, seatKey];

      return {
        ...prev,
        selectedTable: table,
        selectedSeats: newSelectedSeats,
        guests: newSelectedSeats.length.toString(),
      };
    });
  };

  const handleBooking = () => {
    onClose();
  };

  function distributeChairs(total: number) {
    // Calculate base distribution with more seats on top and bottom
    const base = Math.floor(total / 8); // Divide by 8 to get smaller base
    const remainder = total % 8;

    // Distribute base to all sides, with top and bottom getting triple
    const dist = {
      top: base * 3, // Triple the base for top
      bottom: base * 3, // Triple the base for bottom
      left: base, // Single base for left
      right: base, // Single base for right
    };

    // Distribute remainder smartly
    if (remainder === 1) {
      dist.top += 1;
    } else if (remainder === 2) {
      dist.top += 1;
      dist.bottom += 1;
    } else if (remainder === 3) {
      dist.top += 2;
      dist.bottom += 1;
    } else if (remainder === 4) {
      dist.top += 2;
      dist.bottom += 2;
    } else if (remainder === 5) {
      dist.top += 3;
      dist.bottom += 2;
    } else if (remainder === 6) {
      dist.top += 3;
      dist.bottom += 3;
    } else if (remainder === 7) {
      dist.top += 3;
      dist.bottom += 3;
      dist.left += 1;
    }

    return dist;
  }

  const handleDeleteBooking = (book: {
    startTime: Date | string | null;
    endTime: Date | string | null;
    status: TableStatus;
    guestName: string;
    seatId: number;
  }) => {
    showAlert({
      title: "Confirmation",
      description: `Are you sure you want to cancel booking of Chair #${
        book?.seatId
      }\nFrom ${moment(book?.startTime)?.format(
        "DD MMM YYYY, hh:mm:ss A"
      )} To ${moment(book?.endTime)?.format("DD MMM YYYY, hh:mm:ss A")}?`,
      confirmText: "Ok",
      cancelText: "Cancel",
      onConfirm: () => {
        const body = {
          ...book,
          status: 5,
        };
        console.log({ body });
        mutate(body, {
          onSuccess: (res) => {
            console.log(res);
            if (res?.status === true) {
              //success
              toast.success(
                `${book?.seatId} booking has been canceled successfully`
              );
              queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.TABLES, items?.[0]?.storeId],
              });
            } else {
              toast.error(
                `${
                  res?.message ?? "Something went wrong please try again later!"
                }`
              );
            }
          },
        });
      },
    });
  };

  const renderTable = (table: Table) => {
    const statusBorderColor = statusColors[table.status].bg.replace(
      "bg-",
      "border-l-"
    ); // Get border color from status color

    // Determine dimensions of the table container - Keep height consistent, increase width with seats

    const baseWidth = 80; // minimum width in pixels
    const widthPerSeat = 20; // additional pixels per seat
    const calculatedWidth = baseWidth + table.size * widthPerSeat * 1.2;

    const isTableSelect = orderInfo?.selectedSeats.some(
      (seat) => seat.tableId === table.id
    );

    return (
      <div
        key={table.id}
        style={{
          width: `${calculatedWidth}px`,
          height: "120px",
          borderLeftWidth: "3px",
          borderLeftColor:
            statusColors[isTableSelect ? "selected" : table.status].fill,
        }}
        className={cn(
          "relative flex flex-col items-center p-2 rounded-md group transition-all",
          "bg-input/20",
          "border-y-[0.1rem] border-x-[0.1rem] border-muted-foreground",
          statusBorderColor,
          table.status === "available" && "cursor-pointer",
          orderInfo.selectedTable?.id === table.id && "p-4"
        )}
      >
        {/* Book Whole Table Button */}
        {table.seats.every((seat) => seat === "available") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const allSeats = table.seats.reduce<
                { tableId: number; seatIndex: number }[]
              >((acc, status, index) => {
                if (status === "available") {
                  acc.push({ tableId: table.id, seatIndex: index });
                }
                return acc;
              }, []);

              // Ensure that you are only checking against available seats
              const uniqueAvailableSeats = allSeats.filter(
                (seat) => seat !== null
              );

              setOrderInfo((prev) => {
                const currentSeats = prev.selectedSeats || [];
                const isTableSelected = currentSeats.some(
                  (seat) => seat.tableId === table.id
                );

                if (isTableSelected) {
                  // Remove all seats from this table
                  return {
                    ...prev,
                    selectedTable: null,
                    selectedSeats: currentSeats.filter(
                      (seat) => seat.tableId !== table.id
                    ),
                    guests: (
                      currentSeats.length - uniqueAvailableSeats.length
                    ).toString(),
                  };
                } else {
                  // Add all seats from this table
                  return {
                    ...prev,
                    selectedTable: table,
                    selectedSeats: [...currentSeats, ...uniqueAvailableSeats],
                    guests: (
                      currentSeats.length + uniqueAvailableSeats.length
                    ).toString(),
                  };
                }
              });
            }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 text-xs rounded-sm transition-colors z-10",
              (orderInfo.selectedSeats || []).some(
                (seat) => seat.tableId === table.id
              )
                ? "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
            )}
          >
            {(orderInfo.selectedSeats || []).some(
              (seat) => seat.tableId === table.id
            )
              ? "Unselect All"
              : "Table Book"}
          </button>
        )}

        {/* Table Info (Number and Icon) positioned at bottom left */}
        <div
          className={cn(
            "absolute bottom-5 left-5 z-10 text-xs text-muted-foreground font-medium flex items-center gap-1",
            table?.seats?.length > 6 ? "bottom-5 left-5" : "bottom-5 left-2"
          )}
        >
          {" "}
          {/* Positioned at bottom left with small text and subtle color */}
          <Users className="w-3 h-3 shrink-0" /> {/* Moved User Icon here */}
          <span className="text-[0.6rem] font-semibold">
            T-{table?.name} | Chairs : {table?.seats?.length}
          </span>
        </div>

        {/* Table Info (Status) positioned on the table shape - Removed Number and Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 text-sm text-gray-800">
          {" "}
          {/* Keep this div for potential future info */}
          {/* Removed User Icon and Table Number from here */}
          {/* You can add other status-related info here if needed */}
        </div>

        {/* Chairs positioned relative to the table container, visually half under the table shape */}
        {(() => {
          const total = table.size;
          const seatDist = distributeChairs(total);

          const sides: ("top" | "right" | "bottom" | "left")[] = [
            "top",
            "right",
            "bottom",
            "left",
          ];
          const seatMap: {
            side: string;
            seatIndex: number;
            offsetIndex: number;
          }[] = [];

          let seatIndex = 0;
          for (const side of sides) {
            const count = seatDist[side];
            for (let j = 0; j < count; j++) {
              const reverse = side === "bottom" || side === "left";
              const offsetIndex = reverse ? count - 1 - j : j;

              seatMap.push({ side, seatIndex, offsetIndex });
              seatIndex++;
            }
          }

          return seatMap.map(({ side, seatIndex, offsetIndex }) => {
            const countOnSide = seatDist[side as keyof typeof seatDist];
            const spacing = 80 / Math.max(1, countOnSide); // leave 10% padding on both ends
            const offset = 10 + spacing * offsetIndex + spacing / 2;

            let style = {};
            let rotation = "";

            switch (side) {
              case "top":
                style = {
                  top: "-12px",
                  left: `${offset}%`,
                  transform: "translateX(-50%)",
                };
                rotation = "rotate-270";
                break;
              case "right":
                style = {
                  right: "-12px",
                  top: `${offset}%`,
                  transform: "translateY(-50%)",
                };
                rotation = "rotate-0";
                break;
              case "bottom":
                style = {
                  bottom: "-12px",
                  left: `${offset}%`,
                  transform: "translateX(-50%)",
                };
                rotation = "rotate-90";
                break;
              case "left":
                style = {
                  left: "-12px",
                  top: `${offset}%`,
                  transform: "translateY(-50%)",
                };
                rotation = "rotate-180";
                break;
            }

            const seatStatus = table.seats[seatIndex];
            // const guestName = table.seatGuestNames[seatIndex];
            const bookingTime = table.seatBookingTime[seatIndex + 1];
            const isSeatSelected = (orderInfo.selectedSeats || []).some(
              (seat) =>
                seat.tableId === table.id && seat.seatIndex === seatIndex
            );
            const chairColorStatus =
              table.seats[seatIndex] === "available"
                ? isSeatSelected
                  ? "selected"
                  : seatStatus
                : seatStatus;

            const chairFillColor =
              statusColors[chairColorStatus]?.fill || "#000000";

            const kitchenTime = getMaxKitchenTime(items);
            const orderStart = moment();

            const orderEnd = moment(orderStart).add(
              kitchenTime < 30 ? 30 : kitchenTime,
              "minutes"
            );

            // const guestName = table.seats;

            return (
              <div
                key={seatIndex}
                className={cn(
                  "absolute cursor-pointer flex items-center justify-center w-7 h-7",
                  table.seats[seatIndex] !== "available" && "opacity-80",
                  "bg-background/100"
                )}
                style={style}
                onClick={() =>
                  // table.status === "available" &&
                  table.seats[seatIndex] === "available" &&
                  handleSeatClick(table.id, seatIndex)
                }
              >
                {bookingTime && seatStatus !== "available" ? (
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <div className={cn("w-full h-full", rotation)}>
                        <ChairIcon fill={chairFillColor} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-sm text-xs text-left space-y-1 pointer-events-auto z-50">
                      <p className="text-sm text-center font-bold">
                        Chair Booking
                      </p>
                      <p className="text-center text-xs font-semibold">
                        {formatBookingTime(orderStart)} -{" "}
                        {formatBookingTime(orderEnd)}
                      </p>

                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {bookingTime?.map((book, index) => (
                          <div
                            key={index}
                            className={cn(
                              "p-2 bg-gray-100 rounded-md shadow-sm dark:bg-slate-700 space-y-1",
                              `${
                                isBookingPassed(book.endTime)
                                  ? "bg-destructive/30 dark:bg-destructive/30"
                                  : ""
                              }`
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  {book?.status?.toUpperCase()} by{" "}
                                  {book?.guestName}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-xs">
                                  {formatBookingTime(book?.startTime)} ~{" "}
                                  {formatBookingTime(book?.endTime)}
                                </p>
                              </div>
                              {(user?.roleId === USER_ROLE.ADMIN ||
                                user?.roleId === USER_ROLE.SUPERADMIN) && (
                                <Trash2
                                  size={16}
                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBooking(book);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className={cn("w-full h-full", rotation)}>
                    <ChairIcon fill={chairFillColor} />
                  </div>
                )}

                <span className="absolute text-[0.6rem]">{seatIndex + 1}</span>
              </div>
            );
          });
        })()}
      </div>
    );
  };
  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Header - Now contains only the legend */}
      {/* <OrderCustomer /> */}
      <div className="flex-none mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>
              Available
              {totalAvailableSeats > 0 && ` (${totalAvailableSeats})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>
              Reserved
              {totalReservedSeats > 0 && ` (${totalReservedSeats})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>
              Booked
              {totalBookedSeats > 0 && ` (${totalBookedSeats})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>
              Out of Service
              {totalOutOfServiceSeats > 0 && ` (${totalOutOfServiceSeats})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>
              Selected
              {(orderInfo.selectedSeats || []).length > 0 &&
                ` (${(orderInfo.selectedSeats || []).length})`}
            </span>
          </div>
        </div>
      </div>

      {/* Tables Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="max-h-[60dvh] gap-12 flex flex-wrap justify-center items-center">
          {tablesData.map(renderTable)}
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-none flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setOrderInfo((prev) => ({
              ...prev,
              selectedTable: null,
              selectedSeats: [],
              guests: "",
            }));
          }}
          disabled={(orderInfo.selectedSeats || []).length === 0}
        >
          Clear Selection
        </Button>
        <Button
          disabled={(orderInfo.selectedSeats || []).length === 0}
          onClick={handleBooking}
        >
          Book {(orderInfo.selectedSeats || []).length} Seat
          {(orderInfo.selectedSeats || []).length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
