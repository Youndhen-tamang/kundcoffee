"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { useLocationStore } from "../../store/useLocationStore";
import { ChevronRight, Navigation, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  
  // Zustand Stores
  const { cart, getTotal, clearCart } = useCartStore() as any;
  const { address, coords, isAuto, setLocation } = useLocationStore();
  
  // Local States
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", details: "" });
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const MINIMUM_ORDER = 1000;
  const cartTotal = getTotal();
  const isInvalidOrder = cartTotal < MINIMUM_ORDER;

  // 1. Security Check & Hydration
  useEffect(() => {
    setMounted(true);

    // SECURE REDIRECT: If user tries to access /checkout manually with < 1000
    if (cartTotal < MINIMUM_ORDER) {
      router.replace("/"); // Send them home immediately
    }
  }, [cartTotal, router]);

  const handleGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation("Current Location (GPS)", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }, true);
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          alert("Location access denied. Please check browser permissions.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
    }
  };

  const handleOrder = async () => {
    // Extra security check inside the function
    if (isInvalidOrder) return;

    // Nepal Phone Regex (98 or 97 starting)
    const nepalPhoneRegex = /^(98|97)\d{8}$/;

    if (!form.name.trim() || !form.details.trim() || !nepalPhoneRegex.test(form.phone)) {
      alert("Please enter a Name, Detailed Address, and a valid 10-digit Nepal Phone Number.");
      return;
    }

    setLoading(true);

    const orderItems = cart.map((i: any) => `• ${i.name} (x${i.quantity})`).join("%0A");
    const gpsLink = (isAuto && coords) 
      ? `%0A*Live Location:* https://www.google.com/maps?q=${coords.lat},${coords.lng}` 
      : "";

    const message = `*RAJ BIRYANI - NEW ORDER*%0A--------------------------%0A*Customer:* ${form.name}%0A*Phone:* ${form.phone}%0A*Area:* ${address}%0A*Details:* ${form.details}${gpsLink}%0A--------------------------%0A*Total:* Rs ${cartTotal}%0A*Items:*%0A${orderItems}%0A--------------------------%0A_Please confirm my order!_`;

    window.open(`https://wa.me/9763681795?text=${message}`, "_blank");
    
    clearCart();
    router.push('/');
  };

  // Prevent rendering until mounted and check if cart is valid
  // If invalid, we return null while the useEffect redirects
  if (!mounted || isInvalidOrder) return null;

  return (
    <div className="p-6 pb-32 max-w-md mx-auto bg-white min-h-screen">
      {/* Back Button */}
      <button onClick={() => router.back()} className="mb-6 p-2 bg-zinc-100 rounded-full active:scale-90 transition-all">
        <ArrowLeft size={20} />
      </button>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight">Checkout</h2>
        <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount Due</p>
            <p className="text-xl font-black text-orange-600">Rs {cartTotal}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Full Name Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Full Name</label>
          <input 
            type="text" placeholder="Enter your name" 
            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium"
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Nepal Phone Number</label>
          <input 
            type="tel" placeholder="98XXXXXXXX" 
            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-medium"
            onChange={(e) => setForm({...form, phone: e.target.value})}
          />
        </div>

        {/* Location Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Delivery Location</label>
          
          <button 
            type="button"
            onClick={handleGPS}
            disabled={isLocating}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${
              isAuto 
              ? "bg-green-50 border-green-200 text-green-600" 
              : "bg-orange-50 border-orange-100 text-orange-600"
            }`}
          >
            {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} fill={isAuto ? "currentColor" : "none"} />}
            {isLocating ? "Fetching GPS..." : isAuto ? "GPS Location Captured" : "Use Current Location (GPS)"}
          </button>
        </div>

        {/* Detailed Address Textarea */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">House No / Landmark / Street</label>
          <textarea 
            placeholder="E.g. House 45, Near the big Peepal tree" 
            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl outline-none focus:border-orange-500 h-24 transition-all font-medium"
            onChange={(e) => setForm({...form, details: e.target.value})}
          />
        </div>

        {/* Order Guard Alert */}
        <div className="flex items-start gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <AlertCircle className="text-zinc-400 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider">
                Orders are fulfilled via WhatsApp. Ensure you have WhatsApp installed on this device.
            </p>
        </div>

        {/* Confirm Order Button */}
        <button 
          onClick={handleOrder}
          disabled={loading || isInvalidOrder}
          className="w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-zinc-200 disabled:shadow-none"
        >
          {loading ? "Launching WhatsApp..." : "Send Order to WhatsApp"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}