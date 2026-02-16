"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Star, Clock, Plus, Minus, Home as HomeIcon, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "../store/useCartStore";

export default function Home() {
  const { cart, addItem, decrementItem, getItemCount } = useCartStore();

  const menuItems = [
    { id: 1, name: "CHICKEN BIRYANI", description: "Fragrant basmati rice layered with tender chicken.", price: "Rs 590", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=800&auto=format&fit=crop" },
    { id: 2, name: "MUTTON BIRYANI", description: "Traditional slow-cooked succulent mutton pieces.", price: "Rs 850", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop" },
    { id: 3, name: "PANEER BIRYANI", description: "Fresh cubes of marinated paneer with saffron rice.", price: "Rs 590", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop" },
  ];

  return (
    <main className="min-h-screen bg-white lg:bg-zinc-100 flex justify-center font-sans text-slate-900">
      <div className="w-full lg:max-w-md bg-white min-h-screen lg:shadow-2xl relative flex flex-col border-x border-zinc-50">
        
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-6 pt-4 pb-2 border-b border-zinc-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-orange-600">
              <MapPin size={12} fill="currentColor" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Kathmandu</span>
            </div>
            <div className="relative w-24 h-16">
              <Image src="/logo.jpeg" alt="Raj Biryani Logo" fill className="object-contain" priority />
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* HERO */}
          <div className="px-6 pt-6">
            <div className="relative h-56 rounded-[2.2rem] overflow-hidden shadow-xl shadow-orange-100/50 border-4 border-white">
               <Image src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop" alt="Offer" fill className="object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                  <span className="bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-2 uppercase">Today's Special</span>
                  <h2 className="text-white text-xl font-bold uppercase">Free Raita & Salad</h2>
               </div>
            </div>
          </div>

          {/* MENU */}
          <div className="px-6 mt-10">
            <h3 className="text-lg font-black uppercase tracking-tight mb-8">Signature Menu</h3>
            <div className="space-y-12">
              {menuItems.map((item) => {
                const quantity = cart.find(i => i.id === item.id)?.quantity || 0;
                return (
                  <div key={item.id} className="group flex flex-col gap-4">
                    <div className="relative h-52 w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-zinc-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      
                      {/* ADD / REMOVE BUTTONS */}
                      <div className="absolute bottom-4 right-4 flex items-center bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">
                        {quantity > 0 ? (
                          <>
                            <button onClick={() => decrementItem(item.id)} className="p-3 text-orange-600 active:bg-zinc-100"><Minus size={18} /></button>
                            <span className="px-2 font-black text-slate-800">{quantity}</span>
                            <button onClick={() => addItem(item)} className="p-3 text-orange-600 active:bg-zinc-100"><Plus size={18} /></button>
                          </>
                        ) : (
                          <button onClick={() => addItem(item)} className="px-6 py-3 font-black text-orange-600 flex items-center gap-2 active:bg-zinc-100">
                            ADD <Plus size={16} />
                          </button>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/95 px-4 py-2 rounded-2xl shadow-xl">
                        <span className="text-orange-600 font-black text-sm">{item.price}</span>
                      </div>
                    </div>
                    <div className="px-2">
                      <h4 className="font-black text-lg text-slate-800">{item.name}</h4>
                      <p className="text-slate-500 text-sm font-medium">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM NAVIGATION */}
        <div className="fixed bottom-0 w-full lg:max-w-md bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-8 py-4 flex justify-between items-center z-50">
          <Link href="/" className="flex flex-col items-center gap-1 text-orange-600">
            <HomeIcon size={24} />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </Link>
          <Link href="/cart" className="flex flex-col items-center gap-1 text-slate-400 relative">
            <ShoppingBag size={24} />
            {getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {getItemCount()}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase">Cart</span>
          </Link>
          <a href="tel:9763681946" className="flex flex-col items-center gap-1 text-slate-400">
            <Phone size={24} />
            <span className="text-[10px] font-bold uppercase">Call</span>
          </a>
        </div>
      </div>
    </main>
  );
}