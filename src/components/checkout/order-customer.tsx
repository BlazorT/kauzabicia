import { useAuth } from "@/context/auth-context";
import { useOrder } from "@/context/order-context";
import { validateEmail } from "@/utils/formUtils";
import { COLLAPSIBLE_REF } from "@/utils/types";
import { User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { RefObject, useEffect, useState } from "react";
import { CollapsibleCard } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type OrderCustomerProps = {
  customerCollapsibleRef?: RefObject<COLLAPSIBLE_REF | null>;
};

export default function OrderCustomer({
  customerCollapsibleRef,
}: OrderCustomerProps) {
  const { orderInfo, setOrderInfo } = useOrder();
  const { user } = useAuth();
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const searchParams = useSearchParams();

  const saleId = searchParams.get("saleId");

  const isValidOrderEdit = saleId;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setOrderInfo((prev) => ({ ...prev, email }));
    setIsEmailValid(validateEmail(email) || email === "");
  };

  useEffect(() => {
    if (!user || isValidOrderEdit) return;
    setOrderInfo((prev) => ({
      ...prev,
      name: user?.firstName + user?.lastName,
      phone: user?.primaryContact ?? "",
      email: user?.email,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isValidOrderEdit]);

  return (
    <CollapsibleCard
      isCollapsible={false}
      ref={customerCollapsibleRef as RefObject<COLLAPSIBLE_REF>}
      showHelperText={false}
      initialOpen
      header={
        <div className="flex items-center gap-2">
          <User />
          <Label>Customer Information</Label>
        </div>
      }
    >
      <Input
        placeholder="Full Name"
        value={orderInfo.name}
        onChange={(e) =>
          setOrderInfo((prev) => ({ ...prev, name: e.target.value }))
        }
        maxLength={50}
      />
      <div className="flex gap-2">
        <Input
          id="phone"
          placeholder="Phone Number"
          value={orderInfo.phone}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 13) {
              setOrderInfo((prev) => ({ ...prev, phone: value }));
            }
          }}
          type="tel" // more appropriate for phone numbers
          inputMode="numeric" // improves UX on mobile
          pattern="[0-9]*" // allows only digits
          maxLength={13} // HTML-level safeguard
          className={`flex-1/2 ${"placeholder:text-red-400"} `}
        />

        <div className="flex flex-1/2 flex-col gap-2">
          <Input
            id="email"
            placeholder="Email"
            value={orderInfo.email}
            onChange={handleEmailChange}
            maxLength={50}
            type="email"
            className={!isEmailValid ? "border-red-500" : ""}
          />
          {!isEmailValid && (
            <p className="text-sm text-red-500">
              Please enter a valid email address.
            </p>
          )}
        </div>
        {!isEmailValid && (
          <p className="text-sm text-red-500">
            Please enter a valid email address.
          </p>
        )}
      </div>
      <Input
        id="whatsApp"
        placeholder="Whatsapp"
        value={orderInfo.whatsApp}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 13) {
            setOrderInfo((prev) => ({ ...prev, whatsApp: value }));
          }
        }}
        type="tel" // more appropriate for phone numbers
        inputMode="numeric" // improves UX on mobile
        pattern="[0-9]*" // allows only digits
        maxLength={13} // HTML-level safeguard
      />
    </CollapsibleCard>
  );
}
