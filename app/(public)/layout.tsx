"use client";
import { useState, useEffect } from "react"; // 1. Import hooks
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Home, ShoppingBag, Phone, X, MessageCircle, PhoneCall } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useLocationStore } from "../store/useLocationStore";
import LocationPicker from "@/components/LocationPicker";
import { Kanit } from "next/font/google";


const kanit = Kanit({ 
  subsets: ["latin"], 
  weight: ["400", "600", "900"],
  variable: '--font-kanit' 
});


export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getItemCount } = useCartStore() as any;
  const { address } = useLocationStore();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // 2. HYDRATION FIX: State to check if component is mounted in browser
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className={`${kanit.variable} min-h-screen bg-zinc-100 lg:bg-zinc-200 flex justify-center font-sans text-slate-900 overflow-x-hidden`}>
      <div className="w-full lg:max-w-md bg-white min-h-screen relative flex flex-col shadow-2xl">
        
        {/* --- NAVBAR --- */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-3 border-b border-zinc-100 flex justify-between items-center">
          <button 
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-orange-600 active:opacity-60 transition-opacity"
          >
            <MapPin size={14} fill="currentColor" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Deliver to</span>
              {/* Only show address if mounted to avoid mismatch */}
              <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">
                {mounted ? address : "..."}
              </span>
            </div>
          </button>
          
          <div className="relative w-20 h-12">
            <Image src="/logo.jpeg" alt="Logo" fill className="object-contain" priority />
          </div>
        </nav>

        {/* --- LOCATION MODAL --- */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end justify-center">
            <div className="absolute inset-0" onClick={() => setIsLocationModalOpen(false)} />
            <div className="relative bg-white w-full lg:max-w-md rounded-t-[2.5rem] p-8">
               <LocationPicker onSelect={() => setIsLocationModalOpen(false)} />
            </div>
          </div>
        )}

        {/* --- CONTACT POPUP --- */}
        {isContactOpen && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-24">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[4px]" onClick={() => setIsContactOpen(false)} />
            <div className="relative w-full max-w-[340px] bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-6 shadow-2xl">
               <button onClick={() => setIsContactOpen(false)} className="absolute top-4 right-4 p-1.5 bg-black/5 rounded-full">
                  <X size={16} className="text-zinc-600" />
               </button>
               <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-zinc-900">Need Help?</h3>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Connect with our store</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <a href="https://wa.me/9763681946" target="_blank" className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"><MessageCircle size={24} /></div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">WhatsApp</span>
                  </a>
                  <a href="tel:9763681946" className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-zinc-50 border border-zinc-100">
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white"><PhoneCall size={22} /></div>
                    <span className="text-[10px] font-bold text-zinc-800 uppercase">Call Now</span>
                  </a>
               </div>
            </div>
          </div>
        )}

        {/* --- PAGE CONTENT --- */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* --- BOTTOM NAVIGATION --- */}
        <div className="fixed bottom-0 w-full lg:max-w-md bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-10 py-4 flex justify-between items-center z-50">
          <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-orange-600' : 'text-zinc-400'}`}>
            <Home size={22} />
            <span className="text-[9px] font-bold uppercase">Menu</span>
          </Link>
          
          <Link href="/cart" className={`flex flex-col items-center gap-1 relative ${pathname === '/cart' ? 'text-orange-600' : 'text-zinc-400'}`}>
            <ShoppingBag size={22} />
            
            {/* 3. WRAP BADGE IN MOUNTED CHECK */}
            {mounted && getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {getItemCount()}
              </span>
            )}
            
            <span className="text-[9px] font-bold uppercase">Cart</span>
          </Link>

          <button 
            onClick={() => setIsContactOpen(true)}
            className={`flex flex-col items-center gap-1 transition-colors ${isContactOpen ? 'text-orange-600' : 'text-zinc-400'}`}
          >
            <Phone size={22} />
            <span className="text-[9px] font-bold uppercase">Help</span>
          </button>
        </div>
      </div>
    </main>
  );
}