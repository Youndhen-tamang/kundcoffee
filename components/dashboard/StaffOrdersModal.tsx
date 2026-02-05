"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Receipt, Calendar, CheckCircle2, Clock } from "lucide-react";

interface StaffOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  staffName: string;
}

export default function StaffOrdersModal({
  isOpen,
  onClose,
  staffId,
  staffName,
}: StaffOrdersModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && staffId) {
      setLoading(true);
      fetch(`/api/staff/${staffId}/orders`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrders(data.data.orders);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, staffId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orders Handled by ${staffName}`}
      size="4xl"
    >
      <div className="p-6 bg-zinc-50 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
            <Receipt size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-bold">
              No orders found for this staff member.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <Receipt size={20} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                      {order.table}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(order.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      Items
                    </p>
                    <p className="text-sm font-bold text-zinc-900">
                      {order.itemCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      Total
                    </p>
                    <p className="text-sm font-bold text-zinc-900">
                      Rs. {order.total}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === "COMPLETED" || order.status === "SERVED"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
