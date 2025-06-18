// components/ui/data-table.tsx
"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Define the props for the DataTable component
interface DataTableProps<TData, TValue> {
  // Array of column definitions for @tanstack/react-table
  columns: ColumnDef<TData, TValue>[];
  // The data array to be displayed in the table
  data: TData[];
  // Boolean to indicate if data is currently being loaded (shows a loading message)
  loading?: boolean;
  // Optional: ID of the column to enable global filtering via an input field
  filterableColumnId?: string;
  // Optional: Placeholder text for the filter input field
  filterableColumnPlaceholder?: string;
  // Optional: Initial sorting state for the table
  initialSorting?: SortingState;
  // Optional: Initial visibility state for columns
  initialColumnVisibility?: VisibilityState;
  // Optional: Boolean to show/hide the "Columns" dropdown for column visibility toggle
  showColumnVisibilityToggle?: boolean;
  // Optional: Boolean to show/hide pagination controls
  showPagination?: boolean;
  // Optional: Array of numbers to configure rows per page options in the pagination dropdown
  pageSizeOptions?: number[];
  // Optional: Boolean to show/hide the "X of Y rows selected" text
  showRowSelectionInfo?: boolean;
  // Optional: Message to display when there are no results in the table
  emptyMessage?: string;
  // Optional: A custom React component to render when the table is in a loading state.
  // It receives `colSpan` (number of columns to span) and `message` (loading text).
  LoadingComponent?: React.ComponentType<{ colSpan: number; message?: string }>;
}

export function GridTable<TData, TValue>({
  columns,
  data,
  loading = false,
  filterableColumnId,
  filterableColumnPlaceholder = "Filter...",
  initialSorting = [],
  initialColumnVisibility = {},
  showColumnVisibilityToggle = true,
  showPagination = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showRowSelectionInfo = true,
  emptyMessage = "No results.",
  LoadingComponent,
}: DataTableProps<TData, TValue>) {
  // State for managing sorting of columns
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  // State for managing column filters
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // State for managing column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  // State for managing row selection
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize the table instance using useReactTable hook
  const table = useReactTable({
    data, // Data for the table
    columns, // Column definitions
    onSortingChange: setSorting, // Handler for sorting changes
    onColumnFiltersChange: setColumnFilters, // Handler for column filter changes
    getCoreRowModel: getCoreRowModel(), // Core row model
    getPaginationRowModel: getPaginationRowModel(), // Pagination row model
    getSortedRowModel: getSortedRowModel(), // Sorted row model
    getFilteredRowModel: getFilteredRowModel(), // Filtered row model
    onColumnVisibilityChange: setColumnVisibility, // Handler for column visibility changes
    onRowSelectionChange: setRowSelection, // Handler for row selection changes
    state: {
      sorting, // Current sorting state
      columnFilters, // Current column filters state
      columnVisibility, // Current column visibility state
      rowSelection, // Current row selection state
    },
  });

  // Default Loading Component to use if none is provided via props.
  // This uses a simple SVG spinner and a text message.
  const DefaultLoadingComponent = ({
    colSpan,
    message = "Loading...",
  }: {
    colSpan: number;
    message?: string;
  }) => (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex items-center justify-center">
          {/* SVG for a simple loading spinner */}
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );

  // Determine which loading component to use (custom one if provided, otherwise default)
  const CurrentLoadingComponent = LoadingComponent || DefaultLoadingComponent;

  return (
    <div className="w-full">
      {/* Top section: Filter input and Column visibility dropdown */}
      <div className="flex items-center py-4">
        {/* Render filter input only if filterableColumnId is provided */}
        {filterableColumnId && (
          <Input
            placeholder={filterableColumnPlaceholder}
            value={
              (table
                .getColumn(filterableColumnId)
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(filterableColumnId)
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {/* Render column visibility toggle only if showColumnVisibilityToggle is true */}
        {showColumnVisibilityToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide()) // Filter to show only hideable columns
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table container with border styling */}
      <div className="rounded-md border">
        <Table>
          {/* Table Header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* Table Body */}
          <TableBody>
            {loading ? (
              // Show loading component if loading
              <CurrentLoadingComponent colSpan={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              // Render rows if data exists
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  //   Apply dynamic row styling. This can be made configurable via a prop
                  //   if different tables need different row styling logic.
                  className={cn(
                    row.getValue("status") !== 1
                      ? "bg-destructive/10"
                      : row.index % 2 === 0
                      ? "bg-muted/20"
                      : "bg-background"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Show empty message if no rows and not loading
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and row selection info section */}
      {showPagination && table.getRowModel().rows?.length > 0 && (
        <div
          className={cn(
            "flex items-center px-4 mt-2",
            showRowSelectionInfo ? "justify-between " : "justify-end "
          )}
        >
          {showRowSelectionInfo && (
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
