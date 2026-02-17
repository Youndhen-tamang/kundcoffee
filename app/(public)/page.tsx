"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
export default function Home() {
  const { cart, addItem, decrementItem } = useCartStore();
  
  // HYDRATION FIX: Ensures client-side data matches server-side initial render
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { 
      id: 1, 
      name: "Chicken Dum Biryani", 
      description: "Fragrant basmati rice layered with spiced chicken and aromatics.", 
      price: "Rs 590", 
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      id: 2, 
      name: "Royal Mutton Biryani", 
      description: "Traditional slow-cooked succulent mutton with saffron rice.", 
      price: "Rs 850", 
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      id: 3, 
      name: "Paneer Tikka Biryani", 
      description: "Marinated paneer cubes with saffron-infused long grain rice.", 
      price: "Rs 590", 
      image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800&auto=format&fit=crop" 
    },
  ];

  return (
    <div className="pb-32">
      {/* HERO SECTION */}
      <div className="px-6 pt-6">
        <div className="relative h-48 rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
           <Image 
             src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop" 
             alt="Offer" fill className="object-cover" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg w-fit mb-2 uppercase tracking-wide">
                Today's Special
              </span>
              <h2 className="text-white text-xl font-semibold">Free Raita & Fresh Salad</h2>
           </div>
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="px-6 mt-10">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Signature Menu</h3>
        
        <div className="space-y-8">
          {menuItems.map((item) => {
            // Check quantity safely after mounting
            const quantity = mounted ? cart.find(i => i.id === item.id)?.quantity || 0 : 0;
            
            return (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm">
                
                {/* 1. IMAGE AT TOP */}
                <div className="relative h-52 w-full">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="p-5">
                  {/* 2. TITLE */}
                  <h4 className=" font-kanit font-semibold text-lg text-gray-800 " >{item.name}</h4>
                  
                  {/* 3. LESS DESCRIPTION */}
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* 4. PRICE & ADD BUTTON (FLEX ROW) */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-50">
                    <span className="font-semibold text-md text-gray-700">{item.price}</span>

                    <div className="flex items-center bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden h-10">
                      {quantity > 0 ? (
                        <>
                          <button 
                            onClick={() => decrementItem(item.id)} 
                            className="px-3 h-full text-orange-600 hover:bg-zinc-100 transition-colors"
                          >
                            <Minus size={16} strokeWidth={2.5} />
                          </button>
                          <span className="px-2 font-bold text-slate-800 text-sm">{quantity}</span>
                          <button 
                            onClick={() => addItem(item)} 
                            className="px-3 h-full text-orange-600 hover:bg-zinc-100 transition-colors"
                          >
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => addItem(item)} 
                          className="px-6 h-full font-bold text-orange-600 text-xs uppercase tracking-wider hover:bg-orange-50 transition-colors"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

      