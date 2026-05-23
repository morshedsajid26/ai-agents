"use client";
import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

export const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all border-b border-slate-100 dark:border-slate-850 last:border-0 group ${className}`} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = "", ...props }) => (
  <td className={`py-4 text-center px-4 text-sm font-normal text-slate-655 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${className}`} {...props}>
    {children}
  </td>
);

export function Table({ TableHeads, TableRows, headClass, tableClass, children, headers }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);

  // 1. Transform TableHeads into TanStack columns
  const columns = React.useMemo(
    () =>
      (TableHeads || []).map((head) => ({
        accessorKey: head.key,
        header: head.Title,
        cell: (info) => {
          if (head.render) {
            return head.render(info.row.original, info.row.index);
          }
          const value = info.getValue();
          
          if (value instanceof Date) {
            return value.toLocaleDateString();
          }
          
          if (value && typeof value === 'object') {
            if (typeof value.getMonth === 'function') {
              return new Date(value).toLocaleDateString();
            }
            return JSON.stringify(value);
          }
          
          return value;
        },
        size: typeof head.width === 'number' ? head.width : 150,
        width: head.width,
        enableSorting: head.sortable !== false,
      })),
    [TableHeads]
  );

  // 2. Initialize the table
  const table = useReactTable({
    data: TableRows || [],
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (children) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0b0f19] overflow-hidden">
        <table className={`w-full border-collapse ${tableClass}`}>
          {headers && (
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850">
                {headers.map((h, i) => (
                  <th key={i} className={`text-center bg-slate-900 dark:bg-slate-955 font-semibold text-white py-4 px-4 text-xs uppercase tracking-wider ${headClass}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-[#0b0f19]">{children}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] shadow-sm">
        <table className={`w-full border-collapse ${tableClass}`}>
          {/* ==== TABLE HEADER ==== */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-955">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-center font-semibold text-white py-4 px-4 text-xs uppercase tracking-wider ${headClass} select-none`}
                    style={{ width: header.column.columnDef.width || header.column.columnDef.size }}
                  >
                    <div 
                      className="flex items-center justify-center gap-2 cursor-pointer hover:text-indigo-200 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      
                      {header.column.getCanSort() && (
                        <span className="text-slate-400">
                          {{
                            asc: <ArrowUp size={14} className="text-indigo-400" />,
                            desc: <ArrowDown size={14} className="text-indigo-400" />,
                          }[header.column.getIsSorted()] ?? <ArrowUpDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ==== TABLE BODY ==== */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all group">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="py-4 text-center px-4 text-sm font-normal text-slate-650 dark:text-slate-400 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==== PAGINATION CONTROLS ==== */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Page <span className="font-bold text-slate-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{table.getPageCount()}</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1">
                {table.getPageOptions().map((pageIdx) => (
                    <button
                        key={pageIdx}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                            table.getState().pagination.pageIndex === pageIdx
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-650/20"
                                : "bg-white dark:bg-[#0b0f19] text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                        }`}
                        onClick={() => table.setPageIndex(pageIdx)}
                    >
                        {pageIdx + 1}
                    </button>
                ))}
            </div>

            <button
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <ChevronRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}
