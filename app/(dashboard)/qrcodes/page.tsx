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
    setFilteredQrs(
      qrs.filter(
        (q) =>
          q.table?.name.toLowerCase().includes(lower) ||
          q.value.toLowerCase().includes(lower),
      ),
    );
  }, [searchQuery, qrs]);

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
    <div>
      <PageHeaderAction
        title="QR Codes"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button onClick={() => setIsModalOpen(true)}>Add QR</Button>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
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

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">QR Code</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Table</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredQrs.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16">
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
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.assigned ? "Assigned" : "Unassigned"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredQrs.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8">
                  No QR codes found.
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
        <div className="flex flex-col gap-4 text-center py-4">
          <p className="text-gray-500">
            Select a table to generate a unique QR code.
          </p>
          {/* Placeholder for generation action */}
          <Button onClick={handleGenerate}>Generate Now</Button>
        </div>
      </Modal>
    </div>
  );
}
