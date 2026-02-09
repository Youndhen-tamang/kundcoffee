"use client";

import { useState } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import {
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSetting, loading } = useSettings();
  const [currency, setCurrency] = useState(settings.currency);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSetting("currency", currency);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Configure your POS system preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Localization Section */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-50 flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe size={20} />
            </div>
            <h2 className="font-bold text-zinc-900">Localization</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <label className="text-sm font-black text-zinc-400 uppercase tracking-widest block mb-2">
                  Currency Symbol
                </label>
                <p className="text-xs text-zinc-500 mb-4 font-medium italic">
                  This symbol will appear across the dashboard, receipts, and
                  invoices.
                </p>
                <div className="flex gap-2">
                  {["Rs.", "NPR", "$", "€", "£"].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setCurrency(symbol)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        currency === symbol
                          ? "bg-zinc-900 text-white shadow-lg scale-105"
                          : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="Custom"
                    className="w-24 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:bg-white focus:border-zinc-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 border-dashed space-y-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Preview
                </span>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-zinc-500">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-zinc-900 tracking-tighter">
                    {currency} 1,250.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Settings Placeholder */}
        <div className="bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed p-12 text-center space-y-3 opacity-60">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-zinc-300">
            <CreditCard size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-400">
            More settings coming soon...
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-14 px-10 bg-red-600 text-white hover:bg-red-700 rounded-2xl shadow-xl shadow-red-200 uppercase tracking-widest font-black text-xs flex items-center gap-3 active:scale-95 transition-all"
        >
          {isSaving ? "Saving Changes..." : "Save Settings"}
          <Save size={18} />
        </Button>
      </div>
    </div>
  );
}
