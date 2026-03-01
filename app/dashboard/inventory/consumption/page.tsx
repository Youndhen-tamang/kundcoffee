"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CustomTable } from "@/components/ui/CustomTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrendingDown, Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ConsumptionModal from "@/components/inventory/ConsumptionModal";

export default function ConsumptionPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Stock Consumption
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Track and record stock usage
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-xl shadow-zinc-200 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" /> Record Consumption
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Recent Consumptions"
          value={consumptions.length}
          icon={TrendingDown}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
        <CustomTable
          columns={[
            {
              header: "Stock Item",
              accessor: (c: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <Package className="h-5 w-5 text-zinc-400" />
                  </div>
                  <span className="font-bold text-zinc-900">
                    {c.stock.name}
                  </span>
                </div>
              ),
            },
            {
              header: "Quantity Used",
              accessor: (c: any) => (
                <span className="font-bold text-rose-500">
                  -{c.quantity} {c.stock.unit?.shortName}
                </span>
              ),
            },
            {
              header: "Linked To",
              accessor: (c: any) => (
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  {c.dish?.name ||
                    c.addOn?.name ||
                    c.combo?.name ||
                    "Manual Record"}
                </span>
              ),
            },
            {
              header: "Recorded At",
              accessor: (c: any) => (
                <span className="text-xs font-mono text-zinc-400">
                  {/* StockConsumption currently uses ID for order, assuming most recent first */}
                  Recently Recorded
                </span>
              ),
            },
          ]}
          data={consumptions}
        />
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
