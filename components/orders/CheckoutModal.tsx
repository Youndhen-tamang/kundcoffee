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
  const [includeTax, setIncludeTax] = useState(
    settings.includeTaxByDefault === "true",
  );
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

  const [tenderAmount, setTenderAmount] = useState<number>(0);
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

  const returnAmount = useMemo(() => {
    return Math.max(0, tenderAmount - grandTotal);
  }, [tenderAmount, grandTotal]);

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

  const handleProcessCheckout = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: order.tableId,
          sessionId: order.sessionId,
          paymentMethod,
          amount: grandTotal,
          customerId: selectedCustomer?.id,
          subtotal: calculatedSubtotal,
          tax: taxAmount + customTaxesTotal,
          serviceCharge: serviceChargeAmount,
          discount: totalDiscount,
          complimentaryItems,
          extraFreeItems: extraFreeItems.map((i) => ({
            dishId: i.id,
            name: i.name,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("SUCCESS");
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
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Order Items
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 uppercase tracking-widest text-[10px] text-zinc-400 font-black">
            <tr>
              <th className="px-4 py-3 font-black">Item</th>
              <th className="px-4 py-3 font-black text-center">Qty</th>
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
                  className={`${compQty > 0 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-4 py-4">
                    <p className="font-bold text-zinc-900">
                      {item.dish?.name || item.combo?.name || "Dish"}
                    </p>
                    {compQty > 0 && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-1 mt-1">
                        <Gift size={10} /> {compQty} complimentary
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-zinc-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-zinc-600">
                    {settings.currency} {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-zinc-900">
                    <span
                      className={
                        compQty >= item.quantity
                          ? "line-through text-zinc-300 decoration-2"
                          : ""
                      }
                    >
                      {settings.currency}{" "}
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    {compQty > 0 && compQty < item.quantity && (
                      <span className="ml-2 text-zinc-900">
                        {settings.currency}{" "}
                        {((item.quantity - compQty) * item.unitPrice).toFixed(
                          2,
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDiscountValue(isNaN(val) ? 0 : val);
                  }}
                  className="w-full h-[38px] px-4 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-zinc-900 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {settings.includeTaxByDefault === "true" && (
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Add Tax (13%)
                  </span>
                  <button
                    onClick={() => setIncludeTax(!includeTax)}
                    className={`w-6 h-3 rounded-full transition-colors relative ${includeTax ? "bg-zinc-900" : "bg-zinc-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${includeTax ? "left-[13px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Service Chg (10%)
                </span>
                <button
                  onClick={() => setIncludeServiceCharge(!includeServiceCharge)}
                  className={`w-6 h-3 rounded-full transition-colors relative ${includeServiceCharge ? "bg-zinc-900" : "bg-zinc-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${includeServiceCharge ? "left-[13px]" : "left-0.5"}`}
                  />
                </button>
              </div>
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
                  <div className="w-8 h-8 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <p className="font-bold text-xs">
                    {selectedCustomer.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-zinc-300 hover:text-zinc-600 transition-colors"
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

        <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-4 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
              <span>Subtotal</span>
              <span className="text-white">
                {settings.currency} {calculatedSubtotal.toFixed(2)}
              </span>
            </div>
            {loyaltyDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
                <span>Loyalty ({loyaltyDiscountPercent}%)</span>
                <span>
                  - {settings.currency} {loyaltyDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}
            {manualDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-black">
                <span>Discount</span>
                <span>
                  - {settings.currency} {manualDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {settings.includeTaxByDefault === "true" && includeTax && (
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
          <div className="space-y-6 py-6 border-t border-zinc-800">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Tender Amount
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xl">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  value={tenderAmount || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTenderAmount(isNaN(val) ? 0 : val);
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") setTenderAmount(0);
                  }}
                  className="w-full pl-14 pr-4 py-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-2xl font-black text-white focus:ring-2 focus:ring-zinc-600 outline-none transition-all placeholder:text-zinc-600 shadow-inner flex gap-2"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2 px-1">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Return Amount
              </span>
              <span className="text-2xl font-black text-white">
                {settings.currency} {returnAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-800 space-y-6">
            <div className="flex justify-between items-baseline px-1">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Grand Total
              </span>
              <span className="text-5xl font-black tracking-tighter">
                {settings.currency} {grandTotal.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={() => setStep("BILL")}
              className="w-full h-16 bg-white text-zinc-900 uppercase tracking-[0.3em] font-black text-xs shadow-2xl shadow-white/5 border-none rounded-2xl active:scale-95 transition-all"
            >
              Prepare Billing & Receipt
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

        <div className="space-y-2 mb-6">
          {order.items.map((item) => {
            const compQty = complimentaryItems[item.id] || 0;
            return (
              <div
                key={item.id}
                className="flex justify-between items-start text-xs"
              >
                <div className="flex-1">
                  <p className="font-bold text-zinc-900 tracking-tight">
                    {item.dish?.name || item.combo?.name || "Dish"}
                    {compQty > 0 && (
                      <span className="ml-1 text-zinc-500 text-[9px] font-black italic">
                        ({compQty} Complimentary)
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">
                    {item.quantity} × Rs. {item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold text-zinc-900 ${compQty >= item.quantity ? "line-through text-zinc-300" : ""}`}
                  >
                    Rs. {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                  {compQty > 0 && compQty < item.quantity && (
                    <p className="font-bold text-zinc-600">
                      Rs.{" "}
                      {((item.quantity - compQty) * item.unitPrice).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-1 border-t border-zinc-200 pt-4 text-[10px]">
          <div className="flex justify-between font-black uppercase tracking-widest text-zinc-500">
            <span>Subtotal</span>
            <span>Rs. {calculatedSubtotal.toFixed(2)}</span>
          </div>

          {loyaltyDiscountAmount > 0 && (
            <div className="flex justify-between font-black uppercase tracking-widest text-zinc-600">
              <span>Loyalty ({loyaltyDiscountPercent}%)</span>
              <span>- Rs. {loyaltyDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          {manualDiscountAmount > 0 && (
            <div className="flex justify-between font-black uppercase tracking-widest text-zinc-600">
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

          <div className="flex justify-between font-black text-zinc-900 text-2xl pt-2 border-t border-zinc-900 mt-2">
            <span className="uppercase tracking-[0.2em] text-[10px] self-center">
              Grand Total
            </span>
            <span>Rs. {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-6 space-y-1">
          <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.4em]">
            Thank You!
          </p>
          <p className="text-[8px] text-zinc-300 font-bold italic tracking-widest">
            Powered by Kund ERP
          </p>
        </div>
      </div>

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
        className="w-full max-w-md h-14 bg-zinc-900 text-white hover:bg-zinc-800 uppercase tracking-[0.3em] font-black text-xs shadow-xl mt-4 border-none"
      >
        Proceed to Payment
        <ChevronRight size={18} className="ml-2" />
      </Button>
    </div>
  );

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
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in">
          <div className="p-2 bg-white border-2 border-zinc-900 rounded-2xl shadow-xl">
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
              <span className="text-zinc-900 font-black">
                {settings.currency} {grandTotal.toFixed(2)}
              </span>
            </p>
          </div>

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
              className="flex-[2] bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] uppercase font-black tracking-widest h-12"
            >
              {isProcessing ? "Processing..." : "Payment Received"}
              <CheckCircle2 size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      ) : (
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
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900 shadow-xl shadow-zinc-500/10 active:scale-95"
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

            <Button
              onClick={handleProcessCheckout}
              disabled={isProcessing}
              className="flex-[2] h-16 bg-zinc-900 text-white hover:bg-zinc-800 uppercase tracking-[0.4em] font-black text-sm shadow-2xl shadow-zinc-500/20 active:scale-[0.98] border-none"
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
      <div className="w-24 h-24 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-zinc-500/10">
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
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Add New Customer"
            size="lg"
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateCustomer}
                className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200 border-none px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Create Customer
              </Button>
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
                  className={`h-1.5 rounded-full ${step === "PREPARE" || step === "BILL" || step === "PAYMENT" ? "bg-zinc-900" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "PREPARE" ? "text-zinc-900" : "text-zinc-300"}`}
                >
                  1. Prepare Order
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <div
                  className={`h-1.5 rounded-full ${step === "BILL" || step === "PAYMENT" ? "bg-zinc-900" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "BILL" ? "text-zinc-900" : "text-zinc-300"}`}
                >
                  2. View & Print Bill
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <div
                  className={`h-1.5 rounded-full ${step === "PAYMENT" ? "bg-zinc-900" : "bg-zinc-100"}`}
                />
                <p
                  className={`text-[8px] font-black uppercase tracking-widest ${step === "PAYMENT" ? "text-zinc-900" : "text-zinc-300"}`}
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
    </>
  );
}
