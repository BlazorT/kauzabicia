"use client";

import ProductSettingForm from "@/components/product/product-setting-form";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { useGetStoreMenus, useGetUnits } from "@/hooks/useMenu";

const ProductSetting = () => {
  const { isPending } = useGetStoreMenus();
  const { isPending: isUnitPending } = useGetUnits();
  return (
    <Card className="flex flex-col items-center bg-background justify-center px-0 py-0 border-none rounded-none">
      <CardContent className="w-full bg-card p-6 flex flex-col gap-4 rounded-3xl border-1">
        {isPending || (isUnitPending && <Spinner />)}
        <h1 className="text-2xl text-center sm:text-3xl">Product Setting</h1>
        <ProductSettingForm />
      </CardContent>
    </Card>
  );
};

export default ProductSetting;
