import { useLOV } from "@/context/lov-context";
import { useOrder } from "@/context/order-context";
import { cn } from "@/lib/utils";
import { ChartColumnStacked, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const OrderState = () => {
  const { lovs } = useLOV();
  const { orderInfo, setOrderInfo } = useOrder();
  return (
    <Card className="px-2 py-2 w-full">
      <CardContent className="px-0 relative space-y-2">
        <div className="flex items-center gap-2">
          <ChartColumnStacked className="flex-shrink-0" />
          <Label>Select State</Label>
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
                  ? lovs?.states?.find(
                      (state) => state.id === orderInfo.stateId
                    )?.name
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
      </CardContent>
    </Card>
  );
};

export default OrderState;
