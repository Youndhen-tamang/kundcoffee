"use client";
import React, { useState, useEffect } from "react";

interface ImageUploadProps {
  label: string;
  value?: string; // existing URL
  onChange: (file: File | string | null) => void;
  multiple?: boolean;
}

export function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  // Update preview when value prop changes (e.g. when editing different items)
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file); // Pass File object up
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPreview(null);
    onChange(null);
    // Reset file input value
    const input = document.getElementById(
      `file-upload-${label}`,
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 block mb-2">
        {label}
      </label>
      <div className="flex items-start gap-4">
        {preview ? (
          <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <button
                onClick={clearImage}
                className="opacity-0 group-hover:opacity-100 bg-white/90 text-red-500 p-2 rounded-full shadow-sm hover:bg-white hover:scale-105 transition-all"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`file-upload-${label}`}
            className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-xs font-medium">Upload Image</span>
          </label>
        )}

        <div className="flex-1 hidden">
          <input
            id={`file-upload-${label}`}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
