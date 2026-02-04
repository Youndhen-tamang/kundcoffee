"use client";
import { useEffect, useState, use } from "react";
import { getCustomerById } from "@/services/customer";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useParams, useRouter } from "next/navigation";

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "transactions" | "invoices" | "activity"
  >("transactions");
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCustomerById(id);
      if (res.success) {
        setCustomer(res.data);
      }
    };
    fetchData();
  }, [id]);

  if (!customer)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const metrics = customer.metrics || {
    totalSales: 0,
    salesReturn: 0,
    paymentIn: 0,
    paymentOut: 0,
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)] py-10 pr-6">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {customer.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {customer.fullName}
            </h2>
            <p className="text-sm text-gray-500">
              Member since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-100/50">
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">
                Reward Points
              </p>
              <p className="text-xl font-bold text-red-700">
                {customer.loyaltyPoints} pts
              </p>
            </div>

            <div className="space-y-3">
              <DetailItem
                label="Loyalty ID"
                value={customer.loyaltyId || "N/A"}
              />
              <DetailItem label="Phone" value={customer.phone || "N/A"} />
              <DetailItem label="Email" value={customer.email || "N/A"} />
              <DetailItem
                label="DOB"
                value={
                  customer.dob
                    ? new Date(customer.dob).toLocaleDateString()
                    : "N/A"
                }
              />
              <DetailItem
                label="Loyalty Discount"
                value={`${customer.loyaltyDiscount}%`}
              />
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full justify-start text-sm py-2 px-4 border-gray-200"
              >
                <span className="flex items-center gap-2">Send Invoice</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start text-sm py-2 px-4 border-gray-200"
              >
                <span className="flex items-center gap-2">
                  Statement Details
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Address & Notes
          </h3>
          <div className="space-y-4">
            <DetailItem
              label="Address"
              value={customer.address || "No address provided"}
            />
            <DetailItem
              label="Tax Number"
              value={customer.taxNumber || "N/A"}
            />
            <DetailItem label="Notes" value={customer.notes || "No notes"} />
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total Sales"
            value={`Rs. ${metrics.totalSales.toLocaleString()}`}
          />
          <MetricCard
            title="Sales Return"
            value={`Rs. ${metrics.salesReturn.toLocaleString()}`}
          />
          <MetricCard
            title="Payment In"
            value={`Rs. ${metrics.paymentIn.toLocaleString()}`}
          />
          <MetricCard
            title="Payment Out"
            value={`Rs. ${metrics.paymentOut.toLocaleString()}`}
          />
        </div>

        {/* Tabs and History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100">
            <TabButton
              active={activeTab === "transactions"}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </TabButton>
            <TabButton
              active={activeTab === "invoices"}
              onClick={() => setActiveTab("invoices")}
            >
              Invoices
            </TabButton>
            <TabButton
              active={activeTab === "activity"}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </TabButton>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === "transactions" && (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      SN
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Txn No
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Particular
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Closing Balance
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.CustomerLedger.map((txn: any, index: number) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-red-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {txn.txnNo}
                      </td>
                      <td className="px-4 py-3">{txn.remarks || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTxnColor(txn.type)}`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        Rs. {txn.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        Rs. {txn.closingBalance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "invoices" && (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      SN
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Txn No
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Paid
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Unpaid
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.orders.map((order: any, index: number) => {
                    const isCredit =
                      order.payment?.status === "CREDIT" ||
                      order.payment?.method === "CREDIT";
                    const paid =
                      order.payment && !isCredit ? order.payment.amount : 0;
                    const unpaid = order.total - paid;
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-red-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTxn(order)}
                      >
                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3">{order.type}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          Rs. {paid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-600 font-medium">
                          Rs. {unpaid.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          Rs. {order.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "activity" && (
              <div className="p-4 space-y-6">
                <ActivityItem
                  title="Account Created"
                  date={new Date(customer.createdAt).toLocaleString()}
                  description={`Customer record for ${customer.fullName} was initialized.`}
                  isLast={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Side Panel */}
      <SidePanel
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        title="Transaction Details"
      >
        {selectedTxn && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Account Summary
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Balance After Txn
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    Rs. {selectedTxn.closingBalance?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Transaction Date
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(selectedTxn.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow
                label="Transaction Type"
                value={selectedTxn.type || "SALE"}
              />
              <DetailRow
                label="Transaction No"
                value={selectedTxn.txnNo || selectedTxn.id}
              />
              <DetailRow
                label="Amount"
                value={`Rs. ${selectedTxn.amount?.toLocaleString() || selectedTxn.total?.toLocaleString()}`}
                color="text-red-600 font-bold"
              />
              <DetailRow label="Remarks" value={selectedTxn.remarks || "N/A"} />
              <DetailRow
                label="Reference ID"
                value={selectedTxn.referenceId || "N/A"}
              />
            </div>

            {selectedTxn.items && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Order Items
                </h4>
                <div className="divide-y divide-gray-100 bg-gray-50 rounded-xl overflow-hidden">
                  {selectedTxn.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 flex justify-between text-sm"
                    >
                      <span>
                        {item.quantity}x {item.dishId || item.comboId}
                      </span>
                      <span className="font-medium text-gray-900">
                        Rs. {item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                Print Statement
              </Button>
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tight">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${color || "text-gray-900 font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-semibold transition-all ${
        active
          ? "text-red-600 border-b-2 border-red-600 bg-red-50/30"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function ActivityItem({
  title,
  date,
  description,
  isLast,
}: {
  title: string;
  date: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative pl-6">
      {!isLast && (
        <div className="absolute left-[3px] top-6 bottom-[-24px] w-[2px] bg-slate-100" />
      )}
      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-red-600 ring-4 ring-red-100" />
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <span className="text-[10px] font-medium text-gray-400">{date}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function getTxnColor(type: string) {
  switch (type) {
    case "SALE":
      return "bg-blue-50 text-blue-700";
    case "PAYMENT_IN":
      return "bg-green-50 text-green-700";
    case "PAYMENT_OUT":
      return "bg-amber-50 text-amber-700";
    case "RETURN":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}
