"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { CustomTable } from "@/components/ui/CustomTable";
import { Supplier } from "@/lib/types";
import { Users, CreditCard, TrendingDown, Edit2, History } from "lucide-react";
import SupplierModal from "@/components/procurement/SupplierModal";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState({
    totalSuppliers: 0,
    totalOutstanding: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setSuppliers(data.data.suppliers);
        setFilteredSuppliers(data.data.suppliers);
        setMetrics(data.data.metrics);
      }
    } catch (error) {
      console.error("Failed to fetch suppliers", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredSuppliers(
      suppliers.filter(
        (s) =>
          s.fullName.toLowerCase().includes(lowerQuery) ||
          s.phone?.toLowerCase().includes(lowerQuery) ||
          s.taxNumber?.toLowerCase().includes(lowerQuery),
      ),
    );
  }, [searchQuery, suppliers]);

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Tax Number",
      "Legal Name",
      "Opening Balance",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredSuppliers.map((s) =>
        [
          s.fullName,
          s.email ?? "",
          s.phone ?? "",
          s.taxNumber ?? "",
          s.legalName ?? "",
          s.openingBalance,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "suppliers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen">
      <PageHeaderAction
        title="Suppliers"
        description="Manage your procurement partners and balances"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button
            onClick={() => {
              setSelectedSupplier(null);
              setIsModalOpen(true);
            }}
          >
            Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Suppliers"
          value={metrics.totalSuppliers}
          icon={Users}
        />
        <MetricCard
          title="Total To Pay"
          value={`Rs. ${(metrics as any).totalToPay?.toLocaleString() || 0}`}
          icon={CreditCard}
          trend="Payables"
        />
        <MetricCard
          title="Total To Receive"
          value={`Rs. ${(metrics as any).totalToReceive?.toLocaleString() || 0}`}
          icon={TrendingDown}
          trend="Receivables"
        />
        <MetricCard
          title="Net Balance"
          value={`Rs. ${(metrics as any).netToReceive?.toLocaleString() || 0}`}
          icon={CreditCard}
          trend="Net"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
            Supplier Directory
          </h3>
          <span className="text-xs text-zinc-400 font-medium">
            {filteredSuppliers.length} records found
          </span>
        </div>
        <CustomTable
          columns={[
            { header: "SN", accessor: (_, i) => i + 1 },
            {
              header: "Name",
              accessor: (s: Supplier) => (
                <div className="flex flex-col py-1">
                  <span className="font-semibold text-zinc-900 leading-tight">
                    {s.fullName}
                  </span>
                  {s.legalName && (
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">
                      {s.legalName}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Phone",
              accessor: (s: Supplier) => (
                <span className="text-zinc-600 font-medium">
                  {s.phone ?? "-"}
                </span>
              ),
            },
            {
              header: "Opening Bal",
              accessor: (s: Supplier) => (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-md ${
                    s.openingBalanceType === "DEBIT"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {s.openingBalanceType === "DEBIT" ? "DR" : "CR"}{" "}
                  {s.openingBalance.toLocaleString()}
                </span>
              ),
            },
            {
              header: "Current Due",
              accessor: (s: any) => (
                <span
                  className={`font-mono font-bold ${s.dueAmount > 0 ? "text-rose-600" : s.dueAmount < 0 ? "text-emerald-600" : "text-zinc-400"}`}
                >
                  {s.dueAmount > 0
                    ? "Payable: "
                    : s.dueAmount < 0
                      ? "Receivable: "
                      : ""}
                  Rs. {Math.abs(s.dueAmount || 0).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Actions",
              accessor: (s: Supplier) => (
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="none"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-full transition-colors"
                    onClick={() => {
                      setSelectedSupplier(s);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-zinc-500" />
                  </Button>
                  <Button
                    variant="none"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-full transition-colors"
                    onClick={() => router.push(`/dashboard/suppliers/${s.id}`)}
                  >
                    <History className="h-4 w-4 text-zinc-500" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredSuppliers}
          onRowClick={(s: Supplier) =>
            router.push(`/dashboard/suppliers/${s.id}`)
          }
        />
      </div>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
        supplier={selectedSupplier}
      />
    </div>
  );
}
