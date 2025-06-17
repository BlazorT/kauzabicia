import { STATUS } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useAddUpdateProduct } from "@/hooks/useMenu";
import { QUERY_KEYS } from "@/utils/queryKeys";
import { MenuItem } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { toast } from "sonner";
import parse from "html-react-parser";

type Props = {
  product: MenuItem;
};

const ProductAction = (props: Props) => {
  const product = props.product;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { mutate, isPending: isPendingAddUpdate } = useAddUpdateProduct();

  const onStatusChange = () => {
    showAlert({
      title: "Confirmations!",
      description: `Are you sure you want to ${
        product.status === 1 ? "de-activate" : "re-activate"
      } ${product.productname} - ${product.unitname}?`,
      confirmText: "OK",
      cancelText: "Cancel",
      onConfirm: () => onConfirm(),
    });
  };

  const onConfirm = () => {
    const productData = {
      Id: product?.productDetailId,
      Barcode: product?.barcode ?? "",
      ProductId: product?.productId,
      StoreId: 1,
      UnitId: product?.unitId,
      Unitprice: parseFloat(product?.unitprice?.toFixed(2)),
      SchemeAmount: parseFloat(product?.linediscount?.toFixed(2)),
      TaxInPercentage: parseFloat(product.tax?.toFixed(2)),
      KitchenTimeInMins: product.kitchenTimeInMins,
      Status: product.status === 1 ? 2 : 1,
      Description: product.description,
      Producturl: product?.producturl,
      RowVer: 1,
      createdAt: product?.createdAt,
      lastUpdatedAt: moment().utc().format(),
      createdBy: product?.createdBy,
      lastUpdatedBy: user?.id,
    };
    // console.log(productData);
    // console.log(JSON.stringify(productData));
    mutate(productData, {
      onSuccess: async (res) => {
        // console.log({ res });
        if (res?.status == true) {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.MENU, "1", "0", "0"],
          });
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.MENU, "1", "0", "1"],
          });

          toast.success(parse(res?.message ?? ""));
        } else {
          showAlert({
            title: "Error",
            description: `${res?.message ?? STATUS.SERVER_ERROR}`,
            confirmText: "OK",
          });
        }
      },
      onError: (err) => {
        console.log({ err });
      },
    });
  };
  return (
    <div className="flex gap-8">
      {isPendingAddUpdate ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <>
          {product?.status !== 1 ? (
            <RotateCcw onClick={onStatusChange} className="cursor-pointer" />
          ) : (
            <>
              <Link
                href={`/dashboard/product-setting/?id=${product.productDetailId}`}
              >
                <Pencil />
              </Link>
              <Trash2
                onClick={onStatusChange}
                className="text-destructive cursor-pointer"
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductAction;
