"use client";

import {
  ColumnDef,
  ColumnFiltersState, ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel, OnChangeFn,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import React, {useEffect, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {DataTableViewOptions} from "@/components/datatable/DataTableViewOptions";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {DataTablePagination} from "@/components/datatable/DataTablePagination";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {MoreVertical, EyeOff, ArrowUp, ArrowDown} from "lucide-react";

declare module '@tanstack/react-table' {
  // @ts-ignore
  interface ColumnMeta<TData extends object> {
    pinned?: 'left' | 'right';
    actions?: boolean;
    isGroupedColumn?: boolean;
    groupId?: string;
  }
}

interface DataTableProps<TData extends { _id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string;
  buttons?: React.ReactNode;
  onRowSelectionChange?: (selectedRowIds: string[]) => void;
}

export function DataTable<TData extends { _id: string }, TValue>({
                                                                   columns,
                                                                   data,
                                                                   title,
                                                                   buttons,
                                                                   onRowSelectionChange,
                                                                 }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<{ [key: string]: boolean }>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [dropdownStates, setDropdownStates] = useState<{ [key: string]: boolean }>({});

  const initialColumnPinning = useMemo(() => {
    const left: string[] = [];
    const right: string[] = [];
    columns.forEach((column) => {
      if (column.meta && "pinned" in column.meta) {
        if (column.meta.pinned === "left" && column.id) {
          left.push(column.id);
        } else if (column.meta.pinned === "right" && column.id) {
          right.push(column.id);
        }
      }
    });
    return {left, right};
  }, [columns]);

  const [columnPinning, setColumnPinning] = React.useState(initialColumnPinning);

  useEffect(() => {
    if (onRowSelectionChange && data.length > 0) {
      const selectedRowIds = Object.keys(rowSelection)
        .filter((key) => rowSelection[key])
        .map((key) => {
          const rowIndex = parseInt(key);
          if (rowIndex >= 0 && rowIndex < data.length) {
            return data[rowIndex]._id;
          }
          return "";
        })
        .filter((id) => id !== "");

      onRowSelectionChange(selectedRowIds);
    }
  }, [rowSelection, data, onRowSelectionChange]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableColumnPinning: true,
    onColumnPinningChange: setColumnPinning as OnChangeFn<ColumnPinningState>,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnPinning,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const cellValue = String(row.getValue(columnId) || "").toLowerCase();
      return cellValue.includes(String(filterValue).toLowerCase());
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="">
      <div className="justify-between flex mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <DataTableViewOptions table={table}/>
          {buttons}
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isGroupHeader = !header.isPlaceholder && header.subHeaders?.length > 0;
                  const isAnySubHeaderPinnedLeft = header.subHeaders?.some((sub) => sub.column.getIsPinned() === "left");
                  const isAnySubHeaderPinnedRight = header.subHeaders?.some((sub) => sub.column.getIsPinned() === "right");
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`${isGroupHeader ? "font-semibold border-b bg-muted dark:bg-muted/30" : ""}
                        ${header.depth > 0 && header.column.getIsPinned()
                        ? `sticky z-20 ${
                          header.column.getIsPinned() === "left"
                            ? "left-0 border-r border-gray-700 bg-gray-200 dark:bg-gray-800"
                            : "right-0 border-l border-gray-700 bg-gray-200 dark:bg-gray-800"
                        }`
                        : ""}
                      `}
                      style={{
                        minWidth: header.getSize(),
                        maxWidth: header.column.columnDef.maxSize,
                        left: isAnySubHeaderPinnedLeft ? `${header.getStart("left")}px` : undefined,
                        right: isAnySubHeaderPinnedRight ? `0px` : undefined,
                      }}

                    >
                      <div className="flex items-center justify-between">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}

                        {header.column.columnDef.meta?.actions !== false &&
                          !header.isPlaceholder && (
                            <DropdownMenu
                              open={dropdownStates[header.id] || false}
                              onOpenChange={(open) =>
                                setDropdownStates((prev) => ({...prev, [header.id]: open}))
                              }
                            >
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  <MoreVertical size={16}/>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    const isPinned = header.column.getIsPinned();
                                    table.setColumnPinning({
                                      left:
                                        isPinned === "left"
                                          ? table.getState().columnPinning.left?.filter((id) => id !== header.id)
                                          : [...(table.getState().columnPinning.left || []), header.id],
                                      right: table.getState().columnPinning.right?.filter((id) => id !== header.id),
                                    });
                                  }}
                                >
                                  <MoreVertical size={16} className="mr-2"/>
                                  {header.column.getIsPinned() === "left" ? "Unpin" : "Pin to Left"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const isPinned = header.column.getIsPinned();
                                    table.setColumnPinning({
                                      left: table.getState().columnPinning.left?.filter((id) => id !== header.id),
                                      right:
                                        isPinned === "right"
                                          ? table.getState().columnPinning.right?.filter((id) => id !== header.id)
                                          : [...(table.getState().columnPinning.right || []), header.id],
                                    });
                                  }}
                                >
                                  <MoreVertical size={16} className="mr-2"/>
                                  {header.column.getIsPinned() === "right" ? "Unpin" : "Pin to Right"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={() => header.column.toggleVisibility(false)}>
                                  <EyeOff size={16} className="mr-2"/>
                                  Hide Column
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const currentSort = header.column.getIsSorted();
                                    header.column.toggleSorting(currentSort === "asc");
                                  }}
                                >
                                  <ArrowUp size={16} className="mr-2"/>
                                  Sort Ascending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const currentSort = header.column.getIsSorted();
                                    header.column.toggleSorting(currentSort !== "asc");
                                  }}
                                >
                                  <ArrowDown size={16} className="mr-2"/>
                                  Sort Descending
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${cell.column.columnDef.meta?.isGroupedColumn ? "font-medium" : ""}
                        ${cell.column.getIsPinned()
                        ? `sticky z-10 ${
                          cell.column.getIsPinned() === "left"
                            ? "border-r border-gray-700 bg-gray-200 dark:bg-gray-800"
                            : "border-l border-gray-700 bg-gray-200 dark:bg-gray-800"
                        }`
                        : cell.column.columnDef.meta?.isGroupedColumn
                          ? "bg-muted/20 dark:bg-muted/20"
                          : ""}
                      `}
                      style={{
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.columnDef.maxSize,
                        left: cell.column.getIsPinned() === "left" ? `${cell.column.getStart("left")}px` : undefined,
                        right: cell.column.getIsPinned() === "right" ? `0px` : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>

                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table}/>
      </div>
    </div>
  );
}