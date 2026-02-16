"use client";
import { useState } from "react";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";
import { useLocationStore } from "../app/store/useLocationStore";

export default function LocationPicker({ onSelect }: { onSelect?: () => void }) {
  const { address, setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const areas = ["New Road", "Thamel", "Baneshwor", "Koteshwor", "Balaju", "Lalitpur", "Bhaktapur"];

  const handleGPS = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // In a real app, you'd call a reverse-geocode API here.
          // For now, we store the coords and mark it as "Current Location"
          setLocation("Current Location (GPS)", { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude 
          }, true);
          setLoading(false);
          if (onSelect) onSelect();
        },
        () => {
          alert("Permission denied. Please select manually.");
          setLoading(false);
        }
      );
    }
  };

  return (
    <div className="space-y-4 p-2">
      <button 
        onClick={handleGPS}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 py-4 rounded-2xl font-black text-sm border-2 border-orange-100 hover:bg-orange-100 transition-all"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
        {loading ? "Locating..." : "Use Current Location"}
      </button>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
          <span className="text-[10px] font-bold">OR</span>
        </div>
        <div className="h-[1px] bg-zinc-100 w-full my-6"></div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => {
              setLocation(area, null, false);
              if (onSelect) onSelect();
            }}
            className={`p-3 rounded-xl text-xs font-bold border transition-all ${
              address === area 
                ? "bg-orange-600 text-white border-orange-600" 
                : "bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-orange-200"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}