"use client";

import { SidePanel } from "@/components/ui/SidePanel";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";

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
      <div className="space-y-4 px-1 py-4">
        <div className="space-y-1">
          <label className="pos-label">Select Stock Item *</label>
          <select
            required
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="pos-input w-full"
          >
            <option value="">Choose an item...</option>
            {stocks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.quantity} {s.unit?.shortName} available)
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Quantity Used *"
          type="number"
          step="0.01"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 1.5"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200 flex items-center gap-2">
        <Button
          onClick={onClose}
          variant="secondary"
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
          {loading ? "Recording..." : "Record Consumption"}
        </Button>
      </div>
    </SidePanel>
  );
}
