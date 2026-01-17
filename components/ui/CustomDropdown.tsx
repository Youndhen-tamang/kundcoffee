"use client";
import { useState, useRef, useEffect } from "react";

interface Option {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  label?: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  placeholder?: string;
}

export const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
  onAddNew,
  addNewLabel = "Create New...",
  placeholder = "Select an option",
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`block truncate ${!selectedOption ? "text-gray-400" : ""}`}
          >
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <div
                key={option.id}
                className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-zinc-100 ${option.id === value ? "bg-zinc-50 text-zinc-900 font-semibold" : "text-gray-900"}`}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                <span className="block truncate">{option.name}</span>
                {option.id === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}

            {onAddNew && (
              <div
                className="relative cursor-pointer select-none border-t border-gray-100 py-2 pl-3 pr-9 text-blue-600 hover:bg-blue-50 font-medium"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
              >
                + {addNewLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
