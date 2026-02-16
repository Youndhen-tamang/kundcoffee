"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCustomerById } from "@/services/customer";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Customer, CustomerLedger } from "@/lib/types";

export default function CustomerProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<CustomerLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<CustomerLedger | null>(null);

  const [toReceive, setToReceive] = useState(0);
  const [toPay, setToPay] = useState(0);
  const [netToReceive, setNetToReceive] = useState(0);
  const customerId = Array.isArray(id) ? id[0] : id; 

  useEffect(() => {
    if (!customerId) return; // ensure customerId is defined
  
    const fetchCustomer = async () => {
      setLoading(true);
      console.log("Fetching customer with id:", customerId);
  
      try {
        const data = await getCustomerById(customerId);
        console.log("API response:", data);
  
        if (data?.success && data.data) {
          const customerData = data.data as Customer;
  
          const ledgerData: CustomerLedger[] = (data.data.CustomerLedger ?? []) as CustomerLedger[];
  
          setCustomer(customerData);
          setLedger(ledgerData);
  
          const receive = ledgerData.reduce((sum, l) => (l.amount > 0 ? sum + l.amount : sum), 0);
          const pay = ledgerData.reduce((sum, l) => (l.amount < 0 ? sum + Math.abs(l.amount) : sum), 0);
  
          setToReceive(receive);
          setToPay(pay);
          setNetToReceive(receive - pay);
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCustomer();
  }, [customerId]); // use the same variable you check at the top
  

  if (loading) return <p>Loading...</p>;
  if (!customer) return <p>Customer not found</p>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">

      {/* Customer Info Panel */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 p-4 bg-white rounded-xl shadow space-y-2">
          <h2 className="text-xl font-bold">{customer.fullName}</h2>
          <p>Email: {customer.email || "-"}</p>
          <p>Phone: {customer.phone || "-"}</p>
          <p>DOB: {customer.dob ? new Date(customer.dob).toLocaleDateString() : "-"}</p>
          <p>Loyalty ID: {customer.loyaltyId || "-"}</p>
          <p>Due Amount: {customer.dueAmount ?? 0}</p>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => router.push(`/customers/${id}/invoice`)}>Send Invoice</Button>
            <Button onClick={() => router.push(`/customers/${id}/statement`)} variant="secondary">Send Statement</Button>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="w-full md:w-2/3 grid grid-cols-3 gap-4">
          <MetricCard title="To Receive" value={toReceive} />
          <MetricCard title="To Pay" value={toPay} />
          <MetricCard title="Net to Receive" value={netToReceive} />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-bold mb-2">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2">SN</th>
                <th className="px-4 py-2">Txn No</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Closing Balance</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length ? ledger.map((txn, i) => (
                <tr key={txn.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTxn(txn)}>
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">{txn.txnNo}</td>
                  <td className="px-4 py-2">{txn.type}</td>
                  <td className="px-4 py-2">{txn.amount}</td>
                  <td className="px-4 py-2">{txn.closingBalance}</td>
                  <td className="px-4 py-2">{new Date(txn.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-400">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedTxn && (
        <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Details">
          <div className="flex flex-col gap-2">
            <p>Txn No: {selectedTxn.txnNo}</p>
            <p>Type: {selectedTxn.type}</p>
            <p>Amount: {selectedTxn.amount}</p>
            <p>Closing Balance: {selectedTxn.closingBalance}</p>
            <p>Date: {new Date(selectedTxn.createdAt).toLocaleString()}</p>
            <p>Reference: {selectedTxn.referenceId || "-"}</p>
            <p>Remarks: {selectedTxn.remarks || "-"}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
