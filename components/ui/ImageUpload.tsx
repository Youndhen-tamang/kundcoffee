"use client";
import React, { useState } from "react";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file); // Pass File object up
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label}
      </label>
      <div className="flex items-start gap-4">
        {preview ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                setPreview(null);
                onChange(null);
              }}
              className="absolute top-1 right-1 bg-white/80 p-0.5 rounded-full hover:bg-white text-xs"
              type="button"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
            "
          />
          <p className="mt-1 text-xs text-gray-500">
            {multiple ? "Upload one or more files." : "Upload a file."}
          </p>
        </div>
      </div>
    </div>
  );
}
