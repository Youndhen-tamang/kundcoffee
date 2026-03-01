"use client";

import { useState, useEffect } from "react";
import { SidePanel } from "@/components/ui/SidePanel";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Package, Scale, Calculator, DollarSign } from "lucide-react";

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
      <div className="space-y-6 pb-20">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Item Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              required
              placeholder="e.g. Fresh Milk, Coffee Beans"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Measuring Unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900 appearance-none"
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
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Stock Group
            </label>
            <div className="relative">
              <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900 appearance-none"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Current Quantity
            </label>
            <div className="relative">
              <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Total Value (Amt)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
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
          {loading ? "Saving..." : stock ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </SidePanel>
  );
}
