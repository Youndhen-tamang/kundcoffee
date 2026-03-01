"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  UserPlus, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2,
  Loader2,
  Calendar,
  Wallet,
  Trophy,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function AddCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    loyaltyId: "",
    openingBalance: 0,
    creditLimit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      toast.error("Customer name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success("Customer profile created", {
          icon: <CheckCircle2 className="text-emerald-500" size={18} />,
        });
        router.push("/dashboard/customers");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to create customer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">
              Guest Registry
            </h1>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Create a new customer profile and loyalty account
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Loyalty & Credit Info */}
        <div className="space-y-4">
          <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-6 shadow-xl">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Loyalty System</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Registered customers automatically accumulate points based on their spending.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <CreditCard size={20} className="text-zinc-300" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest">Credit Facility</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Assign an opening balance or credit limit to allow "Post-Pay" sessions for trusted members.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
            
            {/* Basic Identification */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-50 pb-2">
                Basic Identification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} /> Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh KC"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} /> Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Financial & Loyalty */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-50 pb-2">
                Financial & Loyalty Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Wallet size={12} /> Opening Balance (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-mono"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> Custom Loyalty ID
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank for Auto-Gen"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={formData.loyaltyId}
                    onChange={(e) => setFormData({ ...formData, loyaltyId: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="h-12 px-8 text-[11px] font-bold uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-10 bg-zinc-900 text-white hover:bg-zinc-800 text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Register Guest Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}