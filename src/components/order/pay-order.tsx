import { ORDER, OrderProduct } from "@/utils/types";
import { useState } from "react";
import { Button } from "../ui/button";
import PaymentOptions from "./payment-options";

type PayOrderProps = {
  order: ORDER;
  order_products: OrderProduct[];
};

const PayOrder: React.FC<PayOrderProps> = ({ order, order_products }) => {
  const [isPaymenyOptionsVisible, setIsPaymentOptionsVisible] = useState(false);

  const toggleIsPaymentOptionsVisible = () =>
    setIsPaymentOptionsVisible((prev) => !prev);

  return (
    <>
      <Button
        onClick={toggleIsPaymentOptionsVisible}
        variant="outline"
        size="sm"
        className="w-auto"
      >
        Pay Now
      </Button>
      <PaymentOptions
        isVisible={isPaymenyOptionsVisible}
        toggleDialog={toggleIsPaymentOptionsVisible}
        order={order}
        order_products={order_products}
      />
    </>
  );
};

export default PayOrder;
