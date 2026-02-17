"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ChevronRight, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export default function CartPage() {
  const { cart, addItem, decrementItem, removeItem, getTotal } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white lg:bg-zinc-50 flex justify-center font-sans text-slate-900 pb-32">
      <div className="w-full lg:max-w-md bg-white min-h-screen relative flex flex-col">
        
        {/* --- HEADER --- */}
        <nav className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-zinc-100 rounded-full active:scale-90 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tight">Your Order</h1>
          </div>
          <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1.5">
            <UtensilsCrossed size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Fresh</span>
          </div>
        </nav>

        {/* --- ITEMS LIST --- */}
        <div className="px-6">
          {cart.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={40} strokeWidth={1} className="text-zinc-300" />
              </div>
              <h2 className="text-lg font-black uppercase text-slate-800">Your bag is empty</h2>
              <p className="text-zinc-400 text-xs font-bold uppercase mt-2 tracking-widest">Add some spice to your day</p>
              <Link href="/" className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                View Menu
              </Link>
            </div>
          ) : (
            <>
              {/* List of Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-xs uppercase text-slate-800 tracking-tight leading-tight">
                          {item.name}
                        </h4>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-black text-slate-900">Rs {item.priceNum * item.quantity}</span>
                        
                        <div className="flex items-center gap-3 bg-zinc-100 rounded-xl p-1 px-2">
                          <button onClick={() => decrementItem(item.id)} className="text-slate-500 active:scale-75 transition-transform">
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addItem(item)} className="text-slate-500 active:scale-75 transition-transform">
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- BILL SUMMARY & PROCEED SECTION --- */}
              {/* Placed exactly 15px below the list */}
              <div className="mt-[15px] space-y-6 pt-6 border-t border-zinc-50 animate-in fade-in slide-in-from-bottom-2 duration-700">
                
                {/* Clean Bill Breakdown */}
                <div className="space-y-3 px-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-slate-800">Rs {getTotal()}</span>
                  </div>
                  {/* <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-500">FREE</span>
                  </div> */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">Rs {getTotal()}</span>
                  </div>
                </div>

                {/* PROCEED TO CHECKOUT BUTTON (ORANGE BACKGROUND) */}
                <Link
                  href="/checkout"
                  className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  Proceed to Checkout <ChevronRight size={18} strokeWidth={3} />
                </Link>

                <div className="flex flex-col items-center gap-2 py-4">
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Raj Biryani Kathmandu</p>
                    <div className="h-1 w-8 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}