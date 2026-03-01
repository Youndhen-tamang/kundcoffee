"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Supplier } from "@/lib/types";
import { toast } from "sonner";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplier?: Supplier | null;
}

export default function SupplierModal({
  isOpen,
  onClose,
  onSuccess,
  supplier,
}: SupplierModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    legalName: "",
    taxNumber: "",
    address: "",
    openingBalance: 0,
    openingBalanceType: "CREDIT" as "CREDIT" | "DEBIT",
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        fullName: supplier.fullName || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        legalName: supplier.legalName || "",
        taxNumber: supplier.taxNumber || "",
        address: supplier.address || "",
        openingBalance: supplier.openingBalance || 0,
        openingBalanceType: supplier.openingBalanceType || "CREDIT",
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        legalName: "",
        taxNumber: "",
        address: "",
        openingBalance: 0,
        openingBalanceType: "CREDIT",
      });
    }
  }, [supplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = supplier ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
      const method = supplier ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(supplier ? "Supplier updated" : "Supplier added");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? "Edit Supplier" : "Add Supplier"}
    >
      <form onSubmit={handleSubmit} className="space-y-8 text-zinc-950">
        <div className="space-y-6">
          {/* Section: Contact Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Contact Identity
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Full Name *
                </label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <input
                  placeholder="+977-XXXXXXXXXX"
                  className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="vendor@example.com"
                  className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Business Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Business Details
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Legal Entity Name
                </label>
                <input
                  placeholder="e.g. ABC Trading Pvt. Ltd."
                  className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                  value={formData.legalName}
                  onChange={(e) =>
                    setFormData({ ...formData, legalName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Tax No (PAN/VAT)
                </label>
                <input
                  placeholder="9-digit PAN or VAT"
                  className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold text-zinc-900 shadow-sm"
                  value={formData.taxNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, taxNumber: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Physical Address
                </label>
                <textarea
                  placeholder="City, Street, Ward No..."
                  className="w-full p-4 border border-zinc-200 rounded-2xl min-h-[100px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-zinc-900 shadow-sm"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Financial Setup */}
          {!supplier && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-1 w-8 bg-amber-500 rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Financial Setup
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/10 p-5 rounded-3xl border border-amber-100/50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full h-11 px-4 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-black text-zinc-900 shadow-sm"
                    value={formData.openingBalance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openingBalance: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">
                    Balance Type
                  </label>
                  <select
                    className="w-full h-11 px-4 border border-zinc-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold text-zinc-900 shadow-sm appearance-none"
                    value={formData.openingBalanceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openingBalanceType: e.target.value as any,
                      })
                    }
                  >
                    <option value="CREDIT">CREDIT (Payable Balance)</option>
                    <option value="DEBIT">DEBIT (Advancce/Debit)</option>
                  </select>
                </div>
                <p className="md:col-span-2 text-[10px] text-zinc-400 italic px-1">
                  * Opening balance sets the starting point for this supplier's
                  ledger.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
          <Button
            type="button"
            variant="ghost"
            className="px-6 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-10 rounded-xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {loading
              ? "Saving..."
              : supplier
                ? "Update Profile"
                : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
