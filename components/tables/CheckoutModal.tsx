"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Customer, Table } from "@/lib/types";
import { getCustomers, addCustomer } from "@/services/customer";
import { processCheckout, getCheckoutDetails } from "@/services/checkout";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  Printer,
  CheckCircle2,
  Wallet,
  QrCode,
  UserPlus,
  ArrowRight,
  Loader2,
  CreditCard,
  Gift,
  PlusCircle,
  X,
  Search,
  LayoutGrid,
} from "lucide-react";
import {
  getCategories,
  getDishes,
  getAddOns,
  getCombos,
} from "@/services/menu";
import { useSettings } from "@/components/providers/SettingsProvider";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onSuccess: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  table,
  onSuccess,
}: CheckoutModalProps) {
  const { settings } = useSettings();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Customer, 2: Bill/Print, 3: Payment
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [complimentaryItems, setComplimentaryItems] = useState<
    Record<string, number>
  >({});
  const [customTaxes, setCustomTaxes] = useState<
    { name: string; percentage: number }[]
  >([]);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxPercent, setNewTaxPercent] = useState("");
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [isSelectingFreeItems, setIsSelectingFreeItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [extraFreeItems, setExtraFreeItems] = useState<any[]>([]);

  // New Customer Form
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCheckoutDetails();
      fetchCustomers();
    }
  }, [isOpen, table.id]);

  const fetchCheckoutDetails = async () => {
    try {
      setLoading(true);
      const data = await getCheckoutDetails(table.id);
      setCheckoutData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
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
    if (!newCustomerName) return;
    try {
      const res = await addCustomer({
        fullName: newCustomerName,
        phone: newCustomerPhone,
      });
      if (res.success) {
        setCustomers([...customers, res.data]);
        setSelectedCustomerId(res.data.id);
        setIsAddingCustomer(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    // Basic print functionality
    window.print();
    // After printing, move to payment step
    setStep(3);
  };

  const handleFinalize = async (method: "CASH" | "QR" | "CREDIT") => {
    try {
      setLoading(true);
      const summary = calculateSummary();
      await processCheckout({
        tableId: table.id,
        sessionId: checkoutData.sessionId,
        paymentMethod: method,
        amount: summary.grandTotal,
        customerId: selectedCustomerId,
        subtotal: summary.subtotal,
        tax: summary.tax,
        serviceCharge: summary.serviceCharge,
        discount: summary.totalDiscount,
        complimentaryItems,
        extraFreeItems,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    if (!checkoutData)
      return {
        subtotal: 0,
        tax: 0,
        serviceCharge: 0,
        grandTotal: 0,
        totalDiscount: 0,
      };

    const rawSubtotal = checkoutData.items.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0,
    );

    const complimentaryValue = checkoutData.items.reduce(
      (sum: number, item: any) => {
        const compQty = complimentaryItems[item.id] || 0;
        return sum + compQty * item.unitPrice;
      },
      0,
    );

    const extraFreeValue = extraFreeItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const netSubtotal = Math.max(
      0,
      rawSubtotal - complimentaryValue - (checkoutData.summary.discount || 0),
    );
    const serviceCharge = netSubtotal * 0.1; // Assuming fixed 10% for now

    const standardTax = netSubtotal * 0.13; // Assuming fixed 13% for now
    const customTaxesTotal = customTaxes.reduce(
      (sum, tax) => sum + netSubtotal * (tax.percentage / 100),
      0,
    );
    const totalTax = standardTax + customTaxesTotal;

    const grandTotal = netSubtotal + serviceCharge + totalTax;

    return {
      subtotal: netSubtotal,
      tax: totalTax,
      serviceCharge,
      grandTotal,
      totalDiscount: complimentaryValue + (checkoutData.summary.discount || 0),
      complimentaryValue,
    };
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

  if (!checkoutData && loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Preparing Checkout">
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
          <p className="text-sm text-zinc-500 font-medium animate-pulse">
            Calculating totals...
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Checkout - Table ${table.name}`}
    >
      <div className="flex flex-col gap-6 p-2">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between px-4 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-emerald-600 text-white scale-110 shadow-lg"
                    : step > s
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${step > s ? "bg-emerald-500" : "bg-zinc-100"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Customer Information (Optional)
              </h3>
              {!isAddingCustomer ? (
                <div className="space-y-4">
                  <CustomDropdown
                    label="Select Customer"
                    options={customers.map((c) => ({
                      id: c.id,
                      name: `${c.fullName} (${c.phone || "No Phone"})`,
                    }))}
                    value={selectedCustomerId}
                    onChange={setSelectedCustomerId}
                    placeholder="Search customer..."
                  />
                  <button
                    onClick={() => setIsAddingCustomer(true)}
                    className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors ml-1"
                  >
                    <UserPlus size={14} /> Add New Customer
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-white p-4 rounded-xl border border-zinc-200">
                  <input
                    placeholder="Full Name"
                    className="w-full bg-zinc-50 border-none rounded-lg p-3 text-sm focus:ring-1 ring-emerald-500"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                  <input
                    placeholder="Phone Number"
                    className="w-full bg-zinc-50 border-none rounded-lg p-3 text-sm focus:ring-1 ring-emerald-500"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateCustomer}
                      className="flex-1 bg-zinc-900 text-white text-[10px] uppercase tracking-widest h-10"
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsAddingCustomer(false)}
                      className="flex-1 text-[10px] uppercase tracking-widest h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl shadow-emerald-100 group transition-all"
            >
              <span className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[11px]">
                Proceed to Bill{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </Button>
          </div>
        )}

        {/* Step 2: Bill Summary & Print */}
        {step === 2 && checkoutData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-6 shadow-sm printable-area">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-zinc-900">
                  KUND COFFEE
                </h2>
                <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  Table Summary Receipt
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center mb-2 no-print">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Order Items
                  </h3>
                  <Button
                    onClick={() => setIsSelectingFreeItems(true)}
                    variant="secondary"
                    className="h-8 px-3 text-[10px] font-black uppercase tracking-widest border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                  >
                    <PlusCircle size={14} className="mr-1.5" /> Select Free
                    Items
                  </Button>
                </div>

                <div className="grid grid-cols-[1fr,60px,80px,80px] gap-4 mb-2 px-1 opacity-40 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-100 pb-2">
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-center">Comp Qty</span>
                  <span className="text-right">Total</span>
                </div>

                {checkoutData.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr,60px,80px,80px] gap-4 items-center text-sm group/item py-1"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                        {settings.currency} {item.unitPrice.toFixed(2)} ea
                      </p>
                    </div>

                    <div className="text-center font-bold text-zinc-600">
                      {item.quantity}
                    </div>

                    <div className="flex justify-center no-print">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={complimentaryItems[item.id] || 0}
                        onChange={(e) =>
                          setCompQty(
                            item.id,
                            parseInt(e.target.value) || 0,
                            item.quantity,
                          )
                        }
                        className="w-14 h-8 bg-emerald-50 border border-emerald-100 rounded-lg text-center text-xs font-black text-emerald-700 outline-none focus:ring-2 ring-emerald-500/20"
                      />
                    </div>
                    <div className="print-only hidden text-center font-bold text-emerald-600">
                      {complimentaryItems[item.id] || 0}
                    </div>

                    <div className="text-right font-black text-zinc-900">
                      {settings.currency}
                      {(
                        item.totalPrice -
                        (complimentaryItems[item.id] || 0) * item.unitPrice
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}

                {extraFreeItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr,60px,80px,80px] gap-4 items-center text-sm group/item py-1 bg-emerald-50/30 rounded-lg border border-emerald-100/50 -mx-1 px-1"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Gift size={10} className="text-emerald-500" />
                        <p className="font-black text-emerald-700 truncate">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">
                        New Free Item
                      </p>
                    </div>

                    <div className="text-center font-bold text-emerald-600">
                      {item.quantity}
                    </div>

                    <div className="text-center text-[10px] font-black text-emerald-600 uppercase">
                      Free
                    </div>

                    <div className="text-right flex items-center justify-end gap-2">
                      <span className="font-black text-emerald-600">
                        {settings.currency}0.00
                      </span>
                      <button
                        onClick={() => removeFreeItem(item.id)}
                        className="no-print p-1 text-zinc-300 hover:text-emerald-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2">
                {(() => {
                  const summary = calculateSummary();
                  return (
                    <>
                      <div className="flex justify-between text-xs text-zinc-500 px-1">
                        <span>Subtotal</span>
                        <span>
                          {settings.currency} {summary.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500 px-1">
                        <span>Service Charge (10%)</span>
                        <span>
                          {settings.currency} {summary.serviceCharge.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500 px-1">
                        <span>VAT (13%)</span>
                        <span>
                          {settings.currency}{" "}
                          {(summary.subtotal * 0.13).toFixed(2)}
                        </span>
                      </div>
                      {customTaxes.map((tax, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs text-zinc-500 px-1"
                        >
                          <span>
                            {tax.name} ({tax.percentage}%)
                          </span>
                          <span>
                            {settings.currency}{" "}
                            {(
                              summary.subtotal *
                              (tax.percentage / 100)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {summary.complimentaryValue > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 px-1 font-medium">
                          <span>Complimentary Discount</span>
                          <span>
                            -{settings.currency}{" "}
                            {summary.complimentaryValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-4 px-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-1">
                          Total Amount
                        </span>
                        <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                          {settings.currency} {summary.grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Tax Management Trigger */}
              <div className="mt-4 no-print">
                {!isAddingTax ? (
                  <button
                    onClick={() => setIsAddingTax(true)}
                    className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 hover:text-emerald-700"
                  >
                    + Add Custom Tax
                  </button>
                ) : (
                  <div className="flex gap-2 items-center bg-zinc-50 p-2 rounded-lg animate-in slide-in-from-top-2">
                    <input
                      placeholder="Tax Name"
                      className="text-[10px] p-2 rounded border bg-white flex-1"
                      value={newTaxName}
                      onChange={(e) => setNewTaxName(e.target.value)}
                    />
                    <input
                      placeholder="%"
                      type="number"
                      className="text-[10px] p-2 rounded border bg-white w-14"
                      value={newTaxPercent}
                      onChange={(e) => setNewTaxPercent(e.target.value)}
                    />
                    <button
                      onClick={handleAddTax}
                      className="bg-zinc-900 text-white p-2 rounded shadow-sm hover:bg-zinc-800"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => setIsAddingTax(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handlePrint}
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl shadow-xl shadow-zinc-200 group transition-all"
            >
              <span className="flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[11px]">
                <Printer size={18} /> Print & Proceed
              </span>
            </Button>
          </div>
        )}

        {/* Step 3: Payment Selection */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-2">
              <h3 className="text-lg font-bold text-zinc-900">
                Select Payment Method
              </h3>
              <p className="text-xs text-zinc-500">
                Amount to be paid:{" "}
                <span className="font-bold text-emerald-600">
                  {settings.currency} {calculateSummary().grandTotal.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFinalize("CASH")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-zinc-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <QrCode
                    size={32}
                    className="text-zinc-400 group-hover:text-emerald-600"
                  />
                </div>
                <span className="font-black text-zinc-900 text-xs uppercase tracking-widest">
                  Cash
                </span>
              </button>

              <button
                onClick={() => handleFinalize("QR")}
                disabled={loading}
                className={`flex flex-col items-center justify-center p-8 bg-white border-2 border-zinc-100 rounded-3xl transition-all group shadow-sm active:scale-95 ${!selectedCustomerId ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500 hover:bg-emerald-50"}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <CreditCard
                    size={32}
                    className="text-zinc-400 group-hover:text-emerald-600"
                  />
                </div>
                <span className="font-black text-zinc-900 text-xs uppercase tracking-widest">
                  QR Payment
                </span>
              </button>

              <button
                onClick={() => handleFinalize("CREDIT")}
                disabled={loading || !selectedCustomerId}
                className={`flex flex-col items-center justify-center p-8 bg-white border-2 border-zinc-100 rounded-3xl transition-all group shadow-sm active:scale-95 ${!selectedCustomerId ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500 hover:bg-emerald-50"}`}
                title={
                  !selectedCustomerId
                    ? "Please select a customer for credit payment"
                    : ""
                }
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <CreditCard
                    size={32}
                    className="text-zinc-400 group-hover:text-emerald-600"
                  />
                </div>
                <span className="font-black text-zinc-900 text-xs uppercase tracking-widest">
                  Credit
                </span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 text-center italic mt-4">
              For QR payment, please show yours to the customer. We'll mark it
              as paid manually here.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isSelectingFreeItems}
        onClose={() => setIsSelectingFreeItems(false)}
        title="Add Complimentary Items"
        size="lg"
      >
        <div className="flex flex-col gap-6 p-2 max-h-[70vh]">
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search dishes, addons, combos..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableItems
                .filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      addFreeItem(item);
                      // Visual feedback could be added here
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
          .printable-area,
          .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Modal>
  );
}
