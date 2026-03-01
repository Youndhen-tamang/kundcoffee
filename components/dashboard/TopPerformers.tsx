"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Trophy, ArrowRight } from "lucide-react";
import StaffOrdersModal from "./StaffOrdersModal";
import { useSettings } from "@/components/providers/SettingsProvider";

export default function TopPerformers() {
  const { settings } = useSettings();
  const [data, setData] = useState<any>({ topCustomers: [], topStaff: [] });
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/top-performers");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Customers */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <User size={20} className="text-rose-600" />
            </div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
              Top Customers
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {data.topCustomers.map((customer: any, i: number) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">
                    {customer.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Verified Customer
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-zinc-900">
                  {settings.currency} {customer.totalSpent.toLocaleString()}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Total Spend
                </p>
              </div>
            </div>
          ))}
          {data.topCustomers.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-4">
              No customer data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Top Staff */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-xl">
              <ShieldCheck size={20} className="text-violet-600" />
            </div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
              Top Staff
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          {data.topStaff.map((staff: any, i: number) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">
                    {staff.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {staff.role}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-xs font-black text-zinc-900">
                    {staff.ordersHandled}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Orders
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="text-zinc-300 group-hover:text-violet-600 transition-colors"
                />
              </div>
            </div>
          ))}
          {data.topStaff.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-4">
              No staff data available yet.
            </p>
          )}
        </div>
      </div>

      {selectedStaff && (
        <StaffOrdersModal
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
        />
      )}
    </div>
  );
}
