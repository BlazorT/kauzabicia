// src/components/checkout/PaymentMethodCard.tsx
import { LOV } from "@/context/lov-context";
import { PAYMENT_GATEWAY } from "@/utils/types";
import { Banknote } from "lucide-react";
import Image from "next/image";
import JazzCash from "../payments/jazz-cash";
import { Label } from "../ui/label";
import { RadioGroupItem } from "../ui/radio-group";
interface PaymentMethodCardProps {
  gateway: PAYMENT_GATEWAY | LOV;
  isForced: boolean;
  isSelected: boolean;
  description?: string | null;
}

export const PaymentMethodCard = ({
  gateway,
  isForced,
  isSelected,
  description,
}: PaymentMethodCardProps) => (
  <div className="w-full flex items-start gap-3 border rounded-md p-4">
    <RadioGroupItem
      disabled={isForced && (gateway.id === 1 || gateway.id === 3)}
      id={gateway.id.toString()}
      value={JSON.stringify(gateway)}
      checked={isSelected}
    />
    <Label
      htmlFor={gateway.id.toString()}
      className="w-full aria-disabled:opacity-50"
      aria-disabled={isForced && (gateway.id === 1 || gateway.id === 3)}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {"logo" in gateway && gateway.logo ? (
            <div className="relative w-6 h-6">
              <Image
                src={`data:image/png;base64,${gateway.logo}`}
                alt={gateway.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          )}
          <span className="font-semibold">{gateway.name}</span>
        </div>
        {isSelected && description && (
          <span className="text-sm text-muted-foreground font-medium">
            {description}
          </span>
        )}
        {isSelected && gateway.name?.toLowerCase() === "jazzcash" && (
          <JazzCash />
        )}
      </div>
    </Label>
  </div>
);
