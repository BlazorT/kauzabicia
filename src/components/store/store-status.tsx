// src/components/store/StoreInfo/components/StoreStatus.tsx
import { Loader2, AlertCircle, Info } from "lucide-react";

export const LoadingState = () => (
  <div className="flex items-center justify-center min-h-48 gap-4">
    <Loader2 className="animate-spin h-8 w-8 text-primary" />
    <p>Loading store information...</p>
  </div>
);

export const ErrorState = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-48 gap-4 text-destructive">
    <AlertCircle className="h-8 w-8" />
    <p>{message || "Failed to load store information"}</p>
  </div>
);

export const EmptyState = () => (
  <div className="flex items-center justify-center min-h-48 gap-4 text-muted-foreground">
    <Info className="h-8 w-8" />
    <p>No store information available</p>
  </div>
);
