"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  User,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
  
      if (result?.error) {
        if (result.error === "USER_NOT_VERIFIED") {
          toast.error("Please verify your email before logging in.");
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else {
          setError("Invalid email or password");
        }
      } else {
        router.push("/"); 
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* --- LEFT COLUMN: BRAND VISUAL (MODERN SPLIT) --- */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden bg-zinc-900">
        {/* Hero Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-hero.png"
            alt="Luxury Cafe Interior"
            fill
            className="object-cover opacity-60 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
              <Coffee size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">
                Kund
              </h2>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                Coffee
              </span>
            </div>
          </motion.div>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Sparkles size={14} className="text-red-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  v2.0 Elite Suite
                </span>
              </div>
              <h3 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Empowering the Art of{" "}
                <span className="text-red-500">Service.</span>
              </h3>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                Management reimagined for modern cafe culture. Precision tools
                for elite hospitality.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-8 mt-12"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 size={16} className="text-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Real-time Data
                  </span>
                </div>
                <p className="text-[11px] font-bold text-zinc-500">
                  Monitor every table and order as it happens.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 size={16} className="text-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Elite Security
                  </span>
                </div>
                <p className="text-[11px] font-bold text-zinc-500">
                  End-to-end encryption for every transaction.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]"
          >
            &copy; 2026 Kund Coffee Group &bull; Built for Excellence
          </motion.p>
        </div>
      </div>

      {/* --- RIGHT COLUMN: FORMS (SaaS STYLE) --- */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile Header (Visible only on small screens) */}
          <div className="md:hidden flex flex-col items-center mb-12">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-4">
              <Coffee size={28} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900">Sign In</h1>
          </div>

          <div className="mb-10 hidden md:block">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-3">
              Hello Again
            </h1>
            <p className="text-zinc-500 font-semibold text-sm">
              Enter your credentials to access the console.
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
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest">
                      Authentication Error
                    </p>
                    <p className="text-[11px] font-bold opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Email Address
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                    <User size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full h-14 pl-14 pr-5 bg-zinc-50 border ${
                      errors.email ? "border-red-200" : "border-zinc-100"
                    } rounded-2xl text-[13px] font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white transition-all`}
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-bold text-red-500 mt-2 ml-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    className={`w-full h-14 pl-14 pr-5 bg-zinc-50 border ${
                      errors.password ? "border-red-200" : "border-zinc-100"
                    } rounded-2xl text-[13px] font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white transition-all`}
                    placeholder="Enter your security key"
                  />
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-bold text-red-500 mt-2 ml-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0, scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Begin Session
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Verified Secure Access
              </span>
            </div>

            <p className="text-zinc-500 font-medium text-xs">
              New to Kund Coffee?{" "}
              <Link
                href="/signup"
                className="text-zinc-900 font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
