"use client";

import { Order, OrderItem, OrderStatus, KOTType } from "@/lib/types";
import {
  Clock,
  Loader2,
  CheckCircle2,
  Move,
  Download,
  Printer,
  User,
  ChefHat,
  Wine,
  MoreVertical,
  ArrowRightLeft,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { useState } from "react";

interface KOTCardProps {
  order: Order;
  items: OrderItem[];
  type: KOTType;
  onUpdateStatus: (itemIds: string[], status: OrderStatus) => void;
  onDownload: () => void;
  onMove: () => void;
}

export function KOTCard({
  order,
  items,
  type,
  onUpdateStatus,
  onDownload,
  onMove,
}: KOTCardProps) {
  const [activeItemStatusId, setActiveItemStatusId] = useState<string | null>(
    null,
  );

  const statuses: OrderStatus[] = [
    "PENDING",
    "PREPARING",
    "READYTOPICK",
    "SERVED",
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 font-medium";
      case "PREPARING":
        return "bg-zinc-50 text-zinc-600 border-zinc-100 font-medium";
      case "READYTOPICK":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 font-medium";
      case "SERVED":
        return "bg-zinc-100 text-zinc-400 border-zinc-200 font-medium";
      default:
        return "bg-zinc-50 text-zinc-400 border-zinc-100 font-medium";
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col group relative">
      {/* KOT Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-zinc-900 text-white shadow-sm">
            {type === "BAR" ? <Wine size={16} /> : <ChefHat size={16} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 leading-none tracking-tight">
              KOT #{order.id.slice(-6)}
            </h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1.5">
              Table:{" "}
              <span className="text-zinc-900">
                {order.table?.name || "No Table"}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-none">
            <Clock size={11} />
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      {/* Items List - Printable style */}
      <div className="flex-1 p-5 space-y-2 bg-white">
        {items.map((item, idx) => (
          <div
            key={item.id + idx}
            className="flex items-start justify-between py-1.5 border-b border-zinc-100 last:border-0"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-900 uppercase tracking-tight">
                  {item.quantity} x{" "}
                  {item.dish?.name || item.combo?.name || "Unknown Item"}
                </span>
              </div>
              {item.remarks && (
                <p className="text-[10px] text-zinc-600 font-bold uppercase italic mt-1 bg-zinc-50 px-2 py-0.5 rounded inline-block">
                  Note: {item.remarks}
                </p>
              )}
            </div>
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusColor(item.status || "PENDING")}`}
            >
              {item.status || "PENDING"}
            </span>
          </div>
        ))}
      </div>

      {/* Actions Trigger - Centered Popover */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-center">
        <Popover
          align="left"
          trigger={
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-medium uppercase tracking-widest text-zinc-600 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm">
              Manage KOT <MoreVertical size={14} className="text-zinc-400" />
            </button>
          }
          content={
            <div className="w-52 p-2">
              <div className="px-3 py-2 text-[8px] font-medium text-zinc-500 uppercase tracking-widest">
                Ticket Actions
              </div>
              <div className="grid grid-cols-2 gap-1 p-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      onUpdateStatus(
                        items.map((i) => i.id),
                        s,
                      )
                    }
                    className="text-left px-3 py-1.5 text-[9px] font-medium rounded-md hover:bg-zinc-50 text-zinc-600 uppercase tracking-tight transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="h-px bg-zinc-100 my-2" />
              <div className="space-y-0.5">
                {[
                  {
                    icon: ArrowRightLeft,
                    label: "Transfer KOT",
                    action: onMove,
                  },
                  { icon: Download, label: "Get Ticket", action: onDownload },
                  { icon: Printer, label: "Print Ticket", action: () => {} },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[9px] font-medium text-zinc-700 hover:bg-zinc-50 rounded-md transition-colors uppercase tracking-widest"
                  >
                    <item.icon size={13} className="text-zinc-400" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="h-px bg-zinc-100 my-2" />
              <Button
                onClick={() =>
                  onUpdateStatus(
                    items.map((i) => i.id),
                    "READYTOPICK",
                  )
                }
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-[9px] h-10 uppercase tracking-widest border-none rounded-lg"
              >
                Mark Ready
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
