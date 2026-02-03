"use client";

import { Order, OrderStatus } from "@/lib/types";
import { Plus, Printer, Copy, Zap, Clock, Utensils } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onClick: (order: Order) => void;
  onQuickCheckout: (order: Order) => void;
  onPrint: (order: Order) => void;
  onCopy: (order: Order) => void;
  onAddItems: (order: Order) => void;
}

export function OrderCard({
  order,
  onClick,
  onQuickCheckout,
  onPrint,
  onCopy,
  onAddItems,
}: OrderCardProps) {
  const statusColors: Record<OrderStatus, string> = {
    PENDING: "border-red-100 text-red-600 bg-red-50",
    PREPARING: "border-zinc-200 text-zinc-600 bg-zinc-50",
    READYTOPICK: "border-emerald-100 text-emerald-600 bg-emerald-50",
    SERVED: "border-blue-100 text-blue-600 bg-blue-50",
    COMPLETED: "border-zinc-200 text-zinc-400 bg-zinc-50",
    CANCELLED: "border-zinc-200 text-zinc-400 bg-zinc-100",
  };

  const totalDishes = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className="group bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-red-500 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
      onClick={() => onClick(order)}
    >
      {/* 1. TOP HEADER: Table Name and Meta */}
      <div className="p-5 border-b border-zinc-100 bg-white flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-900 text-lg tracking-tight uppercase truncate">
            {order.table?.name || "Direct Order"}
          </h3>
          <div
            className={`text-[8px] font-medium px-2 py-0.5 rounded-md border ${statusColors[order.status]} uppercase tracking-widest`}
          >
            {order.status}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {order.type.replace("_", " ")}
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-medium">
              <Clock size={11} />
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT: Dish Summary */}
      <div className="p-5 flex-1 space-y-2 min-h-[90px] max-h-[130px] overflow-y-auto custom-scrollbar">
        {order.items.map((item, idx) => (
          <div
            key={item.id + idx}
            className="flex items-center justify-between text-[11px] text-zinc-600 font-normal uppercase tracking-tight"
          >
            <span className="truncate flex-1">
              {item.dish?.name || item.combo?.name || "Item"}
            </span>
            <span className="text-zinc-500 ml-2">x{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM SECTION: Totals and Hover Actions */}
      <div className="p-5 bg-zinc-50 border-t border-zinc-200 mt-auto space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Utensils size={10} className="text-zinc-400" />
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              {totalDishes} {totalDishes === 1 ? "Dish" : "Dishes"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
              Total Payable
            </span>
            <span className="text-xl font-bold text-zinc-900 leading-none">
              Rs. {order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Bar that appears on hover/hover-focus */}
        <div className="absolute inset-0 bg-white border-t border-zinc-200 flex items-center justify-around translate-y-full group-hover:translate-y-0 transition-transform duration-200 shadow-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddItems(order);
            }}
            className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
            title="Add Items"
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint(order);
            }}
            className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
            title="Print"
          >
            <Printer size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(order);
            }}
            className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
            title="Copy"
          >
            <Copy size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickCheckout(order);
            }}
            className="p-2 text-zinc-500 hover:text-red-600 transition-transform"
            title="Quick Checkout"
          >
            <Zap size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(order);
            }}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[9px] font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}
