import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

// src/components/checkout/PaymentForcedMessage.tsx
interface PaymentForcedMessageProps {
  storeName?: string;
  orderType: number;
}

export const PaymentForcedMessage = ({
  storeName,
  orderType,
}: PaymentForcedMessageProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const messages = {
    1: `${storeName} entertains paid orders only for dine-in.`,
    2: `${storeName} entertains paid orders only for take-away.`,
    3: `${storeName} entertains paid orders only for delivery`,
  };

  return (
    <p className="text-sm text-primary font-medium">
      {!user ? (
        <span>
          To proceed with your order, an advance payment is needed. However,
          signing in allows you to place your order without an advance payment.{" "}
          <span
            className="text-foreground underline cursor-pointer"
            onClick={() => {
              router.push("/auth/signin");
            }}
          >
            Sign In
          </span>
        </span>
      ) : (
        messages[orderType as keyof typeof messages]
      )}
    </p>
  );
};
