"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={group ? "Edit Stock Group" : "Create Stock Group"}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Group Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vegetables, Dairy, Spices"
            className="w-full h-12 px-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full h-32 p-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
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
            {loading ? "Saving..." : group ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
