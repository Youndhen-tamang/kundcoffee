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
} from "lucide-react";

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
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Customer, 2: Bill/Print, 3: Payment
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

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

  const handleFinalize = async (method: "CASH" | "QR") => {
    try {
      setLoading(true);
      await processCheckout({
        tableId: table.id,
        sessionId: checkoutData.sessionId,
        paymentMethod: method === "QR" ? "QR" : "CASH",
        amount: checkoutData.summary.grandTotal,
        customerId: selectedCustomerId,
        subtotal: checkoutData.summary.subtotal,
        tax: checkoutData.summary.tax,
        serviceCharge: checkoutData.summary.serviceCharge,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData && loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Preparing Checkout">
        <div className="flex flex-col items-center justify-center p-12 gap-4">
          <Loader2 className="animate-spin text-red-500" size={40} />
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
      <div className="flex flex-col gap-6 p-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between px-4 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? "bg-red-600 text-white scale-110 shadow-lg"
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
                    className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:text-red-700 transition-colors ml-1"
                  >
                    <UserPlus size={14} /> Add New Customer
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-white p-4 rounded-xl border border-zinc-200">
                  <input
                    placeholder="Full Name"
                    className="w-full bg-zinc-50 border-none rounded-lg p-3 text-sm focus:ring-1 ring-red-500"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                  <input
                    placeholder="Phone Number"
                    className="w-full bg-zinc-50 border-none rounded-lg p-3 text-sm focus:ring-1 ring-red-500"
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
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-100 group transition-all"
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
            <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-6 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black tracking-tight text-zinc-900">
                  KUND COFFEE
                </h2>
                <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                  Table Summary Receipt
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {checkoutData.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-800">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-zinc-900">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-zinc-500 px-1">
                  <span>Subtotal</span>
                  <span>${checkoutData.summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 px-1">
                  <span>Service Charge (10%)</span>
                  <span>${checkoutData.summary.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 px-1">
                  <span>VAT (13%)</span>
                  <span>${checkoutData.summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-4 px-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-1">
                    Total Amount
                  </span>
                  <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                    ${checkoutData.summary.grandTotal.toFixed(2)}
                  </span>
                </div>
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
                <span className="font-bold text-red-600">
                  ${checkoutData.summary.grandTotal.toFixed(2)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFinalize("CASH")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-zinc-100 rounded-3xl hover:border-red-500 hover:bg-red-50 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                  <Wallet
                    size={32}
                    className="text-zinc-400 group-hover:text-red-600"
                  />
                </div>
                <span className="font-black text-zinc-900 text-xs uppercase tracking-widest">
                  Cash
                </span>
              </button>

              <button
                onClick={() => handleFinalize("QR")}
                disabled={loading}
                className="flex flex-col items-center justify-center p-8 bg-white border-2 border-zinc-100 rounded-3xl hover:border-red-500 hover:bg-red-50 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                  <QrCode
                    size={32}
                    className="text-zinc-400 group-hover:text-red-600"
                  />
                </div>
                <span className="font-black text-zinc-900 text-xs uppercase tracking-widest">
                  QR Payment
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
          }
        }
      `}</style>
    </Modal>
  );
}
