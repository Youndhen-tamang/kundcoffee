"use client";

import { useState, useEffect } from "react";
import { SidePanel } from "@/components/ui/SidePanel";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stock?: any | null;
  units: any[];
  groups: any[];
}

export default function StockModal({
  isOpen,
  onClose,
  onSuccess,
  stock,
  units,
  groups,
}: StockModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    unitId: "",
    groupId: "",
    quantity: 0,
    amount: 0,
  });

  useEffect(() => {
    if (stock) {
      setFormData({
        name: stock.name || "",
        unitId: stock.unitId || "",
        groupId: stock.groupId || "",
        quantity: stock.quantity || 0,
        amount: stock.amount || 0,
      });
    } else {
      setFormData({
        name: "",
        unitId: units.length > 0 ? units[0].id : "",
        groupId: "",
        quantity: 0,
        amount: 0,
      });
    }
  }, [stock, isOpen, units]);

  const handleSubmit = async () => {
    if (!formData.unitId) {
      toast.error("Please select a measuring unit");
      return;
    }
    setLoading(true);

    try {
      const url = stock ? `/api/stocks/${stock.id}` : "/api/stocks";
      const method = stock ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(stock ? "Stock updated" : "Stock created");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save stock item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={stock ? "Edit Stock Item" : "Add New Stock Item"}
    >
      <div className="space-y-4 px-1 py-4">
        <Input
          label="Item Name"
          required
          placeholder="e.g. Fresh Milk"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="pos-label">Measuring Unit *</label>
            <select
              required
              className="pos-input w-full"
              value={formData.unitId}
              onChange={(e) =>
                setFormData({ ...formData, unitId: e.target.value })
              }
            >
              <option value="" disabled>
                Select Unit
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.shortName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="pos-label">Stock Group</label>
            <select
              className="pos-input w-full"
              value={formData.groupId}
              onChange={(e) =>
                setFormData({ ...formData, groupId: e.target.value })
              }
            >
              <option value="">No Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 mt-4">
          <Input
            label="Current Quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseFloat(e.target.value) || 0,
              })
            }
          />

          <Input
            label="Total Value (Amt)"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
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
          {loading ? "Saving..." : stock ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </SidePanel>
  );
}
