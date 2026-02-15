"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  AlertCircle,
} from "lucide-react";
import { verifyCodeSchema, type VerifyCodeInput } from "@/lib/validations/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailAction, resendCodeAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react"; // 1. Import useSession and signOut

function VerifyEmailContent() {
  const { update } = useSession(); // 2. Initialize the update helper
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      email: email || "",
      code: "",
    },
  });

  const onSubmit = async (data: VerifyCodeInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyEmailAction(data.email, data.code);

      if (result.success) {
        toast.success(result.message);

        // 3. SECURE SESSION UPDATE
        // This tells NextAuth: "Run the JWT callback again".
        // Our JWT callback will then fetch the fresh 'emailVerified' status from Prisma.
        await update();

        // 4. Force refresh of all server components and push to next step
        router.refresh();
        setTimeout(() => {
          router.push("/setup-store?email=" + encodeURIComponent(data.email));
        }, 150);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (!email) return setError("No email address found to resend code.");

    toast.promise(resendCodeAction(email), {
      loading: "Sending new code...",
      success: (data) => {
        if (!data.success) throw new Error(data.message);
        return data.message;
      },
      error: (err: any) => err.message || "Failed to resend code",
    });
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold">Invalid Request</h1>
          <p className="text-zinc-500">No email address provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-zinc-50/50" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] bg-white rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-zinc-100 p-8 lg:p-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-zinc-900/10">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
            Check Your Inbox
          </h1>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed">
            We've sent a 6-digit code to <br />
            <span className="text-zinc-900 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-600"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold opacity-90">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <input type="hidden" {...register("email")} />

          <div className="space-y-2">
            <div className="relative">
              <input
                {...register("code")}
                type="text"
                maxLength={6}
                className={`w-full h-16 bg-zinc-50 border ${
                  errors.code ? "border-red-200" : "border-zinc-100"
                } rounded-2xl text-2xl font-black text-center text-zinc-900 tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white transition-all placeholder:tracking-normal`}
                placeholder="000000"
              />
            </div>
            {errors.code && (
              <p className="text-[10px] font-bold text-red-500 text-center">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="pt-2 space-y-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0, scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] shadow-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Verify Account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={onResend}
              className="w-full text-[11px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
            >
              Didn't receive code? Resend
            </button>
          </div>
        </form>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              Secure Verification
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[10px] font-bold text-zinc-400 hover:text-red-500 transition-colors"
          >
            Wrong email? Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-zinc-900" size={32} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
