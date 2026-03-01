"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Scale, Type, AlignLeft } from "lucide-react";
import { SidePanel } from "@/components/ui/SidePanel";

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

  const handleSubmit = async () => {
    if (!formData.name || !formData.shortName) {
      toast.error("Please fill in all required fields");
      return;
    }
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
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? "Edit Measuring Unit" : "Create New Unit"}
    >
      <div className="space-y-6 pb-20">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Unit Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              required
              placeholder="e.g. Kilogram"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Short Name / Symbol <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              required
              placeholder="e.g. kg"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
              value={formData.shortName}
              onChange={(e) =>
                setFormData({ ...formData, shortName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Description / Notes
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-4 top-3 h-4 w-4 text-zinc-400" />
            <textarea
              placeholder="Optional details about how this unit is used..."
              className="w-full h-32 p-4 pl-11 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
          {loading ? "Saving..." : unit ? "Update Unit" : "Save Unit"}
        </Button>
      </div>
    </SidePanel>
  );
}
