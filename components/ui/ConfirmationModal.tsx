"use client";
import { FC } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  isLoading?: boolean;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
}) => {
  const isDanger = confirmVariant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="pt-2">
        {/* Content Section */}
        <div className="flex items-start gap-4">
          <div
            className={`flex items-center justify-center p-2.5 rounded-xl shrink-0 border ${
              isDanger
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-blue-50 border-blue-100 text-blue-600"
            }`}
          >
            {isDanger ? (
              <AlertTriangle size={20} strokeWidth={2.5} />
            ) : (
              <Info size={20} strokeWidth={2.5} />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-zinc-900 leading-none">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center gap-2.5 justify-end mt-8 pt-5 border-t border-zinc-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 h-10 font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 h-10 font-medium text-white transition-all active:scale-[0.98] ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200"
                : "bg-zinc-900 hover:bg-zinc-800 shadow-sm"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};