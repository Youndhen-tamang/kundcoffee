"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={stock ? "Edit Stock Item" : "Add New Stock Item"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-zinc-950">
        <div className="bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Item Name *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-zinc-400">
                <Package className="h-4 w-4" />
              </div>
              <input
                required
                placeholder="e.g. Fresh Milk, Coffee Beans"
                className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Measuring Unit *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400">
                  <Scale className="h-4 w-4" />
                </div>
                <select
                  required
                  className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm appearance-none bg-white"
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
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Stock Group
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <select
                  className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm appearance-none bg-white"
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
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Current Quantity
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
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
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Total Value (Amt)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button
            type="button"
            variant="ghost"
            className="px-6 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-8 rounded-xl font-black bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg active:scale-95 transition-all"
          >
            {loading ? "Saving..." : stock ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
