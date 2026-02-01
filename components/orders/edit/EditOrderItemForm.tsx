"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderItem, AddOn } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Plus, Minus, Check } from "lucide-react";
import { getAddOns } from "@/services/menu";
import Image from "next/image";
import { deleteOrderItem } from "@/services/order";
import { toast } from "sonner";

interface EditOrderItemFormProps {
  item: OrderItem;
  onSave: (updatedItem: Partial<OrderItem>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void; // <--- Added
  
}

export function EditOrderItemForm({
  item,
  onSave,
  onCancel,
  onDelete
}: EditOrderItemFormProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [remarks, setRemarks] = useState(item.remarks || "");
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>(
    (item.selectedAddOns || []).map((a) => a.addOnId),
  );

  // 1. Move fetch outside or wrap in useCallback to prevent re-renders
  const fetchAddOns = useCallback(async () => {
    try {
      const addons = await getAddOns();
      setAvailableAddOns(addons);
    } catch (error) {
      console.error("Failed to fetch addons", error);
    }
  }, []);

  useEffect(() => {
    fetchAddOns();
  }, [fetchAddOns]);



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
      selectedAddOns: selectedAddOnIds.map((id) => {
        const addon = availableAddOns.find((a) => a.id === id);
        return {
          addOnId: id,
          quantity: 1,
          unitPrice: addon?.price?.listedPrice || 0,
        } as any;
      }),
    });
  };

  // Helper for your schema's image array
  const dishImage = Array.isArray(item.dish?.image) ? item.dish?.image[0] : item.dish?.image;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-2 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
            <Image 
              src={dishImage || "/placeholder.png"} 
              alt={item.dish?.name || ""} 
              fill 
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{item.dish?.name}</span>
            <span className="text-xs text-gray-500">${item.dish?.price?.listedPrice}</span>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-md border border-red-100"
        >
          Remove Item
        </button>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-gray-100 shadow-inner">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
          <span className="text-xl font-black text-gray-900">{quantity}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center hover:text-violet-600"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center hover:text-violet-600"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Add-ons List */}
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
                  : "border-gray-100 bg-white text-gray-600"
              }`}
            >
              <div className="flex flex-col items-start px-1 text-left">
                <span className="text-xs font-bold truncate">{addon.name}</span>
                <span className="text-[10px] opacity-70">${addon.price?.listedPrice.toFixed(2)}</span>
              </div>
              {selectedAddOnIds.includes(addon.id) && <Check size={14} className="text-violet-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Remarks</label>
        <textarea
          placeholder="Specific instructions..."
          className="w-full p-4 bg-slate-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-violet-500 h-24 resize-none"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {/* Footer Buttons */}
      <div className="pt-4 border-t border-gray-100 flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1 font-bold h-11">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-black h-11 shadow-lg"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}