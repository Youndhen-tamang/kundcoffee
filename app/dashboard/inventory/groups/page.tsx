"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CustomTable } from "@/components/ui/CustomTable";
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
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Stock Groups
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Categorize your stock items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditingGroup(null);
              setIsModalOpen(true);
            }}
            className="rounded-2xl h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-xl shadow-zinc-200 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Stock Group
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Groups" value={groups.length} icon={Layers} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              placeholder="Search groups..."
              className="w-full h-11 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CustomTable
          columns={[
            {
              header: "Group Name",
              accessor: (g: any) => (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <Layers className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{g.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                      {g.description || "No description"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Associated Stocks",
              accessor: (g: any) => (
                <span className="px-3 py-1 bg-zinc-50 rounded-lg border border-zinc-100 text-xs font-black text-zinc-600 font-mono">
                  {g._count?.stocks || 0} Items
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (g: any) => (
                <div className="flex gap-2">
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-emerald-50 rounded-xl transition-colors"
                    onClick={() => {
                      setEditingGroup(g);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-rose-50 rounded-xl transition-colors"
                    onClick={() => setDeleteId(g.id)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredGroups}
        />
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
