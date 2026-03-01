"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ChevronRight, UtensilsCrossed, AlertCircle } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cart, addItem, decrementItem, removeItem, getTotal } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const cartTotal = getTotal();
  const MINIMUM_ORDER = 1000;
  const isBelowMinimum = cartTotal < MINIMUM_ORDER;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white lg:bg-zinc-50 flex justify-center font-sans text-slate-900 pb-32">
      <div className="w-full lg:max-w-md bg-white min-h-screen relative flex flex-col">
        
        {/* --- HEADER --- */}
        <nav className="px-6 py-6 flex items-center justify-between border-b border-zinc-50">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-zinc-100 rounded-full active:scale-90 transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight">Your Order</h1>
          </div>
          <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1.5">
            <UtensilsCrossed size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Fresh</span>
          </div>
        </nav>

        {/* --- ITEMS LIST --- */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
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
            <div className="space-y-6">
              {/* List of Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center animate-in fade-in duration-500">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-[11px] uppercase text-slate-800 tracking-tight leading-tight">
                          {item.name}
                        </h4>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-black text-slate-900">Rs {item.priceNum * item.quantity}</span>
                        
                        <div className="flex items-center gap-3 bg-zinc-100 rounded-xl p-1 px-2 border border-zinc-200/50">
                          <button onClick={() => decrementItem(item.id)} className="text-slate-500 active:scale-75 transition-transform p-1">
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addItem(item)} className="text-slate-500 active:scale-75 transition-transform p-1">
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- BOTTOM SECTION --- */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-zinc-100 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            
            {/* Minimum Order Alert */}
            {isBelowMinimum && (
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100 animate-in zoom-in duration-300">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 leading-tight">
                Minimum order amount is 1000.00. Please add more to your cart to proceed. Add Rs {MINIMUM_ORDER - cartTotal} more to unlock checkout
                </p>
              </div>
            )}

            {/* Bill Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>Subtotal</span>
                <span className="text-slate-800">Rs {cartTotal}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">Rs {cartTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            {isBelowMinimum ? (
              <button
                disabled
                className="w-full bg-zinc-100 text-zinc-400 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed opacity-70"
              >
                Checkout Locked <ChevronRight size={18} strokeWidth={3} />
              </button>
            ) : (
              <Link
                href="/checkout"
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-orange-200"
              >
                Proceed to Checkout <ChevronRight size={18} strokeWidth={3} />
              </Link>
            )}

            <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Raj Biryani Kathmandu</p>
                <div className="h-1 w-8 bg-zinc-100 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}