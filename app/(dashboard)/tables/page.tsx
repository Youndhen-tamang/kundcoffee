"use client";
import { useEffect, useState } from "react";
import { Table, TableType, spaceType } from "@/lib/types";
import {
  getTables,
  getTableTypes,
  addTable,
  addTableType,
} from "@/services/table";
import { getSpaces, addSpace } from "@/services/space";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Modal } from "@/components/ui/Modal";
import { SidePanel } from "@/components/ui/SidePanel";
import { TableOrderCart } from "@/components/tables/TableOrderCart";
import { useRouter } from "next/navigation";

export default function TablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [spaces, setSpaces] = useState<spaceType[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Form States
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(
    undefined,
  );

  // Nested Form States
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [newTypeName, setNewTypeName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [tData, typeData, sData] = await Promise.all([
        getTables(),
        getTableTypes(),
        getSpaces(),
      ]);
      setTables(tData);
      setFilteredTables(tData);
      setTableTypes(typeData);
      setSpaces(sData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = tables.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.space?.name.toLowerCase().includes(lowerQuery) ||
        t.tableType?.name.toLowerCase().includes(lowerQuery),
    );
    setFilteredTables(filtered);
  }, [searchQuery, tables]);

  // Actions
  const handleExport = () => {
    const headers = ["Name", "Type", "Space", "Capacity", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTables.map((t) =>
        [
          t.name,
          t.tableType?.name || "",
          t.space?.name || "",
          t.capacity,
          t.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tables_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName) return;
    const res = await addSpace(newSpaceName, newSpaceDesc);
    if (res) {
      setSpaces([...spaces, res]);
      setSelectedSpaceId(res.id);
      setIsSpaceModalOpen(false);
      setNewSpaceName("");
      setNewSpaceDesc("");
      // No need to reopen AddModal, it should still be open underneath if we handle z-index right
      // But if we closed it, we need to ensuring it's "visible".
      // With the current Modal implementation using portals, they stack.
    }
  };

  const handleCreateType = async () => {
    if (!newTypeName) return;
    const res = await addTableType(newTypeName);
    if (res) {
      setTableTypes([...tableTypes, res]);
      setSelectedTypeId(res.id);
      setIsTypeModalOpen(false);
      setNewTypeName("");
    }
  };

  const handleCreateTable = async () => {
    if (
      !newTableName ||
      !newTableCapacity ||
      !selectedSpaceId ||
      !selectedTypeId
    )
      return;
    const res = await addTable(
      newTableName,
      parseInt(newTableCapacity),
      selectedSpaceId,
      selectedTypeId,
    );
    if (res) {
      const updatedTables = await getTables();
      setTables(updatedTables);
      setIsAddModalOpen(false);
      setNewTableName("");
      setNewTableCapacity("");
      setSelectedSpaceId(undefined);
      setSelectedTypeId(undefined);
      router.refresh();
    }
  };

  // Metrics Logic (Client-side)
  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.status === "ACTIVE").length;
  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
  const mostUsedTable = "N/A";

  return (
    <div>
      <PageHeaderAction
        title="Tables"
        description="Manage all your restaurant tables"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            <span className="flex items-center gap-2">Add Table</span>
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Tables" value={totalTables} />
        <MetricCard title="Active Tables" value={activeTables} />
        <MetricCard title="Occupied Tables" value={occupiedTables} />
        <MetricCard title="Most Used Table" value={mostUsedTable} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-700 uppercase text-[10px] tracking-widest">
                Name
              </th>
              <th className="px-6 py-4 font-semibold text-zinc-700 uppercase text-[10px] tracking-widest">
                Type
              </th>
              <th className="px-6 py-4 font-semibold text-zinc-700 uppercase text-[10px] tracking-widest">
                Space
              </th>
              <th className="px-6 py-4 font-semibold text-zinc-700 uppercase text-[10px] tracking-widest">
                Capacity
              </th>
              <th className="px-6 py-4 font-semibold text-zinc-700 uppercase text-[10px] tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredTables.map((table) => (
              <tr
                key={table.id}
                className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedTable(table)}
              >
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {table.name}
                </td>
                <td className="px-6 py-4 font-medium text-zinc-700 uppercase text-[10px]">
                  {table.tableType?.name || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {table.space?.name || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-700 font-medium">
                  {table.capacity}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-medium uppercase tracking-widest border ${
                      table.status === "ACTIVE"
                        ? "bg-zinc-50 text-zinc-500 border-zinc-100"
                        : table.status === "OCCUPIED"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                  >
                    {table.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTables.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                  No tables found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Main Add Table Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Table"
      >
        <div className="flex flex-col gap-5 p-2">
          <div>
            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-1.5 ml-1">
              Table Name
            </label>
            <input
              type="text"
              placeholder="e.g. T-01"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-300"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-1.5 ml-1">
              Capacity
            </label>
            <input
              type="number"
              placeholder="e.g. 4"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-300"
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(e.target.value)}
            />
          </div>
          <div>
            <CustomDropdown
              label="Space"
              options={spaces.map((s) => ({ id: s.id, name: s.name }))}
              value={selectedSpaceId}
              onChange={setSelectedSpaceId}
              placeholder="Select Space"
              onAddNew={() => setIsSpaceModalOpen(true)}
              addNewLabel="Add New Space"
            />
          </div>
          <div>
            <CustomDropdown
              label="Table Type"
              options={tableTypes.map((t) => ({ id: t.id, name: t.name }))}
              value={selectedTypeId}
              onChange={setSelectedTypeId}
              placeholder="Select Type"
              onAddNew={() => setIsTypeModalOpen(true)}
              addNewLabel="Add New Type"
            />
          </div>
          <Button
            onClick={handleCreateTable}
            className="w-full mt-4 h-12 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm border-none uppercase tracking-widest text-[10px] font-medium"
          >
            Create Table
          </Button>
        </div>
      </Modal>

      {/* Nested Modals */}
      <Modal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        title="Create New Space"
      >
        <div className="flex flex-col gap-4 p-2">
          <div>
            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-1.5 ml-1">
              Space Name
            </label>
            <input
              placeholder="e.g. Rooftop"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-300"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-1.5 ml-1">
              Description
            </label>
            <textarea
              placeholder="Space description..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none transition-all min-h-[100px] placeholder:text-zinc-300"
              value={newSpaceDesc}
              onChange={(e) => setNewSpaceDesc(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateSpace}
            className="w-full mt-2 h-12 bg-zinc-900 hover:bg-zinc-800 text-white border-none uppercase tracking-widest text-[10px] font-medium"
          >
            Save Space
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Create Table Type"
      >
        <div className="flex flex-col gap-4 p-2">
          <div>
            <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block mb-1.5 ml-1">
              Type Name
            </label>
            <input
              placeholder="e.g. VIP"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none transition-all placeholder:text-zinc-300"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateType}
            className="w-full mt-2 h-12 bg-zinc-900 hover:bg-zinc-800 text-white border-none uppercase tracking-widest text-[10px] font-medium"
          >
            Save Type
          </Button>
        </div>
      </Modal>

      {/* Table Order Side Panel */}
      <SidePanel
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        title={selectedTable ? `Table: ${selectedTable.name}` : "Order Details"}
      >
        {selectedTable && (
          <TableOrderCart
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
          />
        )}
      </SidePanel>
    </div>
  );
}
