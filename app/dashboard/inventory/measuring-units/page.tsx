"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { CustomTable } from "@/components/ui/CustomTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { Scale, Plus, Search, Trash2, Edit2, History } from "lucide-react";
import UnitModal from "@/components/inventory/UnitModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function MeasuringUnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/measuring-unit");
      const data = await res.json();
      if (data.success) {
        setUnits(data.data);
        setFilteredUnits(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredUnits(
      units.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerQuery) ||
          u.shortName.toLowerCase().includes(lowerQuery),
      ),
    );
  }, [searchQuery, units]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/inventory/measuring-unit/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Unit deleted successfully");
        fetchUnits();
      } else {
        toast.error(data.message || "Failed to delete unit");
      }
    } catch (error) {
      toast.error("Error deleting unit");
    } finally {
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const openEdit = (unit: any) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Measuring Units
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Manage inventory units and symbols
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="rounded-2xl h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-xl shadow-zinc-200 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> Add New Unit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Units" value={units.length} icon={Scale} />
        <MetricCard
          title="Most Used"
          value={units.length > 0 ? units[0].shortName : "N/A"}
          icon={History}
        />
        <MetricCard title="System Default" value="Metric" icon={Scale} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              placeholder="Search by name or short name..."
              className="w-full h-11 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CustomTable
          columns={[
            {
              header: "Unit Name",
              accessor: (u: any) => (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <span className="text-xs font-black text-zinc-400 uppercase">
                      {u.shortName}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{u.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                      System Unit
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Symbol",
              accessor: (u: any) => (
                <span className="px-3 py-1 bg-zinc-50 rounded-lg border border-zinc-100 text-xs font-black text-zinc-600 font-mono">
                  {u.shortName}
                </span>
              ),
            },
            {
              header: "Description",
              accessor: (u: any) => (
                <span className="text-sm text-zinc-500 font-medium">
                  {u.description || "—"}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (u: any) => (
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-emerald-50 rounded-xl transition-colors"
                    onClick={() => openEdit(u)}
                  >
                    <Edit2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-rose-50 rounded-xl transition-colors"
                    onClick={() => setDeleteId(u.id)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredUnits}
        />
      </div>

      <UnitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUnits}
        unit={editingUnit}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Measuring Unit"
        message="Are you sure you want to delete this unit? This will only succeed if the unit is not currently linked to any stock items."
        confirmVariant="danger"
      />
    </div>
  );
}
