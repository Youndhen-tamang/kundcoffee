"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Modal isOpen={isOpen} onClose={onClose} title="Record Consumption">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Select Stock Item
          </label>
          <select
            required
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="w-full h-12 px-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
          >
            <option value="">Choose an item...</option>
            {stocks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.quantity} {s.unit?.shortName} available)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Quantity Used
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 1.5"
            className="w-full h-12 px-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="none"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-black text-zinc-500 hover:bg-zinc-100 transition-all"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-xl shadow-zinc-200 active:scale-95 transition-all"
          >
            {loading ? "Recording..." : "Record Consumption"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
