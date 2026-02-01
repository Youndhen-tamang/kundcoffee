"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem, Table } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Coffee, Trash2, Plus, Minus } from "lucide-react";

interface TableOrderCartProps {
  table: Table;
  onClose: () => void;
}

// Mock Data Generator
const generateMockOrder = (tableId: string): Order => {
  return {
    id: `ord-${Math.random().toString(36).substr(2, 9)}`,
    tableId,
    sessionId: "session-1",
    items: [
      {
        id: "1",
        orderId: "m-1",
        dishId: "d1",
        dish: { name: "Cappuccino", price: { listedPrice: 4.5 } } as any,
        quantity: 2,
        unitPrice: 4.5,
        totalPrice: 9.0,
        status: "SERVED",
      },
      {
        id: "2",
        orderId: "m-1",
        dishId: "d2",
        dish: {
          name: "Grilled Chicken Sandwich",
          price: { listedPrice: 12.0 },
        } as any,
        quantity: 1,
        unitPrice: 12.0,
        totalPrice: 12.0,
        status: "PREPARING",
      },
    ],
    type: "DINE_IN",
    total: 26.95,
    status: "PENDING",
    createdAt: new Date(),
  };
};

export function TableOrderCart({ table, onClose }: TableOrderCartProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrder(generateMockOrder(table.id));
  }, [table]);

  if (!order)
    return (
      <div className="p-4 text-zinc-500 font-medium uppercase text-[10px] tracking-widest">
        Loading order...
      </div>
    );

  const subtotal = order.total / 1.1;
  const tax = order.total - subtotal;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Info (Mock) */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-medium px-2.5 py-1 bg-red-50 text-red-600 rounded-md border border-red-50 uppercase tracking-widest">
            Order #{order.id.substr(-6)}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
            {order.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
          <span>Status:</span>
          <span
            className={`font-semibold ${
              order.status === "PENDING"
                ? "text-red-600"
                : order.status === "COMPLETED"
                  ? "text-emerald-600"
                  : "text-zinc-600"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-300 gap-2 opacity-30">
            <Coffee size={32} />
            <p className="text-[10px] font-medium uppercase tracking-widest">
              No items yet
            </p>
          </div>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 rounded-xl border border-zinc-200 bg-white shadow-sm hover:border-red-400 transition-all"
            >
              <div className="flex-1">
                <h4 className="font-medium text-zinc-900 text-[13px] uppercase tracking-tight">
                  {item.dish?.name || item.combo?.name || "Item"}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[9px] uppercase font-medium px-1.5 py-0.5 rounded border tracking-widest ${
                      item.status === "SERVED"
                        ? "bg-zinc-50 text-zinc-500 border-zinc-100"
                        : item.status === "PREPARING"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium tracking-tight">
                    ${item.unitPrice.toFixed(2)} ea
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-medium text-zinc-900 text-sm tracking-tight">
                  ${item.totalPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-3 bg-zinc-50 rounded-lg p-1 border border-zinc-100">
                  <button className="p-1 text-zinc-500 hover:text-red-600 transition-colors">
                    <Minus size={12} strokeWidth={2} />
                  </button>
                  <span className="text-[10px] font-medium w-4 text-center text-zinc-900">
                    {item.quantity}
                  </span>
                  <button className="p-1 text-zinc-500 hover:text-red-600 transition-colors">
                    <Plus size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-zinc-100 p-6 bg-zinc-50/50 space-y-4">
        <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-widest px-1">
          <span>Subtotal</span>
          <span className="text-zinc-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase tracking-widest px-1">
          <span>Tax (10%)</span>
          <span className="text-zinc-700">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-end text-zinc-900 pt-4 border-t border-zinc-200 px-1">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">
            Total
          </span>
          <span className="text-3xl font-medium leading-none tracking-tight">
            ${order.total.toFixed(2)}
          </span>
        </div>
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-12 border-zinc-200 text-zinc-700 font-medium uppercase tracking-widest text-[10px] bg-white"
          >
            Close
          </Button>
          <Button className="h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-medium uppercase tracking-widest text-[10px] border-none shadow-sm">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
