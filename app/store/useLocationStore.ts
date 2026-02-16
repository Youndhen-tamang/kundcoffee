import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  address: string;
  coords: { lat: number; lng: number } | null;
  isAuto: boolean;
  setLocation: (address: string, coords?: { lat: number; lng: number } | null, isAuto?: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      address: "Select Location",
      coords: null,
      isAuto: false,
      setLocation: (address, coords = null, isAuto = false) => 
        set({ address, coords, isAuto }),
    }),
    { name: 'raj-location-storage' }
  )
);