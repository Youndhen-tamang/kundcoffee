"use client";

import { useEffect, useState } from "react";
import QrCodeCell from "@/components/QrCodeCell";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// Assuming types since they weren't explicitly exported for QR in previous contexts
interface QRItem {
  id: string;
  value: string;
  assigned: boolean;
  tableId: string;
  table?: { name: string };
}

export default function QRCodesPage() {
  const [qrs, setQrs] = useState<QRItem[]>([]);
  const [filteredQrs, setFilteredQrs] = useState<QRItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"value" | "table" | "status">("table");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    // Fetch logic needs to be client side to match other pages pattern
    async function fetchQR() {
      try {
        const res = await fetch("/api/qrcodes");
        const data = await res.json();
        if (data.qr) {
          setQrs(data.qr);
          setFilteredQrs(data.qr);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchQR();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    let f = qrs.filter(
      (q) =>
        q.table?.name?.toLowerCase().includes(lower) ||
        q.value.toLowerCase().includes(lower),
    );
    const mult = sortDir === "asc" ? 1 : -1;
    f = [...f].sort((a, b) => {
      let va: string | number = "";
      let vb: string | number = "";
      if (sortBy === "value") { va = a.value; vb = b.value; }
      else if (sortBy === "table") { va = a.table?.name || ""; vb = b.table?.name || ""; }
      else { va = a.assigned ? 1 : 0; vb = b.assigned ? 1 : 0; }
      if (typeof va === "string") return mult * String(va).localeCompare(String(vb));
      return mult * (Number(va) - Number(vb));
    });
    setFilteredQrs(f);
  }, [searchQuery, qrs, sortBy, sortDir]);

  const handleExport = () => {
    const headers = ["Value", "Assigned", "Table"];
    const csvContent = [
      headers.join(","),
      ...filteredQrs.map((q) =>
        [q.value, q.assigned ? "Yes" : "No", q.table?.name || "-"].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "qrcodes_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = () => {
    // Logic to generate QR?
    // The user requirement said "Add QR" -> "Centered Modal".
    // I'll place a placeholder form here.
    alert("Generate QR logic to be implemented based on backend requirements.");
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <PageHeaderAction
        title="QR Codes"
        description="Manage your restaurant's digital menus"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            <span className="flex items-center gap-2">Add QR</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total QRs" value={qrs.length} />
        <MetricCard
          title="Assigned"
          value={qrs.filter((q) => q.assigned).length}
        />
        <MetricCard
          title="Unassigned"
          value={qrs.filter((q) => !q.assigned).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 flex-wrap">
          <input
            placeholder="Search QR codes..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-full max-w-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="value">QR Code</option>
              <option value="table">Table</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">QR Code</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Table</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredQrs.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-red-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 p-1">
                    <QrCodeCell value={item.value} />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.table?.name || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.assigned
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.assigned ? "Assigned" : "Unassigned"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredQrs.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">
                  <p>No QR codes found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate QR Code"
      >
        <div className="flex flex-col gap-6 py-4">
          <p className="text-gray-500 text-sm">
            Select a table to generate a unique QR code for digital ordering.
          </p>
          {/* Placeholder for generation action */}
          <Button
            onClick={handleGenerate}
            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            Generate Now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
