// src/context/order-context.tsx
"use client";
import { PAYMENT_GATEWAY } from "@/utils/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { LOV } from "./lov-context";
import { SeatStatus, TableStatus } from "@/components/checkout/table-booking";
type Coordinate = [number, number];

// Add Table and SeatStatus types

interface Table {
  id: number;
  size: number;
  status: TableStatus;
  seats: SeatStatus[];
  reservationTime?: string;
}

export interface OrderInfo {
  orderType: number;
  deliveryCharges: number;
  address: string;
  deliveryDistance: number;
  orderNote: string;
  guests: string;
  email: string;
  phone: string;
  name: string;
  deliveryOption: number;
  voucherDiscount: number;
  paidAmount: number;
  voucherCode: string;
  isRedeemPoints: boolean;
  pointsRedeemed: number;
  pointsDiscount: number;
  tipAmount: number;
  paymentMethodId: number;
  paymentGateway: PAYMENT_GATEWAY | LOV | null;
  paymentGatewayId: number;
  jazzCashNumber: string;
  jazzCashCNIC: string;
  jazzCashMode: string;
  deliveryNote: string;
  jazzCashTxnRef: string;
  jazzCashResponse: { [key: string]: unknown } | null;
  decodeGeometry: Coordinate[];
  selectedTable: Table | null;
  selectedSeats: { tableId: number; seatIndex: number }[];
}

interface OrderContextType {
  orderInfo: OrderInfo;
  setOrderInfo: React.Dispatch<React.SetStateAction<OrderInfo>>;
  resetOrderInfo: () => void;
}

const OrderContext = createContext<OrderContextType>({
  orderInfo: {
    orderType: 3,
    deliveryCharges: 0,
    address: "",
    deliveryDistance: 0,
    orderNote: "",
    guests: "",
    email: "",
    phone: "",
    name: "",
    deliveryOption: 1,
    voucherDiscount: 0,
    paidAmount: 0,
    voucherCode: "",
    isRedeemPoints: false,
    pointsRedeemed: 0,
    pointsDiscount: 0,
    tipAmount: 0,
    paymentMethodId: 1,
    paymentGateway: null,
    paymentGatewayId: 0,
    jazzCashNumber: "",
    jazzCashCNIC: "",
    jazzCashMode: "",
    deliveryNote: "",
    jazzCashTxnRef: "",
    jazzCashResponse: null,
    decodeGeometry: [],
    selectedTable: null,
    selectedSeats: [],
  },
  setOrderInfo: () => {},
  resetOrderInfo: () => {},
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const orderDetailDefault = {
    orderType: 1,
    deliveryCharges: 0,
    address: "",
    deliveryDistance: 0,
    orderNote: "",
    guests: "",
    email: "",
    phone: "",
    name: "",
    deliveryOption: 1,
    voucherDiscount: 0,
    paidAmount: 0,
    voucherCode: "",
    isRedeemPoints: false,
    pointsRedeemed: 0,
    pointsDiscount: 0,
    tipAmount: 0,
    paymentMethodId: 1,
    paymentGateway: null,
    paymentGatewayId: 0,
    jazzCashNumber: "",
    jazzCashCNIC: "",
    jazzCashMode: "",
    deliveryNote: "",
    jazzCashTxnRef: "",
    jazzCashResponse: null,
    decodeGeometry: [],
    selectedTable: null,
    selectedSeats: [],
  };

  const [orderInfo, setOrderInfo] = useState<OrderInfo>(() => {
    if (typeof window !== "undefined") {
      const storedOrderInfo = localStorage.getItem("orderInfo");
      return storedOrderInfo ? JSON.parse(storedOrderInfo) : orderDetailDefault;
    }
    return orderDetailDefault;
  });

  const resetOrderInfo = () => {
    setOrderInfo(orderDetailDefault);
  };

  useEffect(() => {
    if (orderInfo) {
      localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
    }
  }, [orderInfo]);

  return (
    <OrderContext.Provider value={{ orderInfo, setOrderInfo, resetOrderInfo }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
