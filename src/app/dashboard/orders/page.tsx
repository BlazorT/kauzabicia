"use client";

import OrderItem from "@/components/order/order-item";
import { ErrorState } from "@/components/store/store-status";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import { useFetchOrders } from "@/hooks/useOrder";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Orders: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data: ordersRes,
    isPending,
    isError,
    error,
  } = useFetchOrders((user?.id ?? 0).toString());
  // console.log({ ordersRes });
  const filteredOrders = useMemo(() => {
    if (!ordersRes?.data) return [];
    const allOrders = ordersRes?.data ?? [];

    return allOrders
      .filter((order) => ![2, 6, 4].includes(order.status))
      .sort(
        (a, b) =>
          new Date(b.createdat).getTime() - new Date(a.createdat).getTime()
      );
  }, [ordersRes]);
  const activeOrders = useMemo(() => {
    return filteredOrders.filter((order) => [1, 3, 7].includes(order.status));
  }, [filteredOrders]);

  const pastOrders = useMemo(() => {
    return filteredOrders.filter((order) => order.status === 5);
  }, [filteredOrders]);

  if (isError) return <ErrorState message={error.message} />;
  if (isPending) return <Spinner />;

  if (filteredOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] w-full">
        <div className="p-6 text-center flex flex-col items-center text-base text-muted-foreground border border-dashed rounded-xl space-y-4 shadow-md">
          <SearchX size={80} className="text-red-400" />
          <p className="text-2xl font-semibold">No Orders Yet</p>
          <p className="text-lg text-gray-500 max-w-sm">
            You don’t have any orders at the moment. Start placing your first
            order now!
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              router.replace("/");
            }}
          >
            Place an Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2">
      {activeOrders?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderItem
                key={order.saleid}
                order={order}
                isActiveOrder={true}
              />
            ))}
          </div>
        </section>
      )}

      {pastOrders?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold  mb-4">Orders (Past)</h2>
          <div className="space-y-4">
            {pastOrders.map((order, index) => (
              <OrderItem key={index} order={order} isActiveOrder={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Orders;
