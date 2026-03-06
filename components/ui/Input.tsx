"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, value, onChange, ...props }, ref) => {
    // Custom numeric handling for "01" problem and placeholder "0"
    const isNumeric = type === "number";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      if (isNumeric) {
        // If empty, pass 0 or handle as needed by the parent
        // But usually, we want to allow typing "1" without "01"
        // The parent state should be a number.
        onChange(e);
      } else {
        onChange(e);
      }
    };

    // To prevent "01", if value is 0, we show empty string but placeholder is "0"
    const displayValue = isNumeric && value === 0 ? "" : value;

    return (
      <div className="w-full">
        {label && <label className="pos-label">{label}</label>}
        <input
          type={type}
          className={cn("pos-input w-full", className)}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          placeholder={isNumeric ? "0" : props.placeholder}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
