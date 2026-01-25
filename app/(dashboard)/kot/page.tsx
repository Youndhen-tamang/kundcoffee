"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem, OrderStatus, KOTType } from "@/lib/types";
import { getOrders, updateOrderItemStatus } from "@/services/order";
import { KOTCard } from "@/components/kot/KOTCard";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import {
  UtensilsCrossed,
  Search,
  Filter,
  ChefHat,
  Wine,
  LayoutGrid,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function KOTPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredKOTs, setFilteredKOTs] = useState<
    { type: KOTType; order: Order; items: OrderItem[] }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE"); // ACTIVE: PENDING/PREPARING

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders(data);
    processKOTs(data, searchQuery, statusFilter);
  };

  const processKOTs = (data: Order[], query: string, status: string) => {
    let kots: { type: KOTType; order: Order; items: OrderItem[] }[] = [];

    data.forEach((order) => {
      // Split items by KOT type
      const kitchenItems = order.items.filter(
        (i) => i.dish?.kotType === "KITCHEN",
      );
      const barItems = order.items.filter((i) => i.dish?.kotType === "BAR");

      if (kitchenItems.length > 0) {
        kots.push({ type: "KITCHEN", order, items: kitchenItems });
      }
      if (barItems.length > 0) {
        kots.push({ type: "BAR", order, items: barItems });
      }
    });

    // Filter by search
    if (query) {
      kots = kots.filter(
        (k) =>
          k.order.id.toLowerCase().includes(query.toLowerCase()) ||
          k.order.table?.name.toLowerCase().includes(query.toLowerCase()) ||
          k.items.some((i) =>
            i.dish?.name.toLowerCase().includes(query.toLowerCase()),
          ),
      );
    }

    // Filter by status
    if (status === "ACTIVE") {
      kots = kots.filter((k) =>
        k.items.some(
          (i) =>
            (i.status || "PENDING") === "PENDING" ||
            (i.status || "PENDING") === "PREPARING",
        ),
      );
    } else if (status === "COMPLETED") {
      kots = kots.filter((k) =>
        k.items.every(
          (i) =>
            (i.status || "PENDING") === "READYTOPICK" ||
            itemStatusIsServed(i.status),
        ),
      );
    }

    setFilteredKOTs(kots);
  };

  const itemStatusIsServed = (status?: string) => {
    return status === "SERVED" || status === "COMPLETED";
  };

  useEffect(() => {
    processKOTs(orders, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, orders]);

  const handleUpdateItemStatus = async (
    itemIds: string[],
    status: OrderStatus,
  ) => {
    // In a real app, this might be a bulk update
    for (const id of itemIds) {
      await updateOrderItemStatus(id, status);
    }
    fetchOrders();
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            KOT Management
            <span className="text-sm font-bold bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
              {filteredKOTs.length} Active
            </span>
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Real-time kitchen and bar order ticket monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="h-10 px-4 bg-white border-gray-200 text-gray-600 font-bold text-xs uppercase shadow-sm"
          >
            <History size={16} className="mr-2" />
            History
          </Button>
          <Button className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase shadow-lg shadow-violet-200 border-none">
            <LayoutGrid size={16} className="mr-2" />
            Grid View
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Quick search by KOT ID, Table, or Item..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-gray-100 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === "ACTIVE" ? "bg-white text-violet-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === "COMPLETED" ? "bg-white text-violet-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Ready/Served
          </button>
        </div>
      </div>

      {/* KOT Board Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Kitchen Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <ChefHat size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-900 border-b-2 border-rose-200 pb-1">
              Kitchen Orders
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKOTs
              .filter((k) => k.type === "KITCHEN")
              .map((kot, idx) => (
                <KOTCard
                  key={kot.order.id + idx}
                  order={kot.order}
                  items={kot.items}
                  type="KITCHEN"
                  onUpdateStatus={handleUpdateItemStatus}
                  onDownload={() => console.log("Download")}
                  onMove={() => console.log("Move")}
                />
              ))}
          </div>
        </div>

        {/* Bar Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Wine size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-900 border-b-2 border-indigo-200 pb-1">
              Bar Orders
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKOTs
              .filter((k) => k.type === "BAR")
              .map((kot, idx) => (
                <KOTCard
                  key={kot.order.id + idx}
                  order={kot.order}
                  items={kot.items}
                  type="BAR"
                  onUpdateStatus={handleUpdateItemStatus}
                  onDownload={() => console.log("Download")}
                  onMove={() => console.log("Move")}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredKOTs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 gap-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-100">
            <ChefHat size={40} className="text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-gray-900">All clear!</h3>
            <p className="text-gray-500 font-medium text-sm">
              No pending tickets in the kitchen or bar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
