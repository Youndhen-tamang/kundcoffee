"use client";

import { useState } from "react";
import { Order, OrderItem, OrderStatus, OrderType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
import { EditOrderItemForm } from "./edit/EditOrderItemForm";
import {
  X,
  Clock,
  User,
  Trash2,
  Edit2,
  Plus,
  Minus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Package,
  CreditCard,
  Zap,
  Printer,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";

interface OrderDetailViewProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateItemStatus: (itemId: string, status: OrderStatus) => void;
  onEditItem: (itemId: string, updatedData: any) => void;
  onQuickCheckout: (order: Order) => void;
  onAddMore: (order: Order) => void;
}

export function OrderDetailView({
  order,
  onClose,
  onUpdateStatus,
  onUpdateItemStatus,
  onEditItem,
  onQuickCheckout,
  onAddMore,
}: OrderDetailViewProps) {
  const [activeItemForPopover, setActiveItemForPopover] = useState<
    string | null
  >(null);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  const statuses: OrderStatus[] = [
    "PENDING",
    "PREPARING",
    "READYTOPICK",
    "SERVED",
    "COMPLETED",
    "CANCELLED",
  ];

  const [includeTax, setIncludeTax] = useState(false);

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "border-red-100 text-red-600 bg-red-50 font-medium";
      case "PREPARING":
        return "border-zinc-200 text-zinc-600 bg-zinc-50 font-medium";
      case "READYTOPICK":
        return "border-emerald-100 text-emerald-600 bg-emerald-50 font-medium";
      case "SERVED":
        return "border-blue-100 text-blue-600 bg-blue-50 font-medium";
      case "COMPLETED":
        return "border-zinc-200 text-zinc-400 bg-zinc-50 font-medium";
      case "CANCELLED":
        return "border-zinc-200 text-zinc-400 bg-zinc-100 font-medium";
      default:
        return "border-zinc-200 text-zinc-400 bg-zinc-50 font-medium";
    }
  };

  const pendingItems = order.items.filter(
    (i) =>
      (i.status || "PENDING") !== "SERVED" &&
      (i.status || "PENDING") !== "COMPLETED",
  );

  const taxAmount = includeTax ? order.total * 0.13 : 0;
  const grandTotal = order.total + taxAmount;

  return (
    <div className="flex flex-col m-auto h-[85vh] bg-white overflow-hidden rounded-xl border border-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-zinc-900 leading-none tracking-tight">
                Order #{order.id.slice(-6)}
              </h2>
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 uppercase tracking-widest">
                {order.type.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                Table:{" "}
                <span className="text-zinc-900">
                  {order.table?.name || "No Table"}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onAddMore(order)}
            variant="secondary"
            className="h-10 px-5 border-zinc-200 text-zinc-700 font-medium flex items-center gap-2 uppercase text-[10px] tracking-widest bg-white"
          >
            <Plus size={16} />
            Add Items
          </Button>
          <div className="h-6 w-px bg-zinc-200 mx-1" />
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content: Dishes List */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-red-400 transition-all cursor-pointer group flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-5 flex-1">
                  <Popover
                    isOpen={activeItemForPopover === item.id}
                    setIsOpen={(open) =>
                      setActiveItemForPopover(open ? item.id : null)
                    }
                    trigger={
                      <div className="w-14 h-14 bg-zinc-50 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-100 transition-transform hover:scale-105">
                        {item.dish?.image?.[0] ? (
                          <img
                            src={item.dish.image[0]}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LayoutGrid size={20} className="text-zinc-300" />
                        )}
                      </div>
                    }
                    content={
                      <div className="w-60 p-2 space-y-4">
                        <div className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                          <div className="w-9 h-9 rounded bg-white border border-zinc-200 overflow-hidden">
                            {item.dish?.image?.[0] && (
                              <img
                                src={item.dish.image[0]}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-zinc-900 truncate uppercase tracking-tight">
                              {item.dish?.name}
                            </p>
                            <p className="text-[9px] text-zinc-500 font-normal truncate uppercase">
                              Options
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-zinc-500">
                          {statuses.map((s) => (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateItemStatus(item.id, s);
                                setActiveItemForPopover(null);
                              }}
                              className={`text-left px-3 py-1.5 text-[9px] font-medium rounded transition-all uppercase tracking-widest ${
                                (item.status || "PENDING") === s
                                  ? "bg-zinc-900 text-white shadow-sm"
                                  : "text-zinc-500 hover:bg-zinc-50"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveItemForPopover(null);
                            setEditingItem(item);
                          }}
                          variant="secondary"
                          className="w-full h-9 border-zinc-200 text-zinc-700 font-medium text-[9px] uppercase tracking-widest bg-white"
                        >
                          <Edit2 size={12} className="mr-2" />
                          Modify Item
                        </Button>
                      </div>
                    }
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-zinc-900 text-[13px] uppercase tracking-tight leading-none">
                        {item.dish?.name || "Dish Item"}
                      </h4>
                      <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                        x{item.quantity}
                      </span>
                    </div>
                    {item.remarks && (
                      <p className="text-[9px] text-zinc-600 font-normal uppercase italic mt-1 bg-zinc-50 px-2 py-1 rounded inline-block">
                        Note: {item.remarks}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[7px] font-medium text-zinc-400 uppercase tracking-widest">
                      Status
                    </span>
                    <span
                      className={`text-[9px] font-medium px-2 py-0.5 rounded border uppercase tracking-widest mt-1 ${getStatusStyle(item.status || "PENDING")}`}
                    >
                      {item.status || "PENDING"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end min-w-[60px]">
                    <span className="text-[7px] font-medium text-zinc-400 uppercase tracking-widest">
                      Price
                    </span>
                    <span className="text-sm font-medium text-zinc-900 mt-1">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="w-80 border-l border-zinc-100 p-8 flex flex-col gap-8 bg-zinc-50/30">
          <div className="space-y-6">
            <h3 className="font-medium text-zinc-400 text-[9px] uppercase tracking-[0.2em] border-b border-zinc-100 pb-4">
              Order Summary
            </h3>

            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-3">
                    <User size={12} className="text-zinc-400" />{" "}
                    <span className="text-zinc-500">Guests</span>
                  </div>
                  <span className="text-zinc-900">04</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-3">
                    <Clock size={12} className="text-red-500" />{" "}
                    <span className="text-zinc-500">Pending</span>
                  </div>
                  <span className="text-red-600">
                    {pendingItems.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                    Include Tax (13%)
                  </span>
                  <button
                    onClick={() => setIncludeTax(!includeTax)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${includeTax ? "bg-red-500" : "bg-zinc-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${includeTax ? "left-[18px]" : "left-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                {includeTax && (
                  <div className="flex justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                    <span>Tax Amount</span>
                    <span className="text-zinc-700">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex flex-col gap-2 items-end mb-6 pr-1">
              <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-[0.2em] leading-none">
                Total Payable
              </span>
              <span className="text-4xl font-medium text-zinc-900 leading-none tracking-tighter">
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-3 font-medium text-[10px] h-12 border-zinc-200 text-zinc-700 uppercase tracking-widest bg-white shadow-sm"
            >
              <CreditCard size={18} strokeWidth={1.5} />
              Advance Payment
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onQuickCheckout(order)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[10px] h-12 uppercase tracking-widest border-none shadow-sm flex items-center justify-center gap-2"
              >
                <Zap size={16} fill="white" strokeWidth={1} />
                Quick Pay
              </Button>
              <Button
                onClick={() => onUpdateStatus(order.id, "COMPLETED")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] h-12 uppercase tracking-widest border-none shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} strokeWidth={2} />
                Finalize
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Item Popover Replacement: Centered Modal for better management */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Customize: ${editingItem?.dish?.name || "Dish"}`}
        size="2xl"
      >
        {editingItem && (
          <EditOrderItemForm
            item={editingItem}
            onSave={(updated) => {
              onEditItem(editingItem.id, updated);
              setEditingItem(null);
            }}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
}
