"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CustomTable } from "@/components/ui/CustomTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrendingDown, Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import ConsumptionModal from "@/components/inventory/ConsumptionModal";

export default function ConsumptionPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consRes, stocksRes] = await Promise.all([
        fetch("/api/inventory/consumptions"),
        fetch("/api/stocks"),
      ]);
      const consData = await consRes.json();
      const stocksData = await stocksRes.json();

      if (consData.success) setConsumptions(consData.data);
      if (stocksData.success) setStocks(stocksData.data);
    } catch (error) {
      toast.error("Failed to fetch consumption data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredConsumptions = consumptions.filter((c) =>
    c.stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="px-6 py-10">
      <PageHeaderAction
        title="Stock Consumption"
        description="Track and record stock usage"
        onSearch={setSearchQuery}
        actionButton={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
          >
            Record Consumption
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Recent Consumptions" value={consumptions.length} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Stock Item
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Quantity Used
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Linked To
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest text-right">
                Recorded At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredConsumptions.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-zinc-900">
                    {c.stock.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-red-600">
                    -{c.quantity} {c.stock.unit?.shortName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {c.dish?.name ||
                      c.addOn?.name ||
                      c.combo?.name ||
                      "Manual Record"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-mono text-zinc-400 text-[10px] font-bold uppercase">
                    Recently Recorded
                  </span>
                </td>
              </tr>
            ))}
            {filteredConsumptions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-zinc-500">
                  No consumption records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConsumptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        stocks={stocks}
      />
    </div>
  );
}
