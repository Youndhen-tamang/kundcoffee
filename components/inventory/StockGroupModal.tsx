"use client";

import { SidePanel } from "@/components/ui/SidePanel";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";

interface StockGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: any;
}

export default function StockGroupModal({
  isOpen,
  onClose,
  onSuccess,
  group,
}: StockGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [group, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const url = group
        ? `/api/inventory/groups/${group.id}`
        : "/api/inventory/groups";
      const method = group ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(group ? "Group updated" : "Group created");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save stock group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={group ? "Edit Stock Group" : "Create Stock Group"}
    >
      <div className="space-y-6 pb-20">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vegetables, Dairy, Spices"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-11 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all font-medium text-zinc-900 resize-none"
          />
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
          {loading ? "Saving..." : group ? "Update Group" : "Create Group"}
        </Button>
      </div>
    </SidePanel>
  );
}
