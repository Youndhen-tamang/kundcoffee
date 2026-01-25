"use client";

import React from "react";

export function CustomTable<T>({
  columns,
  data,
  onRowClick,
}: {
  columns: { header: string; accessor: (row: T, i: number) => any }[];
  data: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-slate-50 border-b border-gray-200">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider text-left"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-violet-50/50 transition-colors cursor-pointer group"
              >
                {columns.map((col, j) => {
                  const cell = col.accessor(row, i);

                  // If the cell is a status string, render as badge
                  const isStatus =
                    typeof cell === "string" &&
                    ["ACTIVE", "INACTIVE", "OCCUPIED"].includes(cell);

                  return (
                    <td
                      key={j}
                      className="px-6 py-4 font-medium text-gray-900"
                    >
                      {isStatus ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cell === "ACTIVE"
                              ? "bg-green-50 text-green-700"
                              : cell === "OCCUPIED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cell}
                        </span>
                      ) : (
                        cell ?? "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
