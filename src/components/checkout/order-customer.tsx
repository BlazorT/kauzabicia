import { useAuth } from "@/context/auth-context";
import { useOrder } from "@/context/order-context";
import { validateEmail } from "@/utils/formUtils";
import { COLLAPSIBLE_REF } from "@/utils/types";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { RefObject, useEffect, useState } from "react";
import { CollapsibleCard } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useLOV } from "@/context/lov-context";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";

type OrderCustomerProps = {
  customerCollapsibleRef?: RefObject<COLLAPSIBLE_REF | null>;
};

export default function OrderCustomer({
  customerCollapsibleRef,
}: OrderCustomerProps) {
  const { orderInfo, setOrderInfo } = useOrder();
  const { user } = useAuth();
  const { lovs } = useLOV();

  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [isWhatsapp, setIsWhatsapp] = useState<boolean>(false);
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
      <div className="flex flex-row gap-2">
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
          className="flex-1/2 sm:flex-3/4"
        />
        <div className="flex-1/2 sm:flex-1/5 flex items-center gap-2">
          <Checkbox
            id={"whatsapp"}
            checked={isWhatsapp}
            onCheckedChange={(checked: boolean) => {
              setIsWhatsapp(checked);
              setOrderInfo((prev) => ({
                ...prev,
                whatsApp: checked ? orderInfo?.phone : "",
              }));
            }}
          />
          <Label htmlFor={"whatsapp"} className="text-xs font-normal">
            same as contact
          </Label>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "justify-between w-full",
              !orderInfo.stateId && "text-muted-foreground"
            )}
          >
            <span>
              {orderInfo.stateId
                ? lovs?.states?.find((state) => state.id === orderInfo.stateId)
                    ?.name
                : "Select State"}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search states..." className="h-9" />
            <CommandList className="w-full">
              <CommandEmpty>No states found.</CommandEmpty>
              <CommandGroup>
                {lovs?.states.map((state) => (
                  <CommandItem
                    value={state.name}
                    key={state.id}
                    onSelect={() => {
                      setOrderInfo((prev) => ({
                        ...prev,
                        stateId: state.id,
                      }));
                    }}
                  >
                    {state.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        state.id === orderInfo?.stateId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </CollapsibleCard>
  );
}
