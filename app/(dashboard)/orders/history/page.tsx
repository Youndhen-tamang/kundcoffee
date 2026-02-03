"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { HistoryView } from "@/components/orders/HistoryView"; // Reuse the component we made
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OrderHistoryPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="p-8 space-y-6 bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="secondary" className="p-2 h-10 w-10 rounded-full bg-white border-zinc-200">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">Order History</h1>
            <p className="text-xs text-zinc-500 font-medium">View and manage past transactions</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
        <HistoryView onViewDetails={(order) => setSelectedOrder(order)} />
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        size="5xl"
      >
        {selectedOrder && (
          <OrderDetailView
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            // Pass empty functions because History is Read-Only
            onUpdateStatus={() => {}}
            onUpdateItemStatus={() => {}}
            onEditItem={() => {}}
            onCheckout={() => {}}
            onAddMore={() => {}}
          />
        )}
      </Modal>
    </div>
  );
}