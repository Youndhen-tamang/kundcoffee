"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  CreditCard,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { useSettings } from "@/components/providers/SettingsProvider";

type MetricType =
  | "SALES"
  | "PURCHASE"
  | "INCOME"
  | "EXPENSES"
  | "PAYMENT_IN"
  | "PAYMENT_OUT";

export default function DashboardMetrics() {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<MetricType>("SALES");

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/dashboard/metrics?filter=this_month");
        const data = await res.json();
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const metricConfig = {
    SALES: {
      label: "Total Sales",
      value: metrics.sales,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    PURCHASE: {
      label: "Total Purchase",
      value: metrics.purchases,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    INCOME: {
      label: "Total Income",
      value: metrics.income,
      icon: Wallet,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    EXPENSES: {
      label: "Total Expenses",
      value: metrics.expenses,
      icon: CreditCard,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    PAYMENT_IN: {
      label: "Payment In",
      value: metrics.paymentIn,
      icon: ArrowDownLeft,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    PAYMENT_OUT: {
      label: "Payment Out",
      value: metrics.paymentOut,
      icon: ArrowUpRight,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  };

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(metricConfig) as MetricType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeType === type
                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Main Metric Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary Selected Metric */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                {metricConfig[activeType].label}
              </h3>
              <p className="text-4xl font-black text-zinc-900 tracking-tight">
                {settings.currency}{" "}
                {(metricConfig[activeType].value || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-zinc-400">This Month</p>
            </div>
            <div className={`p-6 rounded-2xl ${metricConfig[activeType].bg}`}>
              {(() => {
                const Icon = metricConfig[activeType].icon;
                return (
                  <Icon size={32} className={metricConfig[activeType].color} />
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Overview (Mini Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {(Object.entries(metricConfig) as [MetricType, any][]).map(
          ([key, config]) => {
            if (key === activeType) return null;
            const Icon = config.icon;
            return (
              <div
                key={key}
                onClick={() => setActiveType(key)}
                className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer hover:border-zinc-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${config.bg} group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={14} className={config.color} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">
                  {config.label}
                </p>
                <p className="text-sm font-bold text-zinc-900 mt-1">
                  {settings.currency} {(config.value || 0).toLocaleString()}
                </p>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
