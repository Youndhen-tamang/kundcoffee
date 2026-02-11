"use client";

import { useEffect, useState } from "react";
import { Category, Dish, SubMenu, Table, OrderItem, AddOn } from "@/lib/types";
import {
  getCategories,
  getDishes,
  getSubMenus,
  getAddOns,
} from "@/services/menu";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
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
  onConfirm: (cart: CartItem[], guests: number, kotRemarks: string) => void;
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
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedSubMenuId, setSelectedSubMenuId] = useState<string>("ALL");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [guests, setGuests] = useState(1);
  const [kotRemarks, setKotRemarks] = useState("");
  const [includeTax, setIncludeTax] = useState(
    settings.includeTaxByDefault === "true",
  );

  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [itemRemarks, setItemRemarks] = useState("");
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [activeDish, setActiveDish] = useState<Dish | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [cData, dData, smData, aData] = await Promise.all([
        getCategories(),
        getDishes(),
        getSubMenus(),
        getAddOns(),
      ]);
      setCategories(cData);
      setDishes(dData);
      setSubMenus(smData);
      setAvailableAddOns(aData);
    };
    console.log("testing", categories);
    console.log(dishes);
    console.log(subMenus);
    console.log(availableAddOns);
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

  const addToCart = (
    dish: Dish,
    qty: number,
    remarks: string,
    addonIds: string[],
  ) => {
    const selectedAddons = availableAddOns.filter((a) =>
      addonIds.includes(a.id),
    );
    const addonsTotal = selectedAddons.reduce(
      (sum, a) => sum + (a.price?.listedPrice || 0),
      0,
    );

    const newItem: CartItem = {
      dishId: dish.id,
      dish: dish,
      quantity: qty,
      unitPrice: dish.price?.listedPrice || 0,
      totalPrice: ((dish.price?.listedPrice || 0) + addonsTotal) * qty,
      remarks: remarks,
      addons: selectedAddons,
    };
    setCart([...cart, newItem]);
    setActiveDish(null);
    setQuantityToAdd(1);
    setItemRemarks("");
    setSelectedAddOnIds([]);
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
      className={`flex flex-col h-[85vh] w-full overflow-hidden rounded-xl border ${isAddingToExisting ? "bg-red-50/30 border-red-200" : "bg-zinc-50 border-zinc-200"}`}
    >
      {/* Top Header */}
      <div
        className={`border-b p-4 flex items-center justify-between shadow-sm px-8 ${isAddingToExisting ? "bg-red-600 text-white" : "bg-white text-zinc-900 border-zinc-100"}`}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <div>
              <h2
                className={`text-sm font-black leading-tight uppercase tracking-widest ${isAddingToExisting ? "text-white" : "text-zinc-900"}`}
              >
                {isAddingToExisting
                  ? "Updating Ongoing Order"
                  : table?.id === "DIRECT"
                    ? "Direct Order"
                    : `Table: ${table?.name || "Order"}`}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest ${isAddingToExisting ? "text-red-100" : "text-zinc-500"}`}
                >
                  {isAddingToExisting
                    ? `Table ${table?.name || ""} • Ongoing Session`
                    : table?.tableType?.name || "Standard Order"}
                </p>
                {isAddingToExisting && (
                  <span className="text-[9px] bg-white text-red-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className={`h-6 w-px ${isAddingToExisting ? "bg-red-400" : "bg-zinc-200"}`}
          />
          <Popover
            trigger={
              <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-red-500 transition-all group">
                <UserPlus
                  size={12}
                  className="text-zinc-400 group-hover:text-red-600"
                />
                <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">
                  Staff
                </span>
                <ChevronDown size={10} className="text-zinc-500" />
              </button>
            }
            content={
              <div className="w-44 py-1">
                {["Waiter John", "Waiter Alex", "Waiter Sarah"].map((staff) => (
                  <button
                    key={staff}
                    className="w-full text-left px-4 py-2 text-[10px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors uppercase tracking-tight"
                  >
                    {staff}
                  </button>
                ))}
              </div>
            }
          />
        </div>
        <button
          onClick={onClose}
          className={`p-2 transition-all ${isAddingToExisting ? "text-red-100 hover:text-white" : "text-zinc-400 hover:text-red-500"}`}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col bg-white border-r border-zinc-100 p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-600 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search and add dishes..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs transition-all outline-none font-normal placeholder:text-zinc-400 ${isAddingToExisting ? "bg-white border-red-200 focus:border-red-500 text-red-900" : "bg-zinc-50 border-zinc-200 focus:border-red-500 text-zinc-900"}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover
                trigger={
                  <Button
                    variant="secondary"
                    className={`h-10 px-4 bg-white border shadow-sm text-zinc-600 flex items-center gap-2 rounded-xl ${isAddingToExisting ? "border-red-200 hover:border-red-400" : "border-zinc-200 hover:border-red-400"}`}
                  >
                    <Filter
                      size={14}
                      className={isAddingToExisting ? "text-red-400" : ""}
                    />
                    <span className="text-[10px] font-medium uppercase tracking-widest">
                      Sub-Menus
                    </span>
                  </Button>
                }
                content={
                  <div className="w-56 p-1">
                    <button
                      onClick={() => setSelectedSubMenuId("ALL")}
                      className={`w-full text-left px-3 py-2 text-[9px] font-medium rounded mb-0.5 transition-all uppercase ${selectedSubMenuId === "ALL" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
                    >
                      All
                    </button>
                    {subMenus.map((sm) => (
                      <button
                        key={sm.id}
                        onClick={() => setSelectedSubMenuId(sm.id)}
                        className={`w-full text-left px-3 py-2 text-[9px] font-medium rounded mb-0.5 transition-all uppercase ${selectedSubMenuId === sm.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
                      >
                        {sm.name}
                      </button>
                    ))}
                  </div>
                }
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId("ALL")}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === "ALL" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === c.id ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => setActiveDish(dish)}
                  className="group bg-white border border-zinc-100 rounded-md shadow-sm hover:shadow-md hover:border-red-400 transition-all cursor-pointer aspect-square flex flex-col p-3"
                >
                  {/* Image */}
                  <div className="flex-1 rounded-md bg-zinc-50 overflow-hidden border border-zinc-100 mb-2">
                    {dish.image?.[0] ? (
                      <img
                        src={dish.image[0]}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <LayoutGrid size={24} />
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="text-center space-y-0.5">
                    <h4 className="text-[11px] font-bold text-zinc-900 uppercase truncate">
                      {dish.name}
                    </h4>
                    <p className="text-[8px] text-zinc-500 font-medium uppercase tracking-widest truncate">
                      {dish.type}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="mt-auto pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-900">
                      Rs. {dish.price?.listedPrice.toFixed(2)}
                    </span>
                    <div className="p-1 rounded-md text-zinc-400 group-hover:text-red-500 transition-colors">
                      <PlusCircle size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart Summary */}
        <div className="w-[380px] bg-zinc-50/50 flex flex-col border-l border-zinc-100 shadow-sm z-10">
          <div
            className={`p-6 border-b flex items-center justify-between sticky top-0 backdrop-blur-sm z-20 ${isAddingToExisting ? "bg-red-600/5 text-zinc-900 border-red-100" : "bg-white/50 border-zinc-100"}`}
          >
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {isAddingToExisting ? "Current Order Addition" : "Draft Order"}
            </h3>
            <span
              className={`text-[9px] px-2.5 py-1 rounded font-bold uppercase tracking-widest ${isAddingToExisting ? "bg-red-100 text-red-700" : "bg-zinc-200 text-zinc-700"}`}
            >
              {cart.length} New Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {isAddingToExisting && existingItems.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest px-1">
                  Already in Order
                </h4>
                <div className="space-y-2 opacity-60">
                  {existingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[10px] bg-red-50/50 p-2 rounded-lg border border-red-100/50"
                    >
                      <span className="font-medium text-red-900">
                        {item.quantity} x{" "}
                        {item.dish?.name || item.combo?.name || "Item"}
                      </span>
                      <span className="text-red-600 font-bold">
                        Rs. {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-red-100 mx-1" />
              </div>
            )}
            {cart.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm group relative"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-medium text-zinc-900 leading-tight truncate uppercase tracking-tight">
                      {item.dish?.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Rs. {item.unitPrice?.toFixed(2)}
                    </span>
                    {item.addons && item.addons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.addons.map((a) => (
                          <span
                            key={a.id}
                            className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-50 font-medium uppercase"
                          >
                            +{a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[12px] font-medium text-zinc-900">
                      Rs. {item.totalPrice?.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3 bg-zinc-50 rounded-lg p-1 border border-zinc-100">
                      <button
                        onClick={() => updateCartQty(idx, -1)}
                        className="p-1 text-zinc-500 hover:text-red-600 transition-colors"
                      >
                        <Minus size={10} strokeWidth={2} />
                      </button>
                      <span className="text-[10px] font-medium w-4 text-center text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(idx, 1)}
                        className="p-1 text-zinc-500 hover:text-red-600 transition-colors"
                      >
                        <Plus size={10} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Add specific notes..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-[9px] font-normal uppercase outline-none focus:bg-white focus:border-red-400 transition-all text-zinc-600 placeholder:text-zinc-400"
                    value={item.remarks}
                    onChange={(e) => updateCartItemRemarks(idx, e.target.value)}
                  />
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="absolute -top-1 -right-1 p-1 bg-zinc-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md scale-75"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                <LayoutGrid size={48} className="text-zinc-400 mb-4" />
                <p className="text-[10px] font-medium uppercase tracking-[0.2em]">
                  Cart is empty
                </p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-zinc-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest px-1">
                  Guests
                </label>
                <div className="relative">
                  <Users
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full pl-8 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] outline-none focus:border-red-400 transition-all font-medium text-zinc-900"
                    value={guests}
                    max={table?.capacity}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest px-1">
                  KOT Remarks
                </label>
                <div className="relative">
                  <MessageSquare
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    placeholder="General notes..."
                    className="w-full pl-8 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] outline-none focus:border-red-400 transition-all font-medium text-zinc-900"
                    value={kotRemarks}
                    onChange={(e) => setKotRemarks(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-zinc-100">
              {settings.includeTaxByDefault === "true" && (
                <div className="flex items-center justify-between pb-2">
                  <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest px-1">
                    Tax Status: {includeTax ? "Enabled (13%)" : "Disabled"}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-zinc-600 px-1">
                <span>Sub-Total ({totalQty} pkts)</span>
                <span className="text-zinc-900">
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">
                  Grand Total
                </span>
                <span className="text-3xl font-medium text-zinc-900 leading-none tracking-tight">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="h-12 flex items-center justify-center border border-zinc-200 text-zinc-500 rounded-xl hover:bg-zinc-50 transition-colors"
                  onClick={() => onConfirm(cart, guests, kotRemarks)}
                >
                  <Printer size={16} />
                </button>
                <Button
                  onClick={() => onConfirm(cart, guests, kotRemarks)}
                  className={`h-12 text-white font-bold text-[10px] uppercase tracking-widest border-none rounded-xl shadow-lg transition-all active:scale-95 ${isAddingToExisting ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-red-600 hover:bg-red-700 shadow-red-500/20"}`}
                >
                  {isAddingToExisting
                    ? "Update & Print KOT"
                    : "Confirm & Send to Kitchen"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!activeDish}
        onClose={() => setActiveDish(null)}
        title=""
        size="sm"
      >
        {activeDish && (
          <div className="p-4 space-y-8">
            <div className="w-full aspect-2/1 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center relative">
              {activeDish.image?.[0] ? (
                <img
                  src={activeDish.image[0]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <LayoutGrid size={40} className="text-zinc-300" />
              )}
              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-medium border border-zinc-200 uppercase tracking-widest text-zinc-600">
                {activeDish.type}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 tracking-tight uppercase">
                    {activeDish.name}
                  </h3>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase mt-1 tracking-widest">
                    {activeDish.kotType} • {activeDish.preparationTime} Mins
                    Prep
                  </p>
                </div>
                <span className="text-2xl font-medium text-zinc-900">
                  Rs. {activeDish.price?.listedPrice.toFixed(2)}
                </span>
              </div>

              {availableAddOns.length > 0 && (
                <div className="space-y-3 px-1">
                  <label className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest block">
                    Pick Add-ons
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableAddOns.map((addon) => (
                      <button
                        key={addon.id}
                        onClick={() =>
                          setSelectedAddOnIds((prev) =>
                            prev.includes(addon.id)
                              ? prev.filter((id) => id !== addon.id)
                              : [...prev, addon.id],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-[9px] font-medium uppercase tracking-widest transition-all ${selectedAddOnIds.includes(addon.id) ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200"}`}
                      >
                        {addon.name} (+Rs. {addon.price?.listedPrice.toFixed(2)}
                        )
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 px-1">
                <div className="space-y-3">
                  <label className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest block">
                    Qty
                  </label>
                  <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <button
                      onClick={() =>
                        setQuantityToAdd(Math.max(1, quantityToAdd - 1))
                      }
                      className="w-8 h-8 rounded bg-white border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-red-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-lg font-medium text-zinc-900">
                      {quantityToAdd}
                    </span>
                    <button
                      onClick={() => setQuantityToAdd(quantityToAdd + 1)}
                      className="w-8 h-8 rounded bg-white border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-red-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest block">
                    Custom Note
                  </label>
                  <input
                    placeholder="e.g. Extra spicy"
                    className="w-full h-[50px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 text-[10px] outline-none focus:border-red-400 font-medium uppercase text-zinc-700"
                    value={itemRemarks}
                    onChange={(e) => setItemRemarks(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() =>
                addToCart(
                  activeDish,
                  quantityToAdd,
                  itemRemarks,
                  selectedAddOnIds,
                )
              }
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
            >
              Add — Rs.{" "}
              {(
                ((activeDish.price?.listedPrice || 0) +
                  availableAddOns
                    .filter((a) => selectedAddOnIds.includes(a.id))
                    .reduce((s, a) => s + (a.price?.listedPrice || 0), 0)) *
                quantityToAdd
              ).toFixed(2)}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
