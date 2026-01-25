"use client";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";

interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: "left" | "right";
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Popover: FC<PopoverProps> = ({
  trigger,
  content,
  align = "left",
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? controlledSetIsOpen : setInternalIsOpen;

  const toggle = () => setIsOpen && setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        if (setIsOpen) setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative inline-block text-left " ref={popoverRef}>
      <div onClick={toggle}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute z-40  mt-2 w-78 origin-top-right rounded-xl bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${align === "right" ? "right-0" : "left-0"}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
