"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface UnitPreferenceContextType {
  isUSUnits: boolean;
  setIsUSUnits: (val: boolean) => void;
}

const UnitPreferenceContext = createContext<
  UnitPreferenceContextType | undefined
>(undefined);

export const UnitPreferenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isUSUnits, setIsUSUnits] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("unitPreference");
      if (stored) return stored === "imperial";
      const locale = navigator.language || navigator.languages?.[0] || "";
      if (locale.startsWith("en-US")) return true;
      return false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unitPreference", isUSUnits ? "imperial" : "metric");
    }
  }, [isUSUnits]);

  return (
    <UnitPreferenceContext.Provider value={{ isUSUnits, setIsUSUnits }}>
      {children}
    </UnitPreferenceContext.Provider>
  );
};

export function useUnitPreference() {
  const ctx = useContext(UnitPreferenceContext);
  if (!ctx)
    throw new Error(
      "useUnitPreference must be used within a UnitPreferenceProvider"
    );
  return ctx;
}
