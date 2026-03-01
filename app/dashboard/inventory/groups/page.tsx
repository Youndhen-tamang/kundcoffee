"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Layers, Plus, Search, Trash2, Edit2, Package } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";
import StockGroupModal from "@/components/inventory/StockGroupModal";

export default function StockGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/groups");
      const data = await res.json();
      if (data.success) {
        setGroups(data.data);
        setFilteredGroups(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch stock groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredGroups(
      groups.filter(
        (g) =>
          g.name.toLowerCase().includes(lowerQuery) ||
          g.description?.toLowerCase().includes(lowerQuery),
      ),
    );
  }, [searchQuery, groups]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/inventory/groups/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stock group deleted successfully");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete group");
      }
    } catch (error) {
      toast.error("Error deleting stock group");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="px-6 py-10">
      <PageHeaderAction
        title="Stock Groups"
        description="Categorize your stock items"
        onSearch={setSearchQuery}
        actionButton={
          <Button
            onClick={() => {
              setEditingGroup(null);
              setIsModalOpen(true);
            }}
            className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
          >
            Add Stock Group
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Groups" value={groups.length} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Group Name
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Associated Stocks
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredGroups.map((g) => (
              <tr
                key={g.id}
                onClick={() => {
                  setEditingGroup(g);
                  setIsModalOpen(true);
                }}
                className="hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">{g.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {g.description || "No description"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-50 rounded border border-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                    {g._count?.stocks || 0} Items
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGroup(g);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(g.id);
                      }}
                      className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-zinc-500">
                  No stock groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StockGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        group={editingGroup}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Stock Group"
        message="Are you sure you want to delete this group? It can only be deleted if no stock items are assigned to it."
        confirmVariant="danger"
      />
    </div>
  );
}
