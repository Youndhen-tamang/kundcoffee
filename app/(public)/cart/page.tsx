"use client";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export default function CartPage() {
  const { cart, addItem, decrementItem, removeItem, getTotal } = useCartStore();

  return (
    <main className="min-h-screen bg-white lg:bg-zinc-100 flex justify-center font-sans text-slate-900 mb-20">
      <div className="w-full lg:max-w-md bg-white min-h-screen relative flex flex-col">
        <nav className="px-6 py-6 flex items-center gap-4 border-b">
          <Link href="/" className="p-2 bg-zinc-100 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase tracking-tight">
            Your Cart
          </h1>
        </nav>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
              <ShoppingBag size={64} strokeWidth={1} />
              <p className="font-bold">Your cart is empty</p>
              <Link href="/" className="text-orange-600 font-bold underline">
                Go add some Biryani!
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-zinc-50 p-4 rounded-[2rem] border border-zinc-100"
                >
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-sm uppercase">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-orange-600 font-black">
                        Rs {item.priceNum * item.quantity}
                      </span>
                      <div className="flex items-center bg-white rounded-xl border border-zinc-200">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="p-1 px-2 text-orange-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-xs font-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="p-1 px-2 text-orange-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 border-t space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-bold uppercase text-xs">
                Total Amount
              </span>
              <span className="text-2xl font-black">Rs {getTotal()}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-center block shadow-xl shadow-slate-200"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
