"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Settings {
  currency: string;
  [key: string]: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: string, value: string) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({ currency: "Rs." });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      if (result.success) {
        setSettings((prev) => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error("Fetch Settings Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const result = await response.json();
      if (result.success) {
        setSettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error("Update Setting Error:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
