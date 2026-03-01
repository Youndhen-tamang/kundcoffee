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
  Coffee,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function SettingsPage() {
  const { settings, updateSetting, loading } = useSettings();
  const [currency, setCurrency] = useState(settings.currency);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | string | null>(null);

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

  // const handleQrSubmit = async()

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-900" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Syncing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-10 selection:bg-zinc-100">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 pb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-zinc-950 text-white rounded-xl flex items-center justify-center shadow-xl shadow-zinc-200">
            <SettingsIcon size={28} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">Enterprise Suite</span>
              <div className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">v2.0</span>
            </div>
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              System Settings
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              Configure your global POS preferences and regional standards.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        

        {/*Qr Payment Confirguration Section */}
        <section className="w-full  p-4">
          <div>
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">Qr Configuration</h2>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Upload your QR code for transaction purposes only. This QR code will be used solely to process and receive payments within the system. Kindly ensure that the QR code is valid, active, and linked to the correct payment account.</p>
          </div>

          <ImageUpload
              label="Dish Photo"
              value={typeof imageFile === "string" ? imageFile : undefined}
              onChange={setImageFile}
            />
        </section>
        {/* --- LOCALIZATION SECTION --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:pt-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">Localization</h2>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Define the currency and regional formatting for your storefront. This affects receipts, invoices, and reports.
            </p>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Reporting Currency
                </label>
                
                <div className="flex flex-wrap gap-2">
                  {["Rs.", "NPR", "$", "€", "£"].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setCurrency(symbol)}
                      className={`h-11 px-6 rounded-lg text-sm font-semibold transition-all border ${
                        currency === symbol
                          ? "bg-zinc-950 text-white border-zinc-950 shadow-md"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
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
                    className="h-11 w-28 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-6 bg-[#FAFAFA] rounded-xl border border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                    <Coffee size={14} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">Live Preview</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Transaction</span>
                  <span className="text-2xl font-semibold text-zinc-900 tabular-nums tracking-tighter">
                    {currency} 1,250.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- TAX CONFIGURATION SECTION --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <div className="lg:pt-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight mb-1">Compliance & Tax</h2>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              Manage how government mandates and taxes are applied to your customer checkout flow.
            </p>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-lg bg-red-50 text-red-800 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-1">
                    Standard Tax (VAT 13%)
                  </label>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-sm">
                    Automatically append statutory taxes to all new orders. You can override this manually per transaction.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() =>
                  updateSetting(
                    "includeTaxByDefault",
                    settings.includeTaxByDefault === "true" ? "false" : "true",
                  )
                }
                className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                  settings.includeTaxByDefault === "true" ? "bg-red-800" : "bg-zinc-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
                    settings.includeTaxByDefault === "true" ? "left-8" : "left-1"
                  } flex items-center justify-center`}
                >
                  {settings.includeTaxByDefault === "true" && <Check size={10} className="text-red-800" />}
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/*User Modification */}
        <section>
          
        </section>
      {/* --- ACTION FOOTER --- */}
      <div className="flex items-center justify-between pt-10 border-t border-zinc-100">
        <div className="hidden md:flex items-center gap-2 text-zinc-400">
          <span className="text-[10px] font-bold uppercase tracking-widest underline decoration-red-800/30 underline-offset-4">Last Synced: Just now</span>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 px-10 bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg shadow-lg shadow-zinc-200 text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <>
              Apply Changes
              <Save size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}