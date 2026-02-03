"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Modal } from "@/components/ui/Modal";
import { MetricCard } from "@/components/ui/MetricCard";
import { spaceType, Table, TableType } from "@/lib/types";
import { addSpace } from "@/services/space";
import { addTable, addTableType } from "@/services/table";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  initialSpaces: spaceType[];
  initialTables: Table[];
  initialTableTypes: TableType[];
  initialCustomers: any[];
}

export default function DashboardClient({
  initialSpaces,
  initialTables,
  initialTableTypes,
  initialCustomers,
}: DashboardClientProps) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<spaceType[]>(initialSpaces);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [tableTypes, setTableTypes] = useState<TableType[]>(initialTableTypes);
  const [customers, setCustomers] = useState<any[]>(initialCustomers);

  // Popover States
  const [isSpacePopoverOpen, setIsSpacePopoverOpen] = useState(false);
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);
  const [isQRPopoverOpen, setIsQRPopoverOpen] = useState(false);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

  // Modal States
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Form States
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");

  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(
    undefined,
  );

  const [newTypeName, setNewTypeName] = useState("");

  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phone: "",
    email: "",
    openingBalance: 0,
  });

  // Handlers
  const handleAddSpace = async () => {
    if (!newSpaceName) return;
    const newSpace = await addSpace(newSpaceName, newSpaceDesc);
    if (newSpace) {
      setSpaces([...spaces, newSpace]);
      setNewSpaceName("");
      setNewSpaceDesc("");
      setIsSpacePopoverOpen(false);
      router.refresh();
    }
  };

  const handleAddTableType = async () => {
    if (!newTypeName) return;
    const newType = await addTableType(newTypeName);
    if (newType) {
      setTableTypes([...tableTypes, newType]);
      setSelectedTypeId(newType.id);
      setNewTypeName("");
      setIsTypeModalOpen(false);
    }
  };

  const handleAddTable = async () => {
    if (
      !newTableName ||
      !newTableCapacity ||
      !selectedSpaceId ||
      !selectedTypeId
    )
      return;
    const newTable = await addTable(
      newTableName,
      parseInt(newTableCapacity),
      selectedSpaceId,
      selectedTypeId,
    );
    if (newTable) {
      setTables([...tables, newTable]);
      setNewTableName("");
      setNewTableCapacity("");
      setSelectedSpaceId(undefined);
      setSelectedTypeId(undefined);
      setIsTablePopoverOpen(false);
      router.refresh();
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.fullName) return;
    const res = await fetch("/api/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });
    const data = await res.json();
    if (data.success) {
      setCustomers([...customers, data.data]);
      setNewCustomer({
        fullName: "",
        phone: "",
        email: "",
        openingBalance: 0,
      });
      setIsCustomerPopoverOpen(false);
      router.refresh();
    }
  };

  // Popover Contents
  const SpacePopoverContent = (
    <div className="flex flex-col gap-4 p-2">
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase text-xs tracking-wider">
        Add New Space
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="e.g. Main Hall"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Description
          </label>
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="Optional description"
            value={newSpaceDesc}
            onChange={(e) => setNewSpaceDesc(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          onClick={handleAddSpace}
          className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none"
        >
          Create Space
        </Button>
      </div>
    </div>
  );

  const TablePopoverContent = (
    <div className="flex flex-col gap-4 p-2">
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase text-xs tracking-wider">
        Add New Table
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Table Name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="e.g. T-01"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Capacity
          </label>
          <input
            type="number"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="e.g. 4"
            value={newTableCapacity}
            onChange={(e) => setNewTableCapacity(e.target.value)}
          />
        </div>

        <CustomDropdown
          label="Space"
          options={spaces.map((s) => ({ id: s.id, name: s.name }))}
          value={selectedSpaceId}
          onChange={setSelectedSpaceId}
          placeholder="Select Space"
        />

        <CustomDropdown
          label="Table Type"
          options={tableTypes.map((t) => ({ id: t.id, name: t.name }))}
          value={selectedTypeId}
          onChange={setSelectedTypeId}
          placeholder="Select Type"
          onAddNew={() => {
            setIsTablePopoverOpen(false); // Close popover temporarily or keep open?
            setIsTypeModalOpen(true);
          }}
          addNewLabel="Add New Type"
        />

        <Button
          size="sm"
          onClick={handleAddTable}
          className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none"
        >
          Create Table
        </Button>
      </div>
    </div>
  );

  const QRPopoverContent = (
    <div className="flex flex-col gap-4 p-2">
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase text-xs tracking-wider">
        QR Management
      </h3>
      <div className="text-sm text-gray-500 space-y-2">
        <p>Manage QR codes for tables here.</p>
        <p className="text-[10px] font-medium text-red-600 italic">
          Select a table to generate specialized QR.
        </p>
      </div>
      {/* Placeholder for QR logic */}
      <Button size="sm" variant="secondary" className="w-full">
        Generate All QRs
      </Button>
    </div>
  );

  const CustomerPopoverContent = (
    <div className="flex flex-col gap-4 p-2">
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 uppercase text-xs tracking-wider">
        Quick Add Customer
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="e.g. John Doe"
            value={newCustomer.fullName}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, fullName: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Phone
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
            placeholder="Phone Number"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />
        </div>
        <Button
          size="sm"
          onClick={handleAddCustomer}
          className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 border-none"
        >
          Add Customer
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-medium italic">
            Monitor and manage your restaurant floor in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover
            trigger={
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                Add Customer
              </Button>
            }
            content={CustomerPopoverContent}
            isOpen={isCustomerPopoverOpen}
            setIsOpen={setIsCustomerPopoverOpen}
            align="right"
          />
          <Popover
            trigger={
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                Add Space
              </Button>
            }
            content={SpacePopoverContent}
            isOpen={isSpacePopoverOpen}
            setIsOpen={setIsSpacePopoverOpen}
            align="right"
          />
          <Popover
            trigger={
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                Add Table
              </Button>
            }
            content={TablePopoverContent}
            isOpen={isTablePopoverOpen}
            setIsOpen={setIsTablePopoverOpen}
            align="right"
          />
          <Popover
            trigger={
              <Button
                variant="secondary"
                className="bg-white hover:bg-gray-50 border-gray-200"
              >
                QR Codes
              </Button>
            }
            content={QRPopoverContent}
            isOpen={isQRPopoverOpen}
            setIsOpen={setIsQRPopoverOpen}
            align="right"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Customers" value={customers.length} />
        <MetricCard title="Total Spaces" value={spaces.length} />
        <MetricCard title="Total Tables" value={tables.length} />
        <MetricCard
          title="Active Tables"
          value={tables.filter((t) => t.status === "ACTIVE").length}
        />
      </div>

      {/* Add Table Type Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => {
          setIsTypeModalOpen(false);
          setIsTablePopoverOpen(true); // Re-open table popover so user can continue
        }}
        title="Create Table Type"
      >
        <div className="flex flex-col gap-6 py-2">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Type Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="e.g. VIP Lounge"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsTypeModalOpen(false);
                setIsTablePopoverOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTableType}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
            >
              Save Type
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
