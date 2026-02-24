"use client";

import { Order, OrderItem, OrderStatus, KOTType } from "@/lib/types";
import {
  Clock,
  ChefHat,
  Wine,
  MoreVertical,
  ArrowRightLeft,
  Download,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";

interface KOTCardProps {
  order: Order;
  items: OrderItem[];
  type: KOTType;
  onUpdateStatus: (itemIds: string[], status: OrderStatus) => void;
  onMove: (order: Order) => void;
}

export function KOTCard({
  order,
  items,
  type,
  onUpdateStatus,
  onMove,
}: KOTCardProps) {
  const statuses: OrderStatus[] = [
    "PENDING",
    "PREPARING",
    "READYTOPICK",
    "SERVED",
  ];

  const handlePrint = () => {
    const WinPrint = window.open("", "", "width=600,height=600");
    if (!WinPrint) return;

    const content = `
      <html>
        <head>
          <title>KOT - ${order.id.slice(-6)}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 10px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed black; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 5px 0; font-size: 14px; }
            .qty { font-weight: bold; width: 30px; }
            .header-text { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-text">KOT: ${type}</div>
            <div>Table: ${order.table?.name || "N/A"}</div>
            <div>ID: #${order.id.slice(-6).toUpperCase()}</div>
            <div>${new Date().toLocaleString()}</div>
          </div>
          <div class="line"></div>
          <table>
            ${items
              .map(
                (item) => `
              <tr>
                <td class="qty">${item.quantity}x</td>
                <td>${item.dish?.name || item.combo?.name}</td>
              </tr>
              ${
                item.remarks
                  ? `<tr><td></td><td style="font-size:12px italic">Note: ${item.remarks}</td></tr>`
                  : ""
              }
            `
              )
              .join("")}
          </table>
          <div class="line"></div>
          <div class="center" style="font-size: 10px; margin-top: 10px;">
            END OF KOT
          </div>
        </body>
      </html>
    `;

    WinPrint.document.write(content);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // --- Download (Get Ticket) Logic ---
  const handleDownload = () => {
    const text = `
KOT TICKET - ${type}
Ticket: #${order.id.slice(-6).toUpperCase()}
Table: ${order.table?.name || "N/A"}
Time: ${new Date(order.createdAt).toLocaleString()}
--------------------------------
${items
  .map(
    (i) =>
      `${i.quantity} x ${i.dish?.name || i.combo?.name}${
        i.remarks ? `\n   Note: ${i.remarks}` : ""
      }`
  )
  .join("\n")}
--------------------------------
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `KOT-${order.id.slice(-4)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "PREPARING":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "READYTOPICK":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "SERVED":
        return "bg-zinc-100 text-zinc-400 border-zinc-200";
      default:
        return "bg-zinc-50";
    }
  };

  return (
    /* Removed 'overflow-hidden' to allow popovers to display outside the card boundaries */
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col group relative z-10">
      {/* UI Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-zinc-900 text-white shadow-sm">
            {type === "BAR" ? <Wine size={16} /> : <ChefHat size={16} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              KOT #{order.id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1">
              Table: {order.table?.name || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
          <Clock size={11} />
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between py-2 border-b border-zinc-50 last:border-0"
          >
            <div className="flex-1">
              <span className="text-[11px] font-bold text-zinc-800 uppercase">
                {item.quantity} x {item.dish?.name || item.combo?.name}
              </span>
              {item.remarks && (
                <p className="text-[9px] text-rose-500 font-bold mt-0.5 italic">
                  Note: {item.remarks}
                </p>
              )}
            </div>

            {/* Individual Item Status Update */}
            <Popover
              align="right"
              trigger={
                <button
                  className={`text-[8px] px-2 py-1 rounded border font-black uppercase transition-all hover:scale-105 ${getStatusColor(
                    item.status || "PENDING"
                  )}`}
                >
                  {item.status || "PENDING"}
                </button>
              }
              content={
                /* Added background, shadow, and z-index to make the menu visible */
                <div className="">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus([item.id], s)}
                      className="text-[9px] font-bold p-2 hover:bg-zinc-100 rounded text-left uppercase text-zinc-600 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex gap-2">
        <Button
          onClick={() => onUpdateStatus(items.map((i) => i.id), "READYTOPICK")}
          className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest border-none gap-2"
        >
          <CheckCircle2 size={14} /> Ready All
        </Button>

        <Popover
          align="right"
          trigger={
            <Button
              variant="secondary"
              className="px-3 h-9 border-zinc-200 text-zinc-400"
            >
              <MoreVertical size={14} />
            </Button>
          }
          content={
            /* Enhanced styling to ensure Ticket Management options are not hidden */
            <div className="">
              <p className="text-[8px] font-black text-zinc-400 uppercase p-2 border-b border-zinc-50 mb-1 tracking-widest">
                Ticket Management
              </p>
              <div className="grid grid-cols-2 gap-1 py-1">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(items.map((i) => i.id), s)}
                    className="text-[9px] font-bold p-2 hover:bg-zinc-50 rounded text-left uppercase text-zinc-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="h-px bg-zinc-100 my-2" />
              <button
                onClick={() => onMove(order)}
                className="w-full flex items-center gap-2 p-2 text-[9px] font-bold hover:bg-zinc-50 rounded uppercase text-zinc-700 transition-colors"
              >
                <ArrowRightLeft size={14} /> Transfer Ticket
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-2 p-2 text-[9px] font-bold hover:bg-zinc-50 rounded uppercase text-zinc-700 transition-colors"
              >
                <Download size={14} /> Get Ticket (.txt)
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2 p-2 text-[9px] font-bold hover:bg-zinc-50 rounded uppercase text-zinc-700 transition-colors"
              >
                <Printer size={14} /> Print KOT
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}