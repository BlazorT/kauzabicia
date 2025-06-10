import { useOrder } from "@/context/order-context";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export default function JazzCash() {
  const { orderInfo, setOrderInfo } = useOrder();

  const handleJazzCashMode = (mode: "card" | "wallet" | "") => {
    setOrderInfo((prev) => ({ ...prev, jazzCashMode: mode }));
  };

  return (
    <div>
      {!orderInfo.jazzCashMode && (
        <div className="flex flex-col gap-2">
          <Button
            variant={"outline"}
            onClick={() => handleJazzCashMode("wallet")}
          >
            <Wallet />
            Pay From Mobile Wallet
          </Button>
          <div className="flex items-center">
            <hr className="flex-grow border-muted border-t-[0.1rem]" />
            <span className="text-muted-foreground text-sm px-2">OR</span>
            <hr className="flex-grow border-muted border-t-[0.1rem]" />
          </div>
          <Button
            variant={"outline"}
            onClick={() => handleJazzCashMode("card")}
          >
            <CreditCard />
            Pay Through Card
          </Button>
          {/* <JazzCashCard /> */}
        </div>
      )}
      {orderInfo.jazzCashMode === "wallet" && (
        <div className="flex flex-col gap-2">
          <Input
            value={orderInfo.jazzCashNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits
              if (/^\d*$/.test(value) && value.length <= 11) {
                setOrderInfo((prev) => ({
                  ...prev,
                  jazzCashNumber: value,
                }));
              }
            }}
            placeholder="Mobile Number"
            maxLength={11}
          />
          {/* Validation message for mobile number */}
          {orderInfo.jazzCashNumber &&
            !/^03\d{9}$/.test(orderInfo.jazzCashNumber) && (
              <p className="text-red-300 text-sm">
                Must start with 03 and be exactly 11 digits.
              </p>
            )}

          <Input
            value={orderInfo.jazzCashCNIC}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only digits
              if (/^\d*$/.test(value) && value.length <= 6) {
                setOrderInfo((prev) => ({
                  ...prev,
                  jazzCashCNIC: value,
                }));
              }
            }}
            placeholder="CNIC (Last 6 digits)"
            maxLength={6}
          />
          {/* Validation message for CNIC */}
          {orderInfo.jazzCashCNIC && orderInfo.jazzCashCNIC.length < 6 && (
            <p className="text-red-300 text-sm">Must be 6 digits.</p>
          )}
        </div>
      )}
      {orderInfo.jazzCashMode !== "" && (
        <Button onClick={() => handleJazzCashMode("")} className="w-full mt-2">
          Change JazzCash Mode
        </Button>
      )}
    </div>
  );
}
