"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import ProductAction from "@/components/grid-action/product-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GridTable } from "@/components/ui/grid-table";
import { useMenu } from "@/hooks/useMenu";
import { API_URL } from "@/services/apiClient";
import { MenuItem } from "@/utils/types";
import moment from "moment";

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
                src={API_URL + row.getValue("producturl")}
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sale Price
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("unitprice") as number;
      return <div className="lowercase">{value?.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "kitchenTimeInMins",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ready Time (mins)
          <ArrowUpDown />
        </Button>
      );
    },
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
    header: "lastUpdatedAt",
    sortingFn: "datetime",
    cell: ({ row }) => moment(row.getValue("lastUpdatedAt")).local().format(""),
  },
];

function Products() {
  const { data: menuResponse, isPending } = useMenu(
    "1",
    moment().format("YYYY-MM-DDTHH:mm:ss"),
    "0",
    "0"
  );
  const products = (menuResponse?.data ?? []) as MenuItem[] | [];
  const sorting = [
    {
      id: "lastUpdatedAt",
      desc: true, // sort by name in descending order by default
    },
  ];

  const columnVisibility = {
    unitname: false,
    status: false,
    lastUpdatedAt: false,
  };

  return (
    <div className="w-full">
      <GridTable
        columns={columns}
        data={products}
        showPagination
        initialColumnVisibility={columnVisibility}
        initialSorting={sorting}
        loading={isPending}
        filterableColumnId="productname"
        filterableColumnPlaceholder="Search Products..."
      />
    </div>
  );
}
export default Products;
