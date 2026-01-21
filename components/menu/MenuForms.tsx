"use client";
import React, { useState, useEffect } from "react";
import { Stock, Price, StockConsumption } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface PriceFormProps {
  value?: Partial<Price>;
  onChange: (value: Partial<Price>) => void;
}

export function PriceForm({ value, onChange }: PriceFormProps) {
  const handleChange = (field: keyof Price, val: string) => {
    const num = parseFloat(val) || 0;
    onChange({ ...value, [field]: num });
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-700">Pricing & Cost</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Actual Price
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={value?.actualPrice || ""}
            onChange={(e) => handleChange("actualPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Discount Price
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={value?.discountPrice || ""}
            onChange={(e) => handleChange("discountPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Listed Price (Display)
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={value?.listedPrice || ""}
            onChange={(e) => handleChange("listedPrice", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">
            COGS
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={value?.cogs || ""}
            onChange={(e) => handleChange("cogs", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500">
            Gross Profit
          </label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-sm"
            value={value?.grossProfit || ""}
            onChange={(e) => handleChange("grossProfit", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

interface StockConsumptionFormProps {
  stocks: Stock[]; // Available stocks to choose from
  value?: { stockId: string; quantity: number }[];
  onChange: (value: { stockId: string; quantity: number }[]) => void;
}

export function StockConsumptionForm({
  stocks,
  value = [],
  onChange,
}: StockConsumptionFormProps) {
  const addRow = () => {
    onChange([...value, { stockId: "", quantity: 0 }]);
  };

  const removeRow = (index: number) => {
    const newVal = [...value];
    newVal.splice(index, 1);
    onChange(newVal);
  };

  const updateRow = (
    index: number,
    field: "stockId" | "quantity",
    val: string | number,
  ) => {
    const newVal = [...value];
    newVal[index] = { ...newVal[index], [field]: val };
    onChange(newVal);
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Setup Stock Consumption</h3>
        <Button onClick={addRow} type="button" variant="secondary" size="sm">
          + Add Stock
        </Button>
      </div>
      <div className="space-y-2">
        {value.map((row, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500">
                Stock Item
              </label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={row.stockId}
                onChange={(e) => updateRow(index, "stockId", e.target.value)}
              >
                <option value="">Select Stock</option>
                {stocks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500">
                Qty
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border rounded px-2 py-1 text-sm"
                value={row.quantity}
                onChange={(e) =>
                  updateRow(index, "quantity", parseFloat(e.target.value))
                }
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => removeRow(index)}
              title="Remove"
            >
              X
            </Button>
          </div>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            No stock consumption defined.
          </p>
        )}
      </div>
    </div>
  );
}

// Simple Rich Text Placeholder
// Simple Rich Text Placeholder
export function RichTextEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const insertFormat = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      `rte-${label}`,
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    onChange(newText);

    // Defer focus restoration
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label}
      </label>
      <div className="border border-gray-300 rounded-lg p-1 bg-white focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
        <div className="flex gap-1 border-b border-gray-100 pb-2 mb-2 px-1">
          <button
            type="button"
            onClick={() => insertFormat("**", "**")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Bold"
          >
            <span className="font-bold text-xs">B</span>
          </button>
          <button
            type="button"
            onClick={() => insertFormat("*", "*")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Italic"
          >
            <span className="italic text-xs">I</span>
          </button>
          <button
            type="button"
            onClick={() => insertFormat("- ")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="List"
          >
            <span className="text-xs">List</span>
          </button>
          <button
            type="button"
            onClick={() => insertFormat("# ")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Heading 1"
          >
            <span className="font-bold text-xs">H1</span>
          </button>
          <button
            type="button"
            onClick={() => insertFormat("## ")}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Heading 2"
          >
            <span className="font-bold text-xs">H2</span>
          </button>
        </div>
        <textarea
          id={`rte-${label}`}
          className="w-full p-2 text-sm focus:outline-none min-h-[120px] resize-y rounded-b-lg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type description here... (Markdown supported)"
        />
      </div>
    </div>
  );
}
