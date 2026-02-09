"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Order, Customer, OrderItem } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  CreditCard,
  Banknote,
  QrCode,
  User,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  Zap,
  Gift,
  Tag,
  Loader2,
  PlusCircle,
  LayoutGrid,
} from "lucide-react";
import {
  getCategories,
  getDishes,
  getAddOns,
  getCombos,
} from "@/services/menu";
import { CustomDropdown } from "../ui/CustomDropdown";
import {
  addCustomer,
  getCustomers,
  getCustomerSummary,
} from "@/services/customer";
import { useSettings } from "@/components/providers/SettingsProvider";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onCheckoutComplete: (result: any) => void;
}

type Step = "PREPARE" | "BILL" | "PAYMENT" | "SUCCESS";

export function CheckoutModal({
  isOpen,
  onClose,
  order,
  onCheckoutComplete,
}: CheckoutModalProps) {
  const { settings } = useSettings();
  const [step, setStep] = useState<Step>("PREPARE");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    order.customer || null,
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "QR" | "CARD" | "CREDIT"
  >("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [includeTax, setIncludeTax] = useState(false);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);

  // New Customer Form State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ fullName: "", phone: "" });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Complimentary items mapping (itemId -> quantity)
  const [complimentaryItems, setComplimentaryItems] = useState<
    Record<string, number>
  >({});
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"PERCENT" | "AMOUNT">(
    "PERCENT",
  );
  const [customTaxes, setCustomTaxes] = useState<
    { name: string; percentage: number }[]
  >([]);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxPercent, setNewTaxPercent] = useState("");
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [isSelectingFreeItems, setIsSelectingFreeItems] = useState(false);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [extraFreeItems, setExtraFreeItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState({
    toReceive: 0,
    toPay: 0,
    netToReceive: 0,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    loyaltyId: "",
    openingBalance: 0,
  });

  const [showQrImage, setShowQrImage] = useState(false);

  const fetchData = async () => {
    const res = await getCustomerSummary();
    if (res.success) {
      setCustomers(res.data);
      setFilteredCustomers(res.data);
      setMetrics(res.metrics);
    }
  };

  const fetchMenuData = async () => {
    try {
      const [catData, dishData, addonData, comboData] = await Promise.all([
        getCategories(),
        getDishes(),
        getAddOns(),
        getCombos(),
      ]);
      setCategories(catData);
      setAvailableItems([
        ...dishData.map((d: any) => ({ ...d, type: "DISH" })),
        ...addonData.map((a: any) => ({ ...a, type: "ADDON" })),
        ...comboData.map((c: any) => ({ ...c, type: "COMBO" })),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isSelectingFreeItems) {
      fetchMenuData();
    }
  }, [isSelectingFreeItems]);
  const handleCreateCustomer = async () => {
    if (!formData.fullName) return;
    const res = await addCustomer(formData);
    if (res.success) {
      setSelectedCustomer(res.data);
      setIsAddModalOpen(false);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        dob: "",
        loyaltyId: "",
        openingBalance: 0,
      });
      fetchData();
    } else {
      alert(res.message || "Failed to add customer");
    }
  };

  // Calculations
  const calculatedSubtotal = useMemo(() => {
    return order.items.reduce((sum, item) => {
      const compQty = complimentaryItems[item.id] || 0;
      const paidQty = Math.max(0, item.quantity - compQty);
      return sum + paidQty * item.unitPrice;
    }, 0);
  }, [order.items, complimentaryItems]);

  const loyaltyDiscountPercent = selectedCustomer?.loyaltyDiscount || 0;
  const manualDiscountAmount = useMemo(() => {
    if (discountType === "PERCENT") {
      return (calculatedSubtotal * discountValue) / 100;
    } else {
      return discountValue;
    }
  }, [calculatedSubtotal, discountValue, discountType]);

  const loyaltyDiscountAmount = useMemo(() => {
    return (calculatedSubtotal * loyaltyDiscountPercent) / 100;
  }, [calculatedSubtotal, loyaltyDiscountPercent]);

  const totalDiscount = Math.min(
    manualDiscountAmount + loyaltyDiscountAmount,
    calculatedSubtotal,
  );

  const subtotalAfterDiscount = calculatedSubtotal - totalDiscount;

  const extraFreeValue = extraFreeItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  // const discountAmount = useMemo(() => {
  //   let totalDiscount = 0;

  //   // 1️⃣ Loyalty discount (percent only)
  //   if (loyaltyDiscountPercent > 0) {
  //     totalDiscount += (calculatedSubtotal * loyaltyDiscountPercent) / 100;
  //   }

  //   // 2️⃣ Manual discount
  //   if (discountType === "PERCENT") {
  //     totalDiscount += (calculatedSubtotal * discountValue) / 100;
  //   } else {
  //     totalDiscount += discountValue;
  //   }

  //   return Math.min(totalDiscount, calculatedSubtotal);
  // }, [calculatedSubtotal, discountValue, discountType, loyaltyDiscountPercent]);

  const taxRate = 0.13;
  const serviceChargeRate = 0.1;

  const taxAmount = includeTax ? subtotalAfterDiscount * taxRate : 0;
  const customTaxesTotal = customTaxes.reduce(
    (sum, tax) => sum + subtotalAfterDiscount * (tax.percentage / 100),
    0,
  );
  const serviceChargeAmount = includeServiceCharge
    ? subtotalAfterDiscount * serviceChargeRate
    : 0;

  const grandTotal =
    subtotalAfterDiscount + taxAmount + serviceChargeAmount + customTaxesTotal;

  const handleAddTax = () => {
    if (!newTaxName || !newTaxPercent) return;
    setCustomTaxes([
      ...customTaxes,
      { name: newTaxName, percentage: parseFloat(newTaxPercent) },
    ]);
    setNewTaxName("");
    setNewTaxPercent("");
    setIsAddingTax(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // const handleProcessCheckout = async () => {
  //   setIsProcessing(true);
  //   try {
  //     const res = await fetch("/api/checkout", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         tableId: order.tableId,
  //         paymentMethod,
  //         amount: grandTotal,
  //         customerId: selectedCustomer?.id,
  //         subtotal: calculatedSubtotal,
  //         tax: taxAmount,
  //         serviceCharge: serviceChargeAmount,
  //         discount: totalDiscount,
  //         manualDiscount: manualDiscountAmount,
  //         loyaltyDiscount: loyaltyDiscountAmount,
  //       }),
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       setStep("SUCCESS");
  //       setTimeout(() => {
  //         onCheckoutComplete(data.data);
  //         onClose();
  //       }, 2000);
  //     } else {
  //       alert(data.message || "Checkout failed");
  //     }
  //   } catch (error) {
  //     console.error("Checkout Error:", error);
  //     alert("An error occurred during checkout");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };
  const handleProcessCheckout = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: order.tableId,
          sessionId: order.sessionId,
          paymentMethod, // This will be "QR", "CASH", or "CARD"
          amount: grandTotal,
          customerId: selectedCustomer?.id,
          subtotal: calculatedSubtotal, // This is net subtotal after complimentary
          tax: taxAmount + customTaxesTotal,
          serviceCharge: serviceChargeAmount,
          discount: totalDiscount,
          complimentaryItems,
          extraFreeItems: extraFreeItems.map((i) => ({
            name: i.name,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // SUCCESS FOR ALL METHODS (CASH, CARD, AND QR)
        setStep("SUCCESS");

        // Wait 2 seconds then close
        setTimeout(() => {
          onCheckoutComplete(data.data);
          onClose();
        }, 2000);
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const setCompQty = (itemId: string, qty: number, maxQty: number) => {
    const safeQty = Math.max(0, Math.min(qty, maxQty));
    setComplimentaryItems((prev) => ({ ...prev, [itemId]: safeQty }));
  };

  const addFreeItem = (menuItem: any) => {
    setExtraFreeItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          unitPrice: menuItem.price?.listedPrice || 0,
          quantity: 1,
        },
      ];
    });
  };

  const removeFreeItem = (itemId: string) => {
    setExtraFreeItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomer.fullName) return;
    setIsAddingCustomer(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();
      if (data.id) {
        setSelectedCustomer(data);
        setShowAddCustomer(false);
        setNewCustomer({ fullName: "", phone: "" });
      }
    } catch (error) {
      console.error("Error adding customer:", error);
    } finally {
      setIsAddingCustomer(false);
    }
  };

  useEffect(() => {
    const customer = async () => {
      const data = await getCustomers();
      setCustomers(data);
    };
    customer();
  }, []);

  const renderPrepare = () => (
    <div className="space-y-6">
      {/* Items Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Order Items
          </h3>
          <Button
            onClick={() => setIsSelectingFreeItems(true)}
            variant="secondary"
            className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
          >
            <PlusCircle size={14} className="mr-1.5" /> Select Free Items
          </Button>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 uppercase tracking-widest text-[10px] text-zinc-400 font-black">
            <tr>
              <th className="px-4 py-3 font-black">Item</th>
              <th className="px-4 py-3 font-black text-center">Qty</th>
              <th className="px-4 py-3 font-black text-center w-28">
                Comp Qty
              </th>
              <th className="px-4 py-3 font-black text-right">Rate</th>
              <th className="px-4 py-3 font-black text-right">Total</th>
              <th className="px-4 py-3 font-black text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items.map((item) => {
              const compQty = complimentaryItems[item.id] || 0;
              return (
                <tr
                  key={item.id}
                  className={`${compQty > 0 ? "bg-emerald-50/30" : ""}`}
                >
                  <td className="px-4 py-4">
                    <p className="font-bold text-zinc-900">
                      {item.dish?.name || item.combo?.name || "Dish"}
                    </p>
                    {compQty > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1 mt-1">
                        <Gift size={10} /> {compQty} complimentary
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-zinc-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 flex justify-center">
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={compQty}
                      onChange={(e) =>
                        setCompQty(
                          item.id,
                          parseInt(e.target.value) || 0,
                          item.quantity,
                        )
                      }
                      className="w-16 h-8 bg-white border border-zinc-200 rounded-lg text-center text-xs font-bold focus:ring-1 ring-emerald-500 outline-none"
                    />
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-zinc-600">
                    {settings.currency} {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-zinc-900">
                    <span
                      className={
                        compQty >= item.quantity
                          ? "line-through text-zinc-400 decoration-2"
                          : ""
                      }
                    >
                      {settings.currency}{" "}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    {compQty > 0 && (
                      <span className="ml-2 text-emerald-600">
                        {settings.currency}{" "}
                        {(
                          Math.max(0, item.quantity - compQty) * item.unitPrice
                        ).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4"></td>
                </tr>
              );
            })}

            {extraFreeItems.map((item) => (
              <tr key={item.id} className="bg-emerald-50/50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Gift size={14} className="text-emerald-500" />
                    <p className="font-black text-emerald-700 uppercase tracking-tight">
                      {item.name}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70">
                    Extra Free Item
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-black text-emerald-700">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Free
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-medium text-emerald-600/60">
                  {settings.currency} {item.unitPrice.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right font-black text-emerald-600">
                  {settings.currency} 0.00
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => removeFreeItem(item.id)}
                    className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Discounts & Toggles */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Discounts & Settings
            </h4>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Discount Type
                </label>
                <div className="flex bg-white p-1 rounded-xl border border-zinc-200">
                  <button
                    onClick={() => setDiscountType("PERCENT")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${discountType === "PERCENT" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    Percent (%)
                  </button>
                  <button
                    onClick={() => setDiscountType("AMOUNT")}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${discountType === "AMOUNT" ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    Amount (Rs.)
                  </button>
                </div>
              </div>
              <div className="w-32 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Value
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-[38px] px-4 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Add Tax (13%)
                </span>
                <button
                  onClick={() => setIncludeTax(!includeTax)}
                  className={`w-6 h-3 rounded-full transition-colors relative ${includeTax ? "bg-red-500" : "bg-zinc-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${includeTax ? "left-[13px]" : "left-0.5"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Service Chg (10%)
                </span>
                <button
                  onClick={() => setIncludeServiceCharge(!includeServiceCharge)}
                  className={`w-6 h-3 rounded-full transition-colors relative ${includeServiceCharge ? "bg-red-500" : "bg-zinc-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${includeServiceCharge ? "left-[13px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Custom Taxes
              </h4>
              {!isAddingTax ? (
                <button
                  onClick={() => setIsAddingTax(true)}
                  className="text-[10px] font-bold text-red-600 uppercase tracking-wider hover:text-red-700"
                >
                  + Add
                </button>
              ) : (
                <button
                  onClick={() => setIsAddingTax(false)}
                  className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
                >
                  Cancel
                </button>
              )}
            </div>

            {isAddingTax && (
              <div className="flex gap-2 items-center bg-white p-2 rounded-lg animate-in slide-in-from-top-2 border border-zinc-200">
                <input
                  placeholder="Tax Name"
                  className="text-[10px] p-2 rounded border bg-zinc-50 flex-1 outline-none focus:border-zinc-900"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                />
                <input
                  placeholder="%"
                  type="number"
                  className="text-[10px] p-2 rounded border bg-zinc-50 w-14 outline-none focus:border-zinc-900"
                  value={newTaxPercent}
                  onChange={(e) => setNewTaxPercent(e.target.value)}
                />
                <button
                  onClick={handleAddTax}
                  className="bg-zinc-900 text-white p-2 rounded shadow-sm hover:bg-zinc-800"
                >
                  <CheckCircle2 size={14} />
                </button>
              </div>
            )}

            <div className="space-y-2">
              {customTaxes.map((tax, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[10px] font-bold text-zinc-600 bg-white p-2 rounded border border-zinc-100"
                >
                  <span>
                    {tax.name} ({tax.percentage}%)
                  </span>
                  <button
                    onClick={() =>
                      setCustomTaxes(customTaxes.filter((_, i) => i !== idx))
                    }
                    className="text-zinc-300 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Customer (Optional)
            </h4>

            <CustomDropdown
              label="Customer"
              options={customers.map((c) => ({ id: c.id, name: c.fullName }))}
              value={selectedCustomer ? selectedCustomer.id : undefined}
              onChange={(value) => {
                const customer = customers.find((c) => c.id === value);
                setSelectedCustomer(customer ?? null);
              }}
              placeholder="Select Customer"
              onAddNew={() => setIsAddModalOpen(true)}
            />
            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <p className="font-bold text-xs">
                    {selectedCustomer.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-zinc-300 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : showAddCustomer ? (
              <div className="space-y-3 p-4 bg-white rounded-xl border border-zinc-200">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newCustomer.fullName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddCustomer(false)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-[9px] font-black uppercase tracking-widest h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewCustomer}
                    disabled={isAddingCustomer}
                    size="sm"
                    className="flex-1 bg-zinc-900 text-white text-[9px] uppercase font-black  tracking-widest h-8"
                  >
                    {isAddingCustomer ? "Saving..." : "Save Customer"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Search customer..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-zinc-900 outline-none"
                  />
                </div>
                <Button
                  onClick={() => setShowAddCustomer(true)}
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-[0.1em] h-10 border-dashed border-2"
                >
                  <Plus size={14} />
                  Register New Customer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Calculations Summary */}
        <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-4 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
              <span>Subtotal</span>
              <span className="text-white">
                {settings.currency} {calculatedSubtotal.toFixed(2)}
              </span>
            </div>
            {loyaltyDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-red-400 uppercase tracking-widest font-black">
                <span>Loyalty ({loyaltyDiscountPercent}%)</span>
                <span>
                  - {settings.currency} {loyaltyDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {manualDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400 uppercase tracking-widest font-black">
                <span>Discount</span>
                <span>
                  - {settings.currency} {manualDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {includeTax && (
              <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
                <span>Tax (13%)</span>
                <span className="text-white">
                  {settings.currency} {taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            {includeServiceCharge && (
              <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
                <span>Service Charge (10%)</span>
                <span className="text-white">
                  {settings.currency} {serviceChargeAmount.toFixed(2)}
                </span>
              </div>
            )}
            {customTaxes.map((tax, idx) => (
              <div
                key={idx}
                className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black"
              >
                <span>
                  {tax.name} ({tax.percentage}%)
                </span>
                <span className="text-white">
                  {settings.currency}{" "}
                  {(subtotalAfterDiscount * (tax.percentage / 100)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Grand Total
              </span>
              <span className="text-4xl font-black">
                {settings.currency} {grandTotal.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={() => setStep("BILL")}
              className="w-full h-14 bg-red-600 text-white hover:bg-red-700 uppercase tracking-[0.2em] font-black text-xs shadow-xl shadow-red-500/10"
            >
              Confirm Checkout & Generate Bill
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBill = () => (
    <div className="space-y-6 flex flex-col items-center">
      <div
        id="printable-bill"
        className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl p-6 w-full max-w-md shadow-sm print:fixed print:inset-0 print:border-none print:shadow-none print:z-50 print:bg-white"
      >
        {/* Restaurant Header */}
        <div className="text-center mb-6 border-b border-zinc-200 pb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Kund Coffee
          </h2>
          <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest leading-relaxed">
            Kathmandu, Nepal
            <br />
            Contact: +977 1234567
            <br />
            PAN: 123456789
          </p>
        </div>

        {/* Invoice & Table */}
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
          <div className="space-y-1">
            <p>Invoice #: {order.id.slice(-6).toUpperCase()}</p>
            <p>Table: {order.table?.name || "N/A"}</p>
          </div>
          <div className="text-right space-y-1">
            <p>{new Date().toLocaleDateString()}</p>
            <p>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-6">
          {order.items.map((item) => {
            const isComplimentary = complimentaryItems[item.id];
            return (
              <div
                key={item.id}
                className="flex justify-between items-start text-xs"
              >
                <div className="flex-1">
                  <p className="font-bold text-zinc-900 tracking-tight">
                    {item.dish?.name || item.combo?.name || "Dish"}
                    {complimentaryItems[item.id] > 0 && (
                      <span className="ml-1 text-emerald-600 text-[9px] font-black italic">
                        ({complimentaryItems[item.id]} Complimentary)
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                    {item.quantity} × Rs. {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-zinc-900 ${complimentaryItems[item.id] >= item.quantity ? "line-through text-zinc-300" : ""}`}
                  >
                    Rs. {item.totalPrice.toFixed(2)}
                  </p>
                  {complimentaryItems[item.id] > 0 && (
                    <p className="font-bold text-emerald-600">
                      Rs.{" "}
                      {(
                        Math.max(
                          0,
                          item.quantity - (complimentaryItems[item.id] || 0),
                        ) * item.unitPrice
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-1 border-t border-zinc-200 pt-4 text-[10px]">
          <div className="flex justify-between font-black uppercase tracking-widest text-zinc-500">
            <span>Subtotal</span>
            <span>Rs. {calculatedSubtotal.toFixed(2)}</span>
          </div>

          {loyaltyDiscountAmount > 0 && (
            <div className="flex justify-between font-black uppercase tracking-widest text-red-600">
              <span>Loyalty ({loyaltyDiscountPercent}%)</span>
              <span>- Rs. {loyaltyDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          {manualDiscountAmount > 0 && (
            <div className="flex justify-between font-black uppercase tracking-widest text-emerald-600">
              <span>Discount</span>
              <span>- Rs. {manualDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          {includeTax && (
            <div className="flex justify-between font-black uppercase tracking-widest text-zinc-500">
              <span>Tax (13%)</span>
              <span>Rs. {taxAmount.toFixed(2)}</span>
            </div>
          )}

          {includeServiceCharge && (
            <div className="flex justify-between font-black uppercase tracking-widest text-zinc-500">
              <span>Service Charge (10%)</span>
              <span>Rs. {serviceChargeAmount.toFixed(2)}</span>
            </div>
          )}

          {customTaxes.map((tax, idx) => (
            <div
              key={idx}
              className="flex justify-between font-black uppercase tracking-widest text-zinc-500"
            >
              <span>
                {tax.name} ({tax.percentage}%)
              </span>
              <span>
                Rs.{" "}
                {(subtotalAfterDiscount * (tax.percentage / 100)).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Grand Total */}
          <div className="flex justify-between font-black text-zinc-900 text-2xl pt-2 border-t border-zinc-900 mt-2">
            <span className="uppercase tracking-[0.2em] text-[10px] self-center">
              Grand Total
            </span>
            <span>Rs. {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.4em]">
            Thank You!
          </p>
          <p className="text-[8px] text-zinc-300 font-bold italic tracking-widest">
            Powered by Kund ERP
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 w-full max-w-md mt-4">
        <Button
          variant="secondary"
          onClick={() => setStep("PREPARE")}
          className="flex-1 h-14 uppercase tracking-widest text-[10px] font-black border-zinc-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Edit Order
        </Button>
        <Button
          onClick={handlePrint}
          className="flex-1 h-14 bg-zinc-900 text-white hover:bg-zinc-800 uppercase tracking-widest text-[10px] font-black"
        >
          <Printer size={16} className="mr-2" />
          Print Bill
        </Button>
      </div>

      <Button
        onClick={() => setStep("PAYMENT")}
        className="w-full max-w-md h-14 bg-red-600 text-white hover:bg-red-700 uppercase tracking-[0.3em] font-black text-xs shadow-xl mt-4"
      >
        Proceed to Payment
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

  // const renderPayment = () => (
  //   <div className="space-y-8 max-w-2xl mx-auto py-4">
  //     <div className="text-center space-y-2">
  //       <h3 className="text-3xl font-black text-zinc-900 tracking-tight">
  //         ${grandTotal.toFixed(2)}
  //       </h3>
  //       <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
  //         Select Payment Method to Finalize
  //       </p>
  //     </div>

  //     <div className="grid grid-cols-3 gap-6">
  //       {[
  //         { id: "CASH", label: "Cash", icon: Banknote },
  //         { id: "QR", label: "QR Payment", icon: QrCode },
  //         { id: "CARD", label: "Credit Card", icon: CreditCard },
  //       ].map((method) => (
  //         <button
  //           key={method.id}
  //           onClick={() => setPaymentMethod(method.id as any)}
  //           className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all gap-4 ${
  //             paymentMethod === method.id
  //               ? "border-red-500 bg-red-50 text-red-600 shadow-xl shadow-red-500/10 active:scale-95"
  //               : "border-zinc-100 hover:border-zinc-200 text-zinc-400 bg-white"
  //           }`}
  //         >
  //           <method.icon size={36} strokeWidth={1.5} />
  //           <span className="text-[10px] font-black uppercase tracking-[0.2em]">
  //             {method.label}
  //           </span>
  //         </button>
  //       ))}
  //     </div>

  //     <div className="flex gap-4 pt-10">
  //       <Button
  //         variant="secondary"
  //         onClick={() => setStep("BILL")}
  //         className="flex-1 h-16 uppercase tracking-widest text-[10px] font-black border-zinc-200"
  //       >
  //         <ArrowLeft size={16} className="mr-2" />
  //         Review Bill
  //       </Button>
  //       <Button
  //         onClick={handleProcessCheckout}
  //         disabled={isProcessing}
  //         className="flex-[2] h-16 bg-red-600 text-white hover:bg-red-700 uppercase tracking-[0.4em] font-black text-sm shadow-2xl shadow-red-500/20 active:scale-[0.98]"
  //       >
  //         {isProcessing ? "Processing..." : "Secure Finalize"}
  //         <CheckCircle2 size={20} className="ml-3" />
  //       </Button>
  //     </div>
  //   </div>
  // );

  const renderPayment = () => (
    <div className="space-y-8 max-w-2xl mx-auto py-4">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-zinc-900 tracking-tight">
          {settings.currency} {grandTotal.toFixed(2)}
        </h3>
        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
          {showQrImage ? "Scan & Verify" : "Select Payment Method to Finalize"}
        </p>
      </div>

      {showQrImage ? (
        /* --- STATIC QR VIEW (MANUAL VERIFY) --- */
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in">
          {/* QR Image Container */}
          <div className="p-2 bg-white border-2 border-emerald-500 rounded-2xl shadow-xl">
            {/* MAKE SURE 'merchant-qr.jpg' IS IN YOUR PUBLIC FOLDER */}
            <img
              src="/merchant-qr.jpg"
              alt="Merchant QR"
              className="w-64 h-64 object-contain rounded-xl"
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-zinc-800 uppercase">
              Scan using Mobile Banking / Wallet
            </p>
            <p className="text-[10px] text-zinc-500">
              Ask customer to pay{" "}
              <span className="text-emerald-600 font-black">
                {settings.currency} {grandTotal.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full max-w-sm">
            <Button
              variant="secondary"
              onClick={() => {
                setShowQrImage(false);
                setPaymentMethod("CASH");
              }}
              className="flex-1 text-[10px] uppercase font-black h-12"
            >
              Back
            </Button>

            <Button
              onClick={handleProcessCheckout}
              disabled={isProcessing}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-black tracking-widest h-12"
            >
              {isProcessing ? "Processing..." : "Payment Received"}
              <CheckCircle2 size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        /* --- STANDARD BUTTONS VIEW --- */
        <>
          <div className="grid grid-cols-2 gap-6 items-center ">
            {[
              { id: "CASH", label: "Cash", icon: Banknote },
              { id: "QR", label: "Scan QR", icon: QrCode },
              { id: "CREDIT", label: "Store Credit", icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  if (method.id === "CREDIT" && !selectedCustomer) {
                    alert("Please select a customer for credit payment");
                    return;
                  }
                  setPaymentMethod(method.id as any);
                  if (method.id === "QR") {
                    setShowQrImage(true);
                  }
                }}
                disabled={method.id === "CREDIT" && !selectedCustomer}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all gap-4 ${
                  method.id === "CREDIT" && !selectedCustomer
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${
                  paymentMethod === method.id
                    ? "border-red-500 bg-red-50 text-red-600 shadow-xl shadow-red-500/10 active:scale-95"
                    : "border-zinc-100 hover:border-zinc-200 text-zinc-400 bg-white"
                }`}
              >
                <method.icon size={36} strokeWidth={1.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {method.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-4 pt-10">
            <Button
              variant="secondary"
              onClick={() => setStep("BILL")}
              className="flex-1 h-16 uppercase tracking-widest text-[10px] font-black border-zinc-200"
            >
              <ArrowLeft size={16} className="mr-2" />
              Review Bill
            </Button>

            {/* Main Proceed Button (Only for Cash/Card now) */}
            <Button
              onClick={handleProcessCheckout}
              disabled={isProcessing}
              className="flex-[2] h-16 bg-red-600 text-white hover:bg-red-700 uppercase tracking-[0.4em] font-black text-sm shadow-2xl shadow-red-500/20 active:scale-[0.98]"
            >
              {isProcessing ? "Processing..." : "Secure Finalize"}
              <CheckCircle2 size={20} className="ml-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-emerald-500/10">
        <CheckCircle2 size={56} />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">
          SUCCESSFUL!
        </h3>
        <p className="text-sm text-zinc-500 font-medium">
          The transaction has been recorded and table sessions closed.
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={handlePrint}
          variant="secondary"
          className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest border-zinc-200 h-12 px-8"
        >
          <Printer size={16} />
          Print Receipt
        </Button>
        <Button
          onClick={onClose}
          className="bg-zinc-900 text-white flex items-center gap-2 text-[10px] uppercase font-black tracking-widest h-12 px-8"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={step !== "SUCCESS" ? "Secure Checkout Process" : ""}
        size={step === "PREPARE" ? "xl" : "lg"}
      >
        <div className="p-4">
          <Modal
            isOpen={isSelectingFreeItems}
            onClose={() => setIsSelectingFreeItems(false)}
            title="Add Complimentary Items"
            size="lg"
          >
            <div className="flex flex-col gap-6 p-2 max-h-[70vh]">
              <div className="relative group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-500 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search dishes, addons, combos..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:border-red-500 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableItems
                    .filter((item) =>
                      item.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          addFreeItem(item);
                        }}
                        className="group bg-white border border-zinc-100 rounded-xl p-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-start gap-2 text-left active:scale-[0.98]"
                      >
                        <div className="w-full aspect-square bg-zinc-50 rounded-lg overflow-hidden border border-zinc-50 flex items-center justify-center relative">
                          {item.image?.[0] ? (
                            <img
                              src={item.image[0]}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <LayoutGrid size={24} className="text-zinc-200" />
                          )}
                          <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-black border border-zinc-100 uppercase tracking-widest text-zinc-500">
                            {item.type}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate w-full">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-black text-emerald-600">
                            {settings.currency} 0.00{" "}
                            <span className="text-[8px] text-zinc-300 line-through ml-1">
                              {settings.currency}{" "}
                              {(item.price?.listedPrice || 0).toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <div className="mt-auto pt-2 border-t border-zinc-50 w-full flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                            Add Free
                          </span>
                          <PlusCircle
                            size={14}
                            className="text-zinc-300 group-hover:text-emerald-500"
                          />
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <Button
                  onClick={() => setIsSelectingFreeItems(false)}
                  className="bg-zinc-900 text-white uppercase tracking-widest text-[10px] h-10 px-8"
                >
                  Done
                </Button>
              </div>
            </div>
          </Modal>

          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-bill,
              #printable-bill * {
                visibility: visible;
              }
              #printable-bill {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                border: none !important;
              }
            }
          `}</style>
          {step !== "SUCCESS" && (
            <div className="flex items-center gap-3 mb-12 px-10">
              <div className="flex-1 space-y-2">
                <div
                  className={`h-1.5 rounded-full ${step === "PREPARE" || step === "BILL" || step === "PAYMENT" ? "bg-red-500" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "PREPARE" ? "text-red-500" : "text-zinc-300"}`}
                >
                  1. Prepare Order
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <div
                  className={`h-1.5 rounded-full ${step === "BILL" || step === "PAYMENT" ? "bg-red-500" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "BILL" ? "text-red-500" : "text-zinc-300"}`}
                >
                  2. View & Print Bill
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <div
                  className={`h-1.5 rounded-full ${step === "PAYMENT" ? "bg-red-500" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "PAYMENT" ? "text-red-500" : "text-zinc-300"}`}
                >
                  3. Process Payment
                </p>
              </div>
            </div>
          )}

          {step === "PREPARE" && renderPrepare()}
          {step === "BILL" && renderBill()}
          {step === "PAYMENT" && renderPayment()}
          {step === "SUCCESS" && renderSuccess()}
        </div>
      </Modal>
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Phone
              </label>
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                DOB
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Loyalty ID
              </label>
              <input
                type="text"
                placeholder="Optional"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                value={formData.loyaltyId}
                onChange={(e) =>
                  setFormData({ ...formData, loyaltyId: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Opening Balance
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              value={formData.openingBalance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  openingBalance: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <Button
            onClick={handleCreateCustomer}
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            Create Customer
          </Button>
        </div>
      </Modal>
    </>
  );
}
