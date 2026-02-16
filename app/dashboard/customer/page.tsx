"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { CustomTable } from "@/components/ui/CustomTable";
import { Customer } from "@/lib/types";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Metrics
  const [toReceive, setToReceive] = useState<number>(0);
  const [toPay, setToPay] = useState<number>(0);
  const [netToReceive, setNetToReceive] = useState<number>(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/customer/summary", { cache: "no-store" }); // singular
        const data: { success: boolean; data: Customer[] } = await res.json();
  
        if (data.success) {
          setCustomers(data.data);
          setFilteredCustomers(data.data);
  
          const receive = data.data.reduce(
            (sum, c) => sum + (c.dueAmount && c.dueAmount > 0 ? c.dueAmount : 0),
            0
          );
  
          const pay = data.data.reduce(
            (sum, c) => sum + (c.dueAmount && c.dueAmount < 0 ? Math.abs(c.dueAmount) : 0),
            0
          );
  
          setToReceive(receive);
          setToPay(pay);
          setNetToReceive(receive - pay);
        }
      } catch (error) {
        console.error("Failed to fetch customer summary", error);
      }
    };
  
    fetchSummary();
  }, []);
  

  // Filter customers based on search query
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(lowerQuery) ||
          c.email?.toLowerCase().includes(lowerQuery) ||
          c.phone?.toLowerCase().includes(lowerQuery) ||
          c.loyaltyId?.toLowerCase().includes(lowerQuery)
      )
    );
  }, [searchQuery, customers]);

  // Export filtered customers to CSV
  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "DOB", "Loyalty ID", "Due Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((c) =>
        [
          c.fullName,
          c.email ?? "",
          c.phone ?? "",
          c.dob ? new Date(c.dob).toLocaleDateString() : "",
          c.loyaltyId ?? "",
          c.dueAmount ?? 0,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customers_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header with Search, Export & Add Customer */}
      <PageHeaderAction
        title="Customers"
        description="Manage all your customers"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button onClick={() => router.push("/dashboard/customers/new")}>Add Customer</Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="To Receive" value={toReceive} />
        <MetricCard title="To Pay" value={toPay} />
        <MetricCard title="Net To Receive" value={netToReceive} />
      </div>

      {/* Customer Table */}
      <CustomTable
        columns={[
          { header: "SN", accessor: (_, i) => i + 1 },
          { header: "Name", accessor: (c: Customer) => c.fullName },
          { header: "Email", accessor: (c: Customer) => c.email ?? "-" },
          { header: "Phone", accessor: (c: Customer) => c.phone ?? "-" },
          {
            header: "DOB",
            accessor: (c: Customer) => (c.dob ? new Date(c.dob).toLocaleDateString() : "-"),
          },
          { header: "Loyalty ID", accessor: (c: Customer) => c.loyaltyId ?? "-" },
          { header: "Due Amount", accessor: (c: Customer) => c.dueAmount ?? 0 },
        ]}
        data={filteredCustomers}
        onRowClick={(c: Customer) => router.push(`/dashboard/customer/${c.id}`)}
      />
    </div>
  );
}
