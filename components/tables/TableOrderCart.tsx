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
    items: [
      {
        id: "1",
        name: "Cappuccino",
        quantity: 2,
        price: 4.5,
        status: "SERVED",
      },
      {
        id: "2",
        name: "Grilled Chicken Sandwich",
        quantity: 1,
        price: 12.0,
        status: "COOKING",
      },
      {
        id: "3",
        name: "Fries",
        quantity: 1,
        price: 3.5,
        status: "PENDING",
      },
    ],
    subtotal: 24.5,
    tax: 2.45,
    discount: 0,
    total: 26.95,
    status: "OPEN",
    createdAt: new Date(),
  };
};

export function TableOrderCart({ table, onClose }: TableOrderCartProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // In a real app, populate this from an API call using table.id
    // fetchOrder(table.id).then(setOrder)
    setOrder(generateMockOrder(table.id));
  }, [table]);

  if (!order) return <div className="p-4">Loading order...</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Info (Mock) */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold px-2 py-1 bg-violet-100 text-violet-700 rounded uppercase tracking-wider">
            Order #{order.id.substr(-6)}
          </span>
          <span className="text-xs text-gray-500">
            {order.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Status:</span>
          <span
            className={`font-semibold ${
              order.status === "OPEN"
                ? "text-blue-600"
                : order.status === "PAID"
                  ? "text-green-600"
                  : "text-gray-600"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {order.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Coffee size={32} className="opacity-20" />
            <p className="text-sm">No items in order yet.</p>
          </div>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      item.status === "SERVED"
                        ? "bg-green-100 text-green-700"
                        : item.status === "COOKING"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    ${item.price.toFixed(2)} ea
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-semibold text-gray-900 text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <div className="flex items-center gap-2 bg-gray-50 rounded p-1">
                  <button className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-violet-600 bg-white rounded shadow-sm">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-semibold w-4 text-center">
                    {item.quantity}
                  </span>
                  <button className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-violet-600 bg-white rounded shadow-sm">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax (10%)</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Checkout / Pay
          </Button>
        </div>
      </div>
    </div>
  );
}
