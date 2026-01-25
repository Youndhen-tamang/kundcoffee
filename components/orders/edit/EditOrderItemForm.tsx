"use client";

import { useState, useEffect } from "react";
import { OrderItem, AddOn, Dish } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Plus, Minus, Check, X } from "lucide-react";
import { getAddOns } from "@/services/menu";

interface EditOrderItemFormProps {
  item: OrderItem;
  onSave: (updatedItem: Partial<OrderItem>) => void;
  onCancel: () => void;
}

export function EditOrderItemForm({
  item,
  onSave,
  onCancel,
}: EditOrderItemFormProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [remarks, setRemarks] = useState(item.remarks || "");
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(
    (item.selectedAddOns || []).map((a) => a.addOnId),
  );

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    const addons = await getAddOns();
    setAvailableAddOns(addons);
  };

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    onSave({
      id: item.id,
      quantity,
      remarks,
      // Pass the selected addon IDs. The parent or service will handle the merge.
      // For simplicity, we'll assume the onSave handler knows how to deal with this.
      selectedAddOns: selectedAddOnIds.map((id) => {
        const addon = availableAddOns.find((a) => a.id === id);
        return {
          addOnId: id,
          quantity: 1, // Default to 1 for simplicity
          unitPrice: addon?.price?.listedPrice || 0,
        } as any;
      }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-gray-100 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Quantity
          </span>
          <span className="text-xl font-black text-gray-900">{quantity}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-gray-900 hover:text-violet-600 transition-colors"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-gray-900 hover:text-violet-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
          Available Add-ons / Extras
        </label>
        <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {availableAddOns.map((addon) => (
            <button
              key={addon.id}
              onClick={() => handleToggleAddOn(addon.id)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                selectedAddOnIds.includes(addon.id)
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
              }`}
            >
              <div className="flex flex-col items-start px-1">
                <span className="text-xs font-bold truncate max-w-[100px]">
                  {addon.name}
                </span>
                <span className="text-[10px] opacity-70">
                  ${addon.price?.listedPrice.toFixed(2)}
                </span>
              </div>
              {selectedAddOnIds.includes(addon.id) && (
                <Check size={14} className="text-violet-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
          Remarks / Notes
        </label>
        <textarea
          placeholder="Add specific instructions for this dish..."
          className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all h-24 resize-none font-medium"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="pt-4 border-t border-gray-100 flex gap-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1 font-bold h-11 border-gray-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-black h-11 shadow-lg shadow-violet-200 border-none uppercase"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
