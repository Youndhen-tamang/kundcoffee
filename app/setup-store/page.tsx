"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Loader2, Store, MapPin, BadgeDollarSign, LayoutDashboard } from "lucide-react";
import { storeSetupSchema, type StoreSetupInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { setupStoreAction } from "@/app/actions/auth";
import { toast } from "sonner";

export default function SetupStorePage() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<StoreSetupInput>({
    resolver: zodResolver(storeSetupSchema),
    defaultValues: {
      name: "",
      location: "",
      currency: "NPR",
    },
  });

  // Redirect if already setup
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isSetupComplete) {
      router.push("/");
    }
  }, [status, session, router]);

  const onSubmit = async (data: StoreSetupInput) => {
    const email = session?.user?.email;
    if (!email) {
      toast.error("Session invalid. Please login again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await setupStoreAction(email, data);
      if (result.success) {
        toast.success("Store setup complete!");
        
        // IMPORTANT: Update session so middleware knows setup is done
        await update({
          ...session,
          user: { ...session?.user, isSetupComplete: true }
        });

        router.push("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Visual Sidebar */}
        <div className="w-full md:w-[45%] bg-zinc-900 p-12 flex flex-col justify-between relative">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-8 border border-white/10">
              <Store size={24} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">
              Setup Your Digital<br /><span className="text-zinc-500">Storefront.</span>
            </h2>
          </div>
          <div className="relative z-10 space-y-4">
             <div className="text-xs font-black text-white uppercase tracking-widest bg-white/10 w-fit px-3 py-1 rounded-full">Step 3: Business Details</div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl font-black text-zinc-900 mb-8">Business Identity</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">Store Name</label>
                <input {...register("name")} className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:border-zinc-900 outline-none transition-all" placeholder="e.g. Kund Coffee Thamel" />
                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">Location</label>
                <input {...register("location")} className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:border-zinc-900 outline-none transition-all" placeholder="e.g. Kathmandu, Nepal" />
                {errors.location && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase mb-2 block">Currency</label>
                <select {...register("currency")} className="w-full h-14 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold outline-none">
                  <option value="NPR">NPR (Nepalese Rupee)</option>
                  <option value="USD">USD (Dollar)</option>
                </select>
              </div>

              <motion.button
                disabled={isLoading}
                type="submit"
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest mt-4 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>Launch Dashboard <LayoutDashboard size={18} /></>}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}