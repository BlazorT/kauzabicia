// src/app/[storeId]/components/StoreLayout/StoreLayout.tsx
import { ReactNode } from "react";

interface StoreLayoutProps {
  children: ReactNode;
}

export const StoreLayout = ({ children }: StoreLayoutProps) => (
  <div className="min-h-screen bg-background">
    <div className="container lg:max-w-[90rem] mx-auto px-2 py-8 gap-2 flex flex-col">
      {children}
    </div>
  </div>
);
