"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    pathname === path
      ? "bg-gray-800 text-white px-3 py-2 rounded"
      : "text-gray-400 hover:text-white px-3 py-2";

  return (
    <aside className="w-64 bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-8">KundCoffee</h1>

      <nav className="flex flex-col gap-2">
        <Link className={linkClass("/")} href="/">Dashboard</Link>
        <Link className={linkClass("/spaces")} href="/spaces">Spaces</Link>
        <Link className={linkClass("/tables")} href="/tables">Tables</Link>
        <Link className={linkClass("/qrcodes")} href="/qrcodes">QR Codes</Link>
      </nav>
    </aside>
  );
}
