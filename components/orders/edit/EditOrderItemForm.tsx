"use client";

import { OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { useSettings } from "@/components/providers/SettingsProvider";

interface EditOrderItemFormProps {
  item: OrderItem;
  onSave: (updatedItem: Partial<OrderItem>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export function EditOrderItemForm({
  item,
  onSave,
  onCancel,
  onDelete,
}: EditOrderItemFormProps) {
  const { settings } = useSettings();

  // Helper for your schema's image array
  const dishImage = Array.isArray(item.dish?.image)
    ? item.dish?.image[0]
    : item.dish?.image;

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-50 rounded-xl border border-zinc-200 gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
          <Image
            src={dishImage || "/placeholder.png"}
            alt={item.dish?.name || ""}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black text-zinc-900 uppercase tracking-tight">
            {item.dish?.name}
          </span>
          <span className="text-xs font-bold text-zinc-500 mt-1">
            Quantity: {item.quantity} | {settings.currency} {item.dish?.price?.listedPrice.toFixed(2)} each
          </span>
        </div>
        
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wide max-w-xs mt-2">
          Are you sure you want to remove this item from the order? This action cannot be undone.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1 font-black h-12 text-[10px] uppercase tracking-widest rounded-xl border-zinc-200 hover:bg-zinc-50"
        >
          Cancel
        </Button>
        <Button
          onClick={() => onDelete(item.id)}
          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black h-12 text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-rose-200 border-none transition-all"
        >
          Remove Item
        </Button>
      </div>
    </div>
  );
}
