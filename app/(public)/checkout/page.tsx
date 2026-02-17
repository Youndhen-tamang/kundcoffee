"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { useLocationStore } from "../../store/useLocationStore";
import { ChevronRight, MapPin, Navigation, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  
  // Zustand Stores
  const { cart, getTotal, clearCart } = useCartStore() as any;
  const { address, coords, isAuto, setLocation } = useLocationStore();
  
  // Local States
  const [mounted, setMounted] = useState(false); // Fix for Hydration Error
  const [form, setForm] = useState({ name: "", phone: "", details: "" });
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Fix Hydration: Wait for client-side mounting to read localStorage safely
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGPS = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Success: Pass 3 arguments to match the store: address, coords, isAuto
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
    const nepalPhoneRegex = /^9[678]\d{8}$/;
    if (!form.name || !form.details || !nepalPhoneRegex.test(form.phone)) {
      alert("Please enter Name, Detailed Address, and a valid Nepal Phone Number.");
      return;
    }

    setLoading(true);

    const orderItems = cart.map((i: any) => `• ${i.name} (x${i.quantity})`).join("%0A");
    
    // Use the coordinates if it's an Auto/GPS location
    const gpsLink = (isAuto && coords) 
      ? `%0A%0A*📍 Live Location:* https://www.google.com/maps?q=${coords.lat},${coords.lng}` 
      : "";

    const message = `*RAJ BIRYANI - NEW ORDER*%0A--------------------------%0A*Customer:* ${form.name}%0A*Phone:* ${form.phone}%0A*Area:* ${address}%0A*Details:* ${form.details}${gpsLink}%0A--------------------------%0A*Items:*%0A${orderItems}%0A--------------------------%0A*Total Amount:* Rs ${getTotal()}%0A--------------------------%0A_Please confirm my order!_`;

    window.open(`https://wa.me/9843094860?text=${message}`, "_blank");
    
    clearCart();
    router.push('/');
    alert("Order details sent via WhatsApp!");
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div className="p-6 pb-32 max-w-md mx-auto bg-white min-h-screen">
      <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Checkout</h2>
      
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

          {/* MANUAL LOCATION SELECTION - COMMENTED OUT AS REQUESTED */}
          {/* 
          <div className="flex items-center gap-3 my-2">
            <div className="h-[1px] bg-zinc-100 flex-1"></div>
            <span className="text-[10px] font-bold text-zinc-300 uppercase">Or Select Area</span>
            <div className="h-[1px] bg-zinc-100 flex-1"></div>
          </div>

          <div className="relative">
            <select 
              value={ktmAreas.includes(address) ? address : "Other"}
              className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl outline-none focus:border-orange-500 appearance-none transition-all font-bold text-sm"
              onChange={(e) => setLocation(e.target.value, null, false)}
            >
              <option disabled value="Select Location">Select Area</option>
              {ktmAreas.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
               <MapPin size={18} />
            </div>
          </div> 
          */}
        </div>

        {/* Detailed Address Textarea */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">House No / Landmark / Street</label>
          <textarea 
            placeholder="E.g. House 45, Behind the Ward Office" 
            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl outline-none focus:border-orange-500 h-24 transition-all font-medium"
            onChange={(e) => setForm({...form, details: e.target.value})}
          />
        </div>

        {/* Order Summary Card */}
        <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-orange-800/60 uppercase tracking-widest">Total Pay</span>
            <span className="text-2xl font-black text-orange-600">Rs {getTotal()}</span>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button 
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Ordering..." : "Confirm via WhatsApp"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}