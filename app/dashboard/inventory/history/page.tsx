"use client";

import { useEffect, useState } from "react";
import { CustomTable } from "@/components/ui/CustomTable";
import { History, ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";

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
    <div className="px-6 py-10">
      <PageHeaderAction
        title="Stock History"
        description="Audit log of all stock movements"
        onSearch={setSearchQuery}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Movements" value={history.length} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Movement
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Quantity
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Reference
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest text-right">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredHistory.map((h, i) => (
              <tr key={i} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        h.type === "PURCHASE"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {h.type === "PURCHASE" ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownLeft size={14} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">
                        {h.stockName}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {h.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`font-semibold ${h.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {h.quantity > 0 ? "+" : ""}
                    {h.quantity} {h.unit}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-700">
                      {h.reference}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {h.entity}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-mono text-zinc-500">
                    {format(new Date(h.date), "MMM dd, yyyy HH:mm")}
                  </span>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-zinc-500">
                  No movement history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
