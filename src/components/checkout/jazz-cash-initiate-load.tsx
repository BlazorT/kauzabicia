import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader2 } from "lucide-react";

const JCInitiateLoading = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">
            Awaiting JazzCash Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
          <p className="text-sm text-muted-foreground max-w-sm">
            Your payment request has been sent to the JazzCash app. Please open
            the app and approve the transaction to complete your order.
          </p>

          <p className="text-xs text-muted-foreground">
            If the payment isn&apos;t confirmed within 10 minutes, the request
            will be canceled automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JCInitiateLoading;
