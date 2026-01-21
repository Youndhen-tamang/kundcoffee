"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const linkClass = (path: string) =>
    pathname === path
      ? "bg-gray-200 text-gray-800 px-3 py-2 rounded"
      : "text-gray-500 hover:text-gray-800 hover:bg-gray-200 px-3 py-2 rounded";

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-300 text-white p-6">
      <h1 className="text-xl font-bold mb-8 text-gray-700">KundCoffee</h1>

      <nav className="flex flex-col gap-2">
        <Link className={`${linkClass("/")} font-bold text-gray-600  px-3 py-2 hover:bg-gray-200`} href="/">
          Dashboard
        </Link>

        <button
          onClick={() => toggleSection("tables")}
          className="flex justify-between items-center text-gray-600 hover:text-gray-800 px-3 py-2 hover:bg-gray-200"
        >
          Tables
          <span>{openSection === "tables" ? "−" : "+"}</span>
        </button>

        {openSection === "tables" && (
          <div className="ml-4 flex flex-col gap-1">
            <Link className={`${linkClass("/spaces")}`} href="/spaces">
              Spaces
            </Link>
            <Link className={linkClass("/tables")} href="/tables">
              Tables
            </Link>
            <Link className={linkClass("/qrcodes")} href="/qrcodes">
              QR Codes
            </Link>
          </div>
        )}

        {/* Menu Accordion */}
        <button
          onClick={() => toggleSection("menu")}
          className="flex justify-between items-center text-gray-600 hover:text-gray-800 px-3 py-2 hover:bg-gray-200"
        >
          Menu
          <span>{openSection === "menu" ? "−" : "+"}</span>
        </button>

        {openSection === "menu" && (
          <div className="ml-4 flex flex-col gap-1">
            <Link className={linkClass("/menu/dishes")} href="/menu/dishes">
              Dishes
            </Link>
            <Link
              className={linkClass("/menu/categories")}
              href="/menu/categories"
            >
              Categories
            </Link>
            <Link
              className={linkClass("/menu/sub-menus")}
              href="/menu/sub-menus"
            >
              Sub Menu
            </Link>
            <Link className={linkClass("/menu/addons")} href="/menu/addons">
              Add-Ons & Extra
            </Link>
            <Link className={linkClass("/menu/combos")} href="/menu/combos">
              Combo
            </Link>
            <Link className={linkClass("/menu/sets")} href="/menu/sets">
              Menu Sets
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
