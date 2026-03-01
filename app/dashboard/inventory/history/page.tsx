"use client";

import { useEffect, useState } from "react";
import { CustomTable } from "@/components/ui/CustomTable";
import { History, ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StockHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/history");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch stock history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredHistory = history.filter(
    (h) =>
      h.stockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.reference.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Stock History
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Audit log of all stock movements
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
        <div className="p-6 border-b border-zinc-50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              placeholder="Filter by item or reference..."
              className="w-full h-11 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CustomTable
          columns={[
            {
              header: "Movement",
              accessor: (h: any) => (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      h.type === "PURCHASE"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {h.type === "PURCHASE" ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownLeft size={16} />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 block">
                      {h.stockName}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                      {h.type}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Quantity",
              accessor: (h: any) => (
                <span
                  className={`font-bold ${h.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {h.quantity > 0 ? "+" : ""}
                  {h.quantity} {h.unit}
                </span>
              ),
            },
            {
              header: "Reference",
              accessor: (h: any) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-700">
                    {h.reference}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {h.entity}
                  </span>
                </div>
              ),
            },
            {
              header: "Date",
              accessor: (h: any) => (
                <span className="text-xs font-mono text-zinc-500">
                  {format(new Date(h.date), "MMM dd, yyyy HH:mm")}
                </span>
              ),
            },
          ]}
          data={filteredHistory}
        />
      </div>
    </div>
  );
}
