import { useConfig } from "@/context/config-context";
import { CollapsibleCard } from "../ui/collapsible";
import { Label } from "../ui/label";
import { Check, ChevronsUpDown, HandCoins } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { defaultTipConfig, tipConfigurations } from "@/constants/constants";
import { useOrder } from "@/context/order-context";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn, safeParseJSON } from "@/lib/utils";
import { TipOption } from "@/utils/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export default function OrderTip() {
  const { config } = useConfig();
  const { items, totalPrice } = useCart();
  const { setOrderInfo, orderInfo } = useOrder();
  const currency = items[0]?.currencycode ?? "PKR";
  const tipConfig =
    tipConfigurations[currency as keyof typeof tipConfigurations] ??
    defaultTipConfig;
  const [selectedTip, setSelectedTip] = useState<string | number | null>(null);
  const [customTip, setCustomTip] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (orderInfo.tipAmount) {
      const tip = orderInfo.tipAmount;
      const findTipConfig = tipConfig.tips.find((t) => t === tip);
      if (findTipConfig) {
        setSelectedTip(findTipConfig ?? null);
      } else {
        setCustomTip(tip?.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipsList: TipOption[] | undefined = useMemo(() => {
    if (config?.tipOfferOptions) {
      const parsedOptions = safeParseJSON(
        config.tipOfferOptions
      ) as TipOption[];
      return parsedOptions.map((tip: TipOption) => ({
        ...tip,
        name: tip.tip + "%" + (tip.remarks ? " (" + tip.remarks + ")" : ""),
      }));
    }
    return undefined; // Ensure it returns undefined if no options
  }, [config]);

  if (!config?.isTipAllowed) return null;

  const handleTipSelect = (tip: string | number) => {
    setSelectedTip(tip);
    setCustomTip("");
    setOrderInfo((prev) => ({
      ...prev,
      tipAmount: typeof tip === "number" ? tip : 0,
    }));
  };

  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate input is a positive number
    const isValid =
      /^\d*\.?\d*$/.test(value) && (value === "" || parseFloat(value) >= 0);
    setValue("");
    if (isValid && value) {
      setCustomTip(value);
      setSelectedTip(null);
      setOrderInfo((prev) => ({
        ...prev,
        tipAmount: parseFloat(value),
      }));
    } else if (value === "") {
      setOrderInfo((prev) => ({
        ...prev,
        tipAmount: 0,
      }));
      setCustomTip("");
      setSelectedTip(null);
    }
  };

  return (
    <CollapsibleCard
      className="bg-secondary"
      initialOpen={false}
      showHelperText={false}
      header={
        <div className="flex items-center gap-2">
          <HandCoins />
          <Label htmlFor="orderTip">Tip</Label>
          {orderInfo.tipAmount > 0 && (
            <span className="text-xs text-primary font-medium">
              Tip of amount {items[0]?.currencycode} {orderInfo.tipAmount} has
              been applied successfully
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-4 bg-secondary">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-64 justify-between"
            >
              {value
                ? tipsList?.find((tip) => tip?.id?.toString() === value)?.name
                : "Tip (%)"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Tip (%)" className="h-9" />
              <CommandList>
                <CommandEmpty>No tips found.</CommandEmpty>
                <CommandGroup>
                  {tipsList?.map((tip) => (
                    <CommandItem
                      key={tip.id}
                      value={tip.id?.toString()}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        const tipPercent = (totalPrice / 100) * tip.tip;
                        setSelectedTip(null);
                        setCustomTip(tipPercent?.toFixed(2));
                        setOrderInfo((prev) => ({
                          ...prev,
                          tipAmount: parseFloat(tipPercent?.toFixed(2)),
                        }));
                      }}
                    >
                      {tip.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === tip.id?.toString()
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTip === "not_now" ? "default" : "outline"}
            onClick={() => handleTipSelect("not_now")}
          >
            Not Now
          </Button>
          {tipConfig.tips.map((tip: number) => (
            <Button
              key={tip}
              variant={selectedTip === tip ? "default" : "outline"}
              onClick={() => handleTipSelect(tip)}
            >
              {tipConfig.symbol} {tip}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Custom Tip Amount"
            value={customTip}
            onChange={handleCustomTipChange}
            type="text"
            inputMode="decimal"
            maxLength={3}
          />
          <span>{tipConfig.symbol}</span>
        </div>
      </div>
    </CollapsibleCard>
  );
}
