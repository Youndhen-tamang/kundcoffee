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
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Mail,
  Loader2,
} from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const result = await registerAction(data);
      if (result.success) {
        toast.success("Account created successfully!");
        router.push("/verify-email?email=" + encodeURIComponent(data.email));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex flex-col lg:flex-row overflow-hidden">
      {/* --- LEFT COLUMN: BRAND VISUAL --- */}
      <div className="hidden lg:flex flex-col lg:w-[45%] xl:w-[40%] relative bg-zinc-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/login-hero.png" // Reuse the login hero
            alt="Premium Coffee Experience"
            className="w-full h-full object-cover opacity-60"
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
                  Join the Elite
                </span>
              </div>
              <h3 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Start Your <br /> <span className="text-red-500">Legacy.</span>
              </h3>
              <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                Create your account to access the world's most advanced cafe
                management suite.
              </p>
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

      {/* --- RIGHT COLUMN: SIGNUP FORM --- */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-4">
              <Coffee size={28} />
            </div>
            <h1 className="text-2xl font-black text-zinc-900">Sign Up</h1>
          </div>

          <div className="mb-8 hidden md:block">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-3">
              Get Started
            </h1>
            <p className="text-zinc-500 font-semibold text-sm">
              Enter your details to create your secure account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-600"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold opacity-90">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full h-14 pl-14 pr-5 bg-zinc-50 border ${
                    errors.email ? "border-red-200" : "border-zinc-100"
                  } rounded-2xl text-[13px] font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white transition-all`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Password
              </label>
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
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors pointer-events-none">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  className={`w-full h-14 pl-14 pr-5 bg-zinc-50 border ${
                    errors.confirmPassword
                      ? "border-red-200"
                      : "border-zinc-100"
                  } rounded-2xl text-[13px] font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 focus:bg-white transition-all`}
                  placeholder="Repeat password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0, scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] shadow-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-zinc-500 font-medium text-xs">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-zinc-900 font-black hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
