"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Scale, Type, AlignLeft } from "lucide-react";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unit?: any | null;
}

export default function UnitModal({
  isOpen,
  onClose,
  onSuccess,
  unit,
}: UnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || "",
        shortName: unit.shortName || "",
        description: unit.description || "",
      });
    } else {
      setFormData({
        name: "",
        shortName: "",
        description: "",
      });
    }
  }, [unit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = unit
        ? `/api/inventory/measuring-unit/${unit.id}`
        : "/api/inventory/measuring-unit";
      const method = unit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(unit ? "Unit updated" : "Unit created");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save unit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? "Edit Measuring Unit" : "Create New Unit"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-zinc-950">
        <div className="bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Unit Full Name *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-zinc-400">
                <Scale className="h-4 w-4" />
              </div>
              <input
                required
                placeholder="e.g. Kilogram"
                className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Short Name / Symbol *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-zinc-400">
                <Type className="h-4 w-4" />
              </div>
              <input
                required
                placeholder="e.g. kg"
                className="w-full h-11 pl-11 pr-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                value={formData.shortName}
                onChange={(e) =>
                  setFormData({ ...formData, shortName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Description / Notes
            </label>
            <div className="relative flex items-start">
              <div className="absolute left-4 top-3 text-zinc-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <textarea
                placeholder="Optional details about how this unit is used..."
                className="w-full p-4 pl-11 border border-zinc-200 rounded-2xl min-h-[100px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-zinc-900 shadow-sm"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
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
            {loading ? "Saving..." : unit ? "Update Unit" : "Save Unit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
