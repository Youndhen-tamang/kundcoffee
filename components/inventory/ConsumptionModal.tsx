"use client";

import { SidePanel } from "@/components/ui/SidePanel";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { toast } from "sonner";
import { Package, TrendingDown } from "lucide-react";

interface ConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stocks: any[];
}

export default function ConsumptionModal({
  isOpen,
  onClose,
  onSuccess,
  stocks,
}: ConsumptionModalProps) {
  const [stockId, setStockId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!stockId || !quantity) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/inventory/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId, quantity: parseFloat(quantity) }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Consumption recorded");
        onSuccess();
        onClose();
        setStockId("");
        setQuantity("");
      } else {
        toast.error(data.message || "Failed to record consumption");
      }
    } catch (error) {
      toast.error("Error recording consumption");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Record Consumption">
      <div className="space-y-6 pb-20">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Select Stock Item <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <select
              required
              value={stockId}
              onChange={(e) => setStockId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900 appearance-none"
            >
              <option value="">Choose an item...</option>
              {stocks.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.quantity} {s.unit?.shortName} available)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Quantity Used <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="number"
              step="0.01"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-3">
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
          disabled={loading}
        >
          {loading ? "Recording..." : "Record Consumption"}
        </Button>
      </div>
    </SidePanel>
  );
}
