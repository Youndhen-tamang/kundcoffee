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
    PENDING: "border-emerald-100 text-emerald-600 bg-emerald-50",
    PREPARING: "border-zinc-200 text-zinc-600 bg-zinc-50",
    READYTOPICK: "border-emerald-100 text-emerald-600 bg-emerald-50",
    SERVED: "border-blue-100 text-blue-600 bg-blue-50",
    COMPLETED: "border-zinc-200 text-zinc-400 bg-zinc-50",
    CANCELLED: "border-zinc-200 text-zinc-400 bg-zinc-100",
  };

  const totalDishes = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className="group bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
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
      <div className="p-5 flex-1 space-y-2 min-h-[90px] max-h-[150px] overflow-y-auto custom-scrollbar">
        {order.items.map((item, idx) => (
          <div
            key={item.id + idx}
            className="flex items-center justify-between text-[11px] text-zinc-600 font-normal uppercase tracking-tight"
          >
            <span className="truncate flex-1">
              {item.dish?.name || item.combo?.name || "Item"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">x{item.quantity}</span>
              <span className="text-zinc-900 font-medium">
                Rs. {item.unitPrice.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. TOTAL & ACTIONS */}
      <div className="px-5 pb-5 pt-2 space-y-4">
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Total Amount
          </span>
          <span className="text-lg font-bold text-zinc-900">
            Rs. {order.total.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddItems(order);
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            <Plus size={14} />
            Add More
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickCheckout(order);
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md shadow-zinc-500/20 active:scale-95 border-none"
          >
            <Zap size={14} />
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
