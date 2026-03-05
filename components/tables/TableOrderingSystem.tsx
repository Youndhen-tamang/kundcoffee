"use client";

import { useEffect, useState } from "react";
import { Category, Dish, SubMenu, Table, OrderItem, AddOn } from "@/lib/types";
import { getCategories, getDishes, getSubMenus } from "@/services/menu";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import {
  Search,
  Plus,
  Minus,
  UserPlus,
  Users,
  MessageSquare,
  Printer,
  Filter,
  LayoutGrid,
  X,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";

interface CartItem extends Partial<OrderItem> {
  dish?: Dish;
  addons?: AddOn[];
}

interface TableOrderingSystemProps {
  table?: Table;
  onClose: () => void;
  onConfirm: (
    cart: CartItem[],
    guests: number,
    kotRemarks: string,
    staffId: string,
  ) => void;
  isAddingToExisting?: boolean;
  existingItems?: OrderItem[];
}

export function TableOrderingSystem({
  table,
  onClose,
  onConfirm,
  isAddingToExisting = false,
  existingItems = [],
}: TableOrderingSystemProps) {
  const { settings } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedSubMenuId, setSelectedSubMenuId] = useState<string>("ALL");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [guests, setGuests] = useState(1);
  const [kotRemarks, setKotRemarks] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [includeTax, setIncludeTax] = useState(
    settings.includeTaxByDefault === "true",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cData, dData, smData, staffRes] = await Promise.all([
          getCategories(),
          getDishes(),
          getSubMenus(),
          fetch("/api/staff"),
        ]);
        const staffData = await staffRes.json();
        setCategories(cData);
        setDishes(dData);
        setSubMenus(smData);
        if (staffData.success) setStaff(staffData.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDishes = dishes.filter((d) => {
    const matchesSearch = d.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryId === "ALL" || d.categoryId === selectedCategoryId;
    const matchesSubMenu =
      selectedSubMenuId === "ALL" || d.subMenuId === selectedSubMenuId;
    return matchesSearch && matchesCategory && matchesSubMenu;
  });

  const addToCartDirectly = (dish: Dish) => {
    const newItem: CartItem = {
      dishId: dish.id,
      dish: dish,
      quantity: 1,
      unitPrice: dish.price?.listedPrice || 0,
      totalPrice: dish.price?.listedPrice || 0,
      remarks: "",
      addons: [],
    };

    // Check if item already in cart (without addons/remarks) to increment qty instead
    const existingIndex = cart.findIndex(
      (item) =>
        item.dishId === dish.id &&
        (!item.addons || item.addons.length === 0) &&
        !item.remarks,
    );

    if (existingIndex > -1) {
      updateCartQty(existingIndex, 1);
    } else {
      setCart([...cart, newItem]);
    }
  };

  const updateCartQty = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    const addonsTotal = (item.addons || []).reduce(
      (sum, a) => sum + (a.price?.listedPrice || 0),
      0,
    );
    item.totalPrice = ((item.unitPrice || 0) + addonsTotal) * item.quantity;
    setCart(newCart);
  };

  const updateCartItemRemarks = (index: number, newRemarks: string) => {
    const newCart = [...cart];
    newCart[index].remarks = newRemarks;
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + (item.totalPrice || 0),
    0,
  );
  const taxAmount = includeTax ? totalAmount * 0.13 : 0;
  const grandTotal = totalAmount + taxAmount;
  const totalQty = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div
      className={`flex flex-col h-[90vh] w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl`}
    >
      {/* Top Header - Condensed & Professional */}
      <div
        className={`border-b h-14 flex items-center justify-between px-6 ${isAddingToExisting ? "bg-black text-white" : "bg-white text-black border-zinc-100"}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAddingToExisting ? "bg-white text-black" : "bg-black text-white"}`}
            >
              <Users size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h2
                className={`text-[10px] font-black uppercase tracking-widest leading-none ${isAddingToExisting ? "text-white" : "text-black"}`}
              >
                {isAddingToExisting
                  ? "Update Session"
                  : table?.id === "DIRECT"
                    ? "Direct Order"
                    : `Table ${table?.name || "Order"}`}
              </h2>
              <p
                className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-50`}
              >
                {table?.tableType?.name || "Standard"} •{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div
            className={`h-4 w-px ${isAddingToExisting ? "bg-white/10" : "bg-zinc-100"}`}
          />
          <Popover
            trigger={
              <button
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all ${isAddingToExisting ? "bg-white/5 hover:bg-white/10 text-white" : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"} border border-transparent hover:border-black/5 group`}
              >
                <UserPlus
                  size={10}
                  className="opacity-50 group-hover:opacity-100"
                />
                <span className="text-[8px] font-black uppercase tracking-widest">
                  Assign Staff
                </span>
                <ChevronDown size={8} className="opacity-30" />
              </button>
            }
            content={
              <div className="w-48 p-1 bg-white border border-black shadow-xl">
                <p className="px-3 py-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-50 mb-1">
                  Select Service Staff
                </p>
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaffId(s.id)}
                    className={`w-full text-left px-3 py-2 text-[9px] font-bold rounded transition-colors uppercase tracking-tight ${selectedStaffId === s.id ? "bg-black text-white" : "hover:bg-zinc-50 text-zinc-600"}`}
                  >
                    {s.name}
                  </button>
                ))}
                {staff.length === 0 && (
                  <p className="px-3 py-2 text-[8px] italic text-zinc-400">
                    Loading staff...
                  </p>
                )}
              </div>
            }
          />
        </div>
        <div className="flex items-center gap-2">
          {includeTax && (
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              VAT Inclusive (13%)
            </span>
          )}
          <button
            onClick={onClose}
            className={`p-1.5 transition-all opacity-30 hover:opacity-100 ${isAddingToExisting ? "text-white" : "text-black"}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Sidebar (Search + Categories) */}
        <div className="w-56 bg-zinc-50 border-r border-zinc-100 flex flex-col p-4 space-y-6 overflow-hidden">
          {/* Search Section - Condensed */}
          <div className="space-y-2">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
                size={12}
              />
              <input
                type="text"
                placeholder="Find item..."
                className="w-full pl-8 pr-4 py-2 bg-white border border-black/5 rounded-lg text-[10px] outline-none focus:border-black transition-all font-bold placeholder:text-zinc-300 uppercase tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Section - High Density list */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                DISH MENU
              </label>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
              <button
                onClick={() => setSelectedCategoryId("ALL")}
                className={`w-full text-left px-3 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategoryId === "ALL" ? "bg-black text-white shadow-lg shadow-black/10" : "text-zinc-500 hover:bg-zinc-100"}`}
              >
                All Varieties
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategoryId === c.id ? "bg-black text-white shadow-lg shadow-black/10" : "text-zinc-500 hover:bg-zinc-100"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Menus - Integrated instead of Popover */}
          <div className="pt-4 border-t border-zinc-200">
            <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-2 block">
              SUB-MENU FILTERS
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubMenuId("ALL")}
                className={`w-full text-left px-2 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${selectedSubMenuId === "ALL" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:bg-zinc-100"}`}
              >
                Global
              </button>
              {subMenus.map((sm) => (
                <button
                  key={sm.id}
                  onClick={() => setSelectedSubMenuId(sm.id)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${selectedSubMenuId === sm.id ? "bg-emerald-600 text-white" : "text-zinc-400 hover:bg-zinc-100"}`}
                >
                  {sm.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-8 custom-scrollbar">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-50 rounded-2xl h-48 animate-pulse border border-black/5"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => addToCartDirectly(dish)}
                    className="group bg-white rounded-2xl p-6 border border-black/5 hover:border-black hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col relative overflow-hidden"
                  >
                    {/* Plus icon indicator */}
                    <div className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Plus size={14} strokeWidth={3} />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-[14px] font-black text-black leading-tight uppercase tracking-tight flex-1">
                          {dish.name}
                        </h4>
                      </div>

                      <div className="mt-auto flex items-end justify-between border-t border-zinc-50 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                            Price
                          </span>
                          <span className="text-xl font-black text-black leading-none">
                            Rs.{dish.price?.listedPrice ?? 0}
                          </span>
                        </div>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">
                          {dish.category?.name || "Dish"}
                        </span>
                      </div>
                    </div>

                    {/* Professional hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors" />
                  </div>
                ))}
              </div>

              {filteredDishes.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                  <Search size={32} className="text-zinc-400 mb-2" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    No items found
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Cart Summary - Performance POS style */}
        <div className="w-[320px] bg-zinc-50 flex flex-col border-l border-zinc-100 z-10">
          <div
            className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 backdrop-blur-sm z-20 ${isAddingToExisting ? "bg-black text-white" : "bg-white/80 border-zinc-100"}`}
          >
            <div>
              <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                {isAddingToExisting ? "Updating Session" : "Active Selection"}
              </h3>
              <p className="text-[12px] font-black uppercase tracking-tight mt-1">
                {totalQty} Items Added
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[9px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isAddingToExisting && existingItems.length > 0 && (
              <div className="mb-4 bg-zinc-100/50 rounded-lg p-3 border border-zinc-200/50">
                <h4 className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                  Already in Order
                </h4>
                <div className="space-y-1.5 opacity-60">
                  {existingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[9px] uppercase tracking-tighter"
                    >
                      <span className="font-bold text-zinc-600 truncate max-w-[140px]">
                        {item.quantity} ×{" "}
                        {item.dish?.name || item.combo?.name || "Item"}
                      </span>
                      <span className="font-black text-zinc-600">
                        {item.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cart.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-black/5 shadow-sm group relative"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-black leading-none truncate uppercase tracking-tight">
                      {item.dish?.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      Rs. {(item.unitPrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[12px] font-black text-black">
                      {(item.totalPrice ?? 0).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2 bg-zinc-50 rounded-md p-1 border border-zinc-100">
                      <button
                        onClick={() => updateCartQty(idx, -1)}
                        className="p-0.5 text-zinc-400 hover:text-black transition-colors"
                      >
                        <Minus size={8} strokeWidth={3} />
                      </button>
                      <span className="text-[9px] font-black w-3 text-center text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(idx, 1)}
                        className="p-0.5 text-zinc-400 hover:text-black transition-colors"
                      >
                        <Plus size={8} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Note..."
                    className="flex-1 bg-zinc-50 border-none rounded px-2.5 py-1.5 text-[9px] font-bold uppercase outline-none focus:bg-white focus:ring-1 focus:ring-black transition-all text-zinc-600 placeholder:text-zinc-300"
                    value={item.remarks}
                    onChange={(e) => updateCartItemRemarks(idx, e.target.value)}
                  />
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                <LayoutGrid size={48} className="text-zinc-400 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  No items selected
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-black/5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest absolute top-1.5 left-2.5 z-10">
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full pl-2.5 pr-2.5 pt-4 pb-1.5 bg-zinc-50 border border-transparent focus:border-black rounded-lg text-[11px] outline-none transition-all font-black text-black"
                  value={guests}
                  max={table?.capacity}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>

              <div className="relative">
                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest absolute top-1.5 left-2.5 z-10">
                  Staff
                </label>
                <select
                  className="w-full pl-2.5 pr-2.5 pt-4 pb-1.5 bg-zinc-50 border border-transparent focus:border-black rounded-lg text-[11px] outline-none transition-all font-black text-black appearance-none"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">None</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 relative">
                <label className="text-[7px] font-black text-zinc-400 uppercase tracking-widest absolute top-2 left-2.5 z-10">
                  Order Instructions
                </label>
                <textarea
                  className="w-full pl-2.5 pr-2.5 pt-5 pb-1.5 bg-zinc-50 border border-transparent focus:border-black rounded-lg text-[9px] outline-none transition-all font-bold text-black min-h-[50px] resize-none uppercase"
                  placeholder="EX: NO ONIONS..."
                  value={kotRemarks}
                  onChange={(e) => setKotRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                    TOTAL DUE
                  </span>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                    Tax Incl. Rs. {taxAmount?.toFixed(2)}
                  </p>
                </div>
                <span className="text-3xl font-black text-black tracking-tighter leading-none">
                  Rs. {grandTotal?.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() =>
                    onConfirm(cart, guests, kotRemarks, selectedStaffId)
                  }
                  className="col-span-1 h-10 border border-black/5 bg-zinc-50 hover:bg-zinc-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Printer size={14} className="text-zinc-400" />
                </button>
                <button
                  onClick={() =>
                    onConfirm(cart, guests, kotRemarks, selectedStaffId)
                  }
                  disabled={cart.length === 0}
                  className="col-span-4 h-10 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  {isAddingToExisting ? "Sync Update" : "Confirm KOT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
