"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { CustomTable } from "@/components/ui/CustomTable";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit2,
  History,
  Scale,
  DollarSign,
} from "lucide-react";
import StockModal from "@/components/inventory/StockModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function StocksPage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stocksRes, unitsRes, groupsRes] = await Promise.all([
        fetch("/api/stocks"),
        fetch("/api/inventory/measuring-unit"),
        fetch("/api/inventory/groups"),
      ]);
      const stocksData = await stocksRes.json();
      const unitsData = await unitsRes.json();
      const groupsData = await groupsRes.json();

      if (stocksData.success) {
        setStocks(stocksData.data);
        setFilteredStocks(stocksData.data);
      }
      if (unitsData.success) {
        setUnits(unitsData.data);
      }
      if (groupsData.success) {
        setGroups(groupsData.data);
      }
    } catch (error) {
      toast.error("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredStocks(
      stocks.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.group?.name?.toLowerCase().includes(lowerQuery) ||
          s.unit?.name?.toLowerCase().includes(lowerQuery) ||
          s.unit?.shortName?.toLowerCase().includes(lowerQuery),
      ),
    );
  }, [searchQuery, stocks]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/stocks/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stock item deleted successfully");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete item");
      }
    } catch (error) {
      toast.error("Error deleting stock item");
    } finally {
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEditingStock(null);
    setIsModalOpen(true);
  };

  const openEdit = (stock: any) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  const totalInventoryValue = stocks.reduce(
    (acc, s) => acc + (s.amount || 0),
    0,
  );
  const lowStockItems = stocks.filter((s) => s.quantity < 5).length;

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Inventory Stocks
          </h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Manage raw materials and stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="rounded-2xl h-12 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-black shadow-xl shadow-zinc-200 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Stock Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Items" value={stocks.length} icon={Package} />
        <MetricCard
          title="Total Value"
          value={`Rs. ${totalInventoryValue.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard title="Low Stock" value={lowStockItems} icon={Scale} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-2">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              placeholder="Search by name, group, or unit..."
              className="w-full h-11 pl-12 pr-4 bg-zinc-50 border-none rounded-2xl text-sm font-semibold placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <CustomTable
          columns={[
            {
              header: "Item Name",
              accessor: (s: any) => (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                    <Package className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{s.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                      {s.group?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "Unit",
              accessor: (s: any) => (
                <span className="px-3 py-1 bg-zinc-50 rounded-lg border border-zinc-100 text-xs font-black text-zinc-600 font-mono">
                  {s.unit?.shortName || "—"}
                </span>
              ),
            },
            {
              header: "Current Stock",
              accessor: (s: any) => (
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-bold ${s.quantity < 5 ? "text-rose-500" : "text-zinc-700"}`}
                  >
                    {s.quantity.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase">
                    {s.unit?.shortName}
                  </span>
                </div>
              ),
            },
            {
              header: "Inventory Value",
              accessor: (s: any) => (
                <span className="text-sm font-bold text-emerald-600">
                  Rs. {s.amount.toLocaleString()}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (s: any) => (
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-emerald-50 rounded-xl transition-colors"
                    onClick={() => openEdit(s)}
                  >
                    <Edit2 className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-rose-50 rounded-xl transition-colors"
                    onClick={() => setDeleteId(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredStocks}
        />
      </div>

      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        stock={editingStock}
        units={units}
        groups={groups}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Stock Item"
        message="Are you sure you want to delete this stock item? This action cannot be undone and will only proceed if no transactions are linked."
        confirmVariant="danger"
      />
    </div>
  );
}
