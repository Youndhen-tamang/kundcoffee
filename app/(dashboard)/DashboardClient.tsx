"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Modal } from "@/components/ui/Modal";
import OverviewCard from "@/components/OverViewCard";
import { spaceType, Table, TableType } from "@/lib/types";
import { addSpace } from "@/fetch/space";
import { addTable, addTableType } from "@/fetch/table";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  initialSpaces: spaceType[];
  initialTables: Table[];
  initialTableTypes: TableType[];
}

export default function DashboardClient({
  initialSpaces,
  initialTables,
  initialTableTypes,
}: DashboardClientProps) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<spaceType[]>(initialSpaces);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [tableTypes, setTableTypes] = useState<TableType[]>(initialTableTypes);

  // Popover States
  const [isSpacePopoverOpen, setIsSpacePopoverOpen] = useState(false);
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);
  const [isQRPopoverOpen, setIsQRPopoverOpen] = useState(false);

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

  // Popover Contents
  const SpacePopoverContent = (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900 border-b pb-2">
        Add New Space
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="e.g. Main Hall"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="Optional description"
            value={newSpaceDesc}
            onChange={(e) => setNewSpaceDesc(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleAddSpace} className="w-full">
          Create Space
        </Button>
      </div>
    </div>
  );

  const TablePopoverContent = (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900 border-b pb-2">
        Add New Table
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700">
            Table Name
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="e.g. T-01"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Capacity</label>
          <input
            type="number"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
            // Logic: Keep popover open might be tricky if modal is on top.
            // Let's rely on z-index. The modal should be on top.
            setIsTypeModalOpen(true);
          }}
          addNewLabel="Add New Type"
        />

        <Button size="sm" onClick={handleAddTable} className="w-full">
          Create Table
        </Button>
      </div>
    </div>
  );

  const QRPopoverContent = (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900 border-b pb-2">
        QR Management
      </h3>
      <div className="text-sm text-gray-500">
        <p>Manage QR codes for tables here.</p>
        <p className="mt-2 text-xs">
          Select a table to generate specialized QR.
        </p>
      </div>
      {/* Placeholder for QR logic */}
      <Button size="sm" variant="secondary" className="w-full">
        Generate All QRs
      </Button>
    </div>
  );

  return (
    <div>
      {/* Top Action Bar */}
      <div className="mb-8 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-zinc-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your restaurant floor</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover
            trigger={<Button variant="secondary">Add Space</Button>}
            content={SpacePopoverContent}
            isOpen={isSpacePopoverOpen}
            setIsOpen={setIsSpacePopoverOpen}
            align="right"
          />
          <Popover
            trigger={<Button variant="secondary">Add Table</Button>}
            content={TablePopoverContent}
            isOpen={isTablePopoverOpen}
            setIsOpen={setIsTablePopoverOpen}
            align="right"
          />
          <Popover
            trigger={<Button variant="secondary">QR Codes</Button>}
            content={QRPopoverContent}
            isOpen={isQRPopoverOpen}
            setIsOpen={setIsQRPopoverOpen}
            align="right"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <OverviewCard title="Total Spaces" value={spaces.length} />
        <OverviewCard title="Total Tables" value={tables.length} />
        <OverviewCard
          title="Active Tables"
          value={tables.filter((t) => t.status === "ACTIVE").length}
        />
        <OverviewCard
          title="Occupied Tables"
          value={tables.filter((t) => t.status === "OCCUPIED").length}
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
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Type Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="e.g. Premium Details"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsTypeModalOpen(false);
                setIsTablePopoverOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTableType}>Save Type</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
