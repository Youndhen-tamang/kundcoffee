"use client";

"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Supplier, Stock } from "@/lib/types";
import { toast } from "sonner";
import { Trash2, Plus, User } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  const [formData, setFormData] = useState({
    supplierId: "",
    txnDate: new Date().toISOString().split("T")[0],
    items: [{ itemName: "", stockId: "", quantity: 1, rate: 0, amount: 0 }],
    taxableAmount: 0,
    totalAmount: 0,
    discount: 0,
    roundOff: 0,
    paymentStatus: "PENDING" as "PENDING" | "PAID",
    paymentMode: "CASH" as any,
    remark: "",
    staffId: "",
    attachment: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setFormData({
        supplierId: "",
        txnDate: new Date().toISOString().split("T")[0],
        items: [{ itemName: "", stockId: "", quantity: 1, rate: 0, amount: 0 }],
        taxableAmount: 0,
        totalAmount: 0,
        discount: 0,
        roundOff: 0,
        paymentStatus: "PENDING",
        paymentMode: "CASH",
        remark: "",
        staffId: "",
        attachment: "",
      });
      setImageFile(null);
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [suppRes, stockRes, staffRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/stocks"),
        fetch("/api/staff"),
      ]);
      const suppData = await suppRes.json();
      const stockData = await stockRes.json();
      const staffData = await staffRes.json();

      if (suppData.success) setSuppliers(suppData.data.suppliers);
      if (stockData.success) setStocks(stockData.data);
      if (staffData.success) setStaff(staffData.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const calculateTotals = (
    items: any[],
    discount: number,
    roundOff: number,
  ) => {
    const taxable = items.reduce((sum, item) => sum + item.amount, 0);
    const total = taxable - discount + roundOff;
    setFormData((prev) => ({
      ...prev,
      items,
      taxableAmount: taxable,
      totalAmount: total,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      newItems[index].amount =
        (newItems[index].quantity || 0) * (newItems[index].rate || 0);
    }

    if (field === "stockId") {
      const selectedStock = stocks.find((s) => s.id === value);
      if (selectedStock) {
        newItems[index].itemName = selectedStock.name;
      }
    }

    calculateTotals(newItems, formData.discount, formData.roundOff);
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemName: "", stockId: "", quantity: 1, rate: 0, amount: 0 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(newItems, formData.discount, formData.roundOff);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) return toast.error("Please select a supplier");
    if (formData.items.some((it) => !it.itemName || it.amount <= 0))
      return toast.error("Please fill all items correctly");

    setLoading(true);
    try {
      let attachmentUrl = formData.attachment;

      if (imageFile instanceof File) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("folder", "purchases");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          attachmentUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attachment: attachmentUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Purchase recorded successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to record purchase");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Purchase Bill"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-zinc-900">
        <div className="p-4 border border-zinc-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md">
          <div className="space-y-1">
            <label className="pos-label">Supplier *</label>
            <select
              className="pos-input w-full"
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({ ...formData, supplierId: e.target.value })
              }
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Bill Date *"
            type="date"
            value={formData.txnDate}
            onChange={(e) =>
              setFormData({ ...formData, txnDate: e.target.value })
            }
            required
          />

          <div className="space-y-1">
            <label className="pos-label">Staff Incharge</label>
            <select
              className="pos-input w-full"
              value={formData.staffId}
              onChange={(e) =>
                setFormData({ ...formData, staffId: e.target.value })
              }
            >
              <option value="">Select Receiver</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 border border-zinc-200 bg-white rounded-md">
          <ImageUpload
            label="Bill Attachment"
            value={typeof imageFile === "string" ? imageFile : undefined}
            onChange={setImageFile}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
            <h4 className="text-sm font-semibold text-zinc-900">
              Purchase Items
            </h4>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addItem}
            >
              + Add Item
            </Button>
          </div>

          <div className="border border-zinc-200 overflow-hidden rounded-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="pos-table-header border-none">
                    Item Description
                  </th>
                  <th className="pos-table-header border-none text-center w-24">
                    Qty
                  </th>
                  <th className="pos-table-header border-none text-center w-32">
                    Rate
                  </th>
                  <th className="pos-table-header border-none text-right w-32">
                    Amount
                  </th>
                  <th className="pos-table-header border-none w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {formData.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="pos-table-cell">
                      <div className="space-y-2">
                        <select
                          className="pos-input w-full"
                          value={item.stockId}
                          onChange={(e) =>
                            handleItemChange(idx, "stockId", e.target.value)
                          }
                        >
                          <option value="">Choose item...</option>
                          {stocks.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.unit?.shortName || "unit"})
                            </option>
                          ))}
                        </select>
                        {!item.stockId && (
                          <input
                            placeholder="Type item name..."
                            className="pos-input w-full h-8 text-xs italic bg-zinc-50 capitalize"
                            value={item.itemName}
                            onChange={(e) =>
                              handleItemChange(idx, "itemName", e.target.value)
                            }
                          />
                        )}
                      </div>
                    </td>
                    <td className="pos-table-cell">
                      <Input
                        type="number"
                        step="any"
                        className="text-center h-8"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    <td className="pos-table-cell">
                      <Input
                        type="number"
                        step="any"
                        className="text-center h-8"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "rate",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    <td className="pos-table-cell text-right font-medium text-zinc-900">
                      {item.amount.toLocaleString()}
                    </td>
                    <td className="pos-table-cell text-center">
                      <button
                        type="button"
                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                        onClick={() => removeItem(idx)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <label className="pos-label">Remarks / Notes</label>
            <textarea
              placeholder="Internal notes..."
              className="pos-input w-full min-h-[120px] p-3 resize-none"
              value={formData.remark}
              onChange={(e) =>
                setFormData({ ...formData, remark: e.target.value })
              }
            />
          </div>

          <div className="w-80 p-5 bg-zinc-50 border border-zinc-200 rounded-md space-y-3">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Sub Total</span>
              <span className="font-medium text-zinc-900">
                {formData.taxableAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>Discount</span>
              <Input
                type="number"
                className="w-24 h-7 text-right"
                value={formData.discount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, discount: val });
                  calculateTotals(formData.items, val, formData.roundOff);
                }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-500">
              <span>Round Off</span>
              <Input
                type="number"
                className="w-24 h-7 text-right"
                value={formData.roundOff}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, roundOff: val });
                  calculateTotals(formData.items, formData.discount, val);
                }}
              />
            </div>

            <div className="border-t border-zinc-200 pt-3 mt-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] uppercase font-bold text-zinc-400">
                  Total Payable
                </span>
                <span className="text-2xl font-bold text-zinc-900">
                  {formData.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  checked={formData.paymentStatus === "PAID"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentStatus: e.target.checked ? "PAID" : "PENDING",
                    })
                  }
                />
                <span className="text-xs font-medium text-zinc-700">
                  Mark as Paid
                </span>
              </label>

              {formData.paymentStatus === "PAID" && (
                <div className="space-y-1">
                  <label className="pos-label">Payment Mode</label>
                  <select
                    className="pos-input w-full h-8 text-xs"
                    value={formData.paymentMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMode: e.target.value as any,
                      })
                    }
                  >
                    <option value="CASH">Cash</option>
                    <option value="ESEWA">Digital - eSewa</option>
                    <option value="BANK_TRANSFER">Bank Settlement</option>
                    <option value="QR">Fonepay / QR Scan</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button
            type="button"
            variant="ghost"
            className="text-zinc-500 hover:text-zinc-900"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? "Processing..." : "Save Bill"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
