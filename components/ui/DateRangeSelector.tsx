"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { CustomDropdown } from "./CustomDropdown";

interface DateRangeSelectorProps {
  onDateChange: (date: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  currentDate?: string;
  currentMonth?: string;
  currentYear?: string;
}

export const DateRangeSelector = ({
  onDateChange,
  onMonthChange,
  onYearChange,
  currentDate,
  currentMonth,
  currentYear,
}: DateRangeSelectorProps) => {
  const months = [
    { id: "1", name: "January" },
    { id: "2", name: "February" },
    { id: "3", name: "March" },
    { id: "4", name: "April" },
    { id: "5", name: "May" },
    { id: "6", name: "June" },
    { id: "7", name: "July" },
    { id: "8", name: "August" },
    { id: "9", name: "September" },
    { id: "10", name: "October" },
    { id: "11", name: "November" },
    { id: "12", name: "December" },
  ];

  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    id: (currentYearNum - i).toString(),
    name: (currentYearNum - i).toString(),
  }));

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
          Select Date
        </label>
        <div className="relative group">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
            size={14}
          />
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-medium text-zinc-900 focus:border-zinc-900 transition-all outline-none h-10 w-44"
          />
        </div>
      </div>

      <div className="h-10 w-px bg-zinc-100 self-end mb-1 md:block hidden" />

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
          Month
        </label>
        <CustomDropdown
          options={months}
          value={currentMonth}
          onChange={onMonthChange}
          placeholder="Select Month"
        />
      </div>

      <div className="flex flex-col gap-1.5 min-w-[100px]">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
          Year
        </label>
        <CustomDropdown
          options={years}
          value={currentYear}
          onChange={onYearChange}
          placeholder="Year"
        />
      </div>
    </div>
  );
};
