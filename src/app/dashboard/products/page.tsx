"use client";

import { ColumnDef } from "@tanstack/react-table";

import ProductAction from "@/components/grid-action/product-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GridTable } from "@/components/ui/grid-table";
import { useMenu } from "@/hooks/useMenu";
import { API_URL } from "@/services/apiClient";
import { MenuItem } from "@/utils/types";
import moment from "moment";
import { cleanPath } from "@/utils/menuUtils";

const columns: ColumnDef<MenuItem>[] = [
  {
    accessorKey: "producturl",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      const productname = product.productname;
      // Assuming 'user' and 'firstName' exist
      let initials = "";
      if (productname && productname.length >= 2) {
        initials = productname.slice(0, 2).toUpperCase();
      } else if (productname && productname.length === 1) {
        initials = productname.toUpperCase();
      }

      return (
        <div className="capitalize">
          {API_URL && (
            <Avatar className="size-8">
              <AvatarImage
                src={cleanPath(row.getValue("producturl"))}
                alt={row.getValue("productname")}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "productname",
    header: "Product Name",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("productname")} - {row.getValue("unitname")}
      </div>
    ),
  },
  {
    accessorKey: "barcode",
    header: "Product Code",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("barcode") === "" ? "-" : row.getValue("barcode")}
      </div>
    ),
  },
  {
    accessorKey: "unitname",
    header: "Unit Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("unitname")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "unitprice",
    header: "Sale Price",
    cell: ({ row }) => {
      const value = row.getValue("unitprice") as number;
      return <div className="lowercase">{value?.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "kitchenTimeInMins",
    header: "Ready Time (mins)",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("kitchenTimeInMins")}</div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    header: "Action",
    cell: ({ row }) => {
      const product = row.original;
      return <ProductAction product={product} />;
    },
  },
  {
    id: "lastUpdatedAt",
    header: "Last Updated At",
    sortingFn: (rowA, rowB) => {
      const dateA = moment(rowA.original.lastUpdatedAt).valueOf();
      const dateB = moment(rowB.original.lastUpdatedAt).valueOf();
      return dateB - dateA; // descending: latest date+time on top
    },
    cell: ({ row }) => {
      return moment(row.original.lastUpdatedAt)
        .local()
        .format("YYYY-MM-DD HH:mm:ss");
    },
  },
];

function Products() {
  const { data: menuResponse, isPending } = useMenu(
    "1",
    moment().format("YYYY-MM-DDTHH:mm:ss"),
    "0",
    "0"
  );
  const products = menuResponse?.data ?? [];

  // Sort products by lastUpdatedAt in descending order
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = moment(a.lastUpdatedAt).valueOf();
    const dateB = moment(b.lastUpdatedAt).valueOf();
    return dateB - dateA;
  });

  const columnVisibility = {
    unitname: false,
    status: false,
    lastUpdatedAt: false,
  };

  return (
    <div className="w-full">
      <GridTable
        columns={columns}
        data={sortedProducts}
        showPagination
        initialColumnVisibility={columnVisibility}
        loading={isPending}
        filterableColumnId="productname"
        filterableColumnPlaceholder="Search Products..."
      />
    </div>
  );
}
export default Products;
