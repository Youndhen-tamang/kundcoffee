"use client";
import { useEffect, useState } from "react";
import { ApiResponse, Table, TableType, spaceType } from "@/lib/types";
import {
  getTables,
  getTableTypes,
  addTable,
  addTableType,
  updateTable,
  deleteTable, // Assuming you have a deleteTable service function
} from "@/services/table";
import { getSpaces, addSpace } from "@/services/space";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Modal } from "@/components/ui/Modal";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react"; // <-- Imported Lucide React icons
import { toast } from "sonner";

export default function TablesPage() {
  const router = useRouter();

  // --- Data States ---
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [spaces, setSpaces] = useState<spaceType[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- UI & Logic States ---
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form Input States (Renamed for consistency: name, capacity, etc.) ---
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | undefined>(
    undefined,
  );
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(
    undefined,
  );

  // --- Nested Form States (New Space/Type) ---
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDesc, setNewSpaceDesc] = useState("");
  const [newTypeName, setNewTypeName] = useState("");

  // Initial Fetch
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

  // Search Filter
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

  // --- Handlers ---

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  // Open Panel for CREATING (Button Click)
  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setTableName("");
    setTableCapacity("");
    setSelectedSpaceId(undefined);
    setSelectedTypeId(undefined);
    setIsPanelOpen(true); // Use isPanelOpen for the main form
  };

  // Open Panel for EDITING (Row Click)
  const openEdit = (table: Table) => {
    setIsEditing(true);
    setEditingId(table.id);
    setTableName(table.name);
    setTableCapacity(table.capacity.toString());
    setSelectedSpaceId(table.spaceId || table.space?.id);
    setSelectedTypeId(table.tableTypeId || table.tableType?.id);
    setIsPanelOpen(true); // Use isPanelOpen for the main form
  };


  const handleSubmit = async () => {
  
    if (!tableName || !tableCapacity || !selectedSpaceId || !selectedTypeId) {
      toast.error("All fields are required");
      return;
    }
  
    setIsLoading(true);
  
    try {
      let res: ApiResponse<Table>;
  
      if (isEditing && editingId) {
        // --- UPDATE LOGIC ---
        res = await updateTable({
          id: editingId,
          name: tableName,
          capacity: parseInt(tableCapacity),
          spaceId: selectedSpaceId,
          tableTypeId: selectedTypeId,
        });
      } else {
        // --- CREATE LOGIC ---
        res = await addTable(
          tableName,
          parseInt(tableCapacity),
          selectedSpaceId,
          selectedTypeId
        );
      }
  
      if (!res.success || !res.data) {
        toast.error(res.message ?? "Failed to save table");
        return;
      }
  
      toast.success(res.message ?? (isEditing ? "Table updated" : "Table created"));
  
      const updatedTables = await getTables();
      setTables(updatedTables);
  
      // Close & Reset
      closePanel();
      router.refresh();
  
    } catch (error) {
      console.error("Failed to save table", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete Handler
  // Delete Handler
  const handleDelete = async () => {
    if (
      !editingId ||
      !confirm(`Are you sure you want to delete table ${tableName}?`)
    )
      return;

    setIsLoading(true);
    try {
      console.log("thsi is id for tabel", editingId);
      await deleteTable(editingId);

      const updatedTables = await getTables();
      setTables(updatedTables);
      closePanel();
      router.refresh();
    } catch (error) {
      console.error("Failed to delete table", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName) {
      toast.error("Space name is required");
      return;
    }
  
    const res = await addSpace(newSpaceName, newSpaceDesc);
  
    if (!res.success || !res.data) {
      toast.error(res.message ?? "Failed to create space");
      return;
    }
  
    const space = res.data;
  
    // Add the new space to state
    setSpaces([...spaces, space]);
    setSelectedSpaceId(space.id);
    setIsSpaceModalOpen(false);
    setNewSpaceName("");
    setNewSpaceDesc("");
  
    toast.success(`Space "${space.name}" created successfully`);
  };
  

  const handleCreateType = async () => {
    if (!newTypeName) return;


    const res = await addTableType(newTypeName);
    if (!res.success || !res.data) {
      toast.error(res.message ?? "Failed to create space");
      return;
    }
    
    const tableType  =res.data
    if (res) {
      setTableTypes([...tableTypes, tableType]);
      setSelectedTypeId(tableType.id);
      setIsTypeModalOpen(false);
      setNewTypeName("");
    }
  };

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

  // Metrics
  const totalTables = tables.length;
  const activeTables = tables.filter((t) => t.status === "ACTIVE").length;
  const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;

  return (
    <div className="px-6 py-10">
      <PageHeaderAction
        title="Tables"
        description="Manage all your restaurant tables"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button
            onClick={openCreate}
            className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
          >
            <span className="flex items-center gap-2">Add Table</span>
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Tables" value={totalTables} />
        <MetricCard title="Active Tables" value={activeTables} />
        <MetricCard title="Occupied Tables" value={occupiedTables} />
        <MetricCard title="Table Types" value={tableTypes.length} />
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Name
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Type
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Space
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Cap.
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 font-bold text-zinc-600 uppercase text-xs tracking-widest text-right">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredTables.map((table) => (
              <tr
                key={table.id}
                className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                onClick={() => openEdit(table)} // Row click opens Edit Panel
              >
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {table.name}
                </td>
                <td className="px-6 py-4 font-bold text-zinc-600 uppercase text-[10px]">
                  {table.tableType?.name || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-600 font-medium">
                  {table.space?.name || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-900 font-bold">
                  {table.capacity}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                      table.status === "ACTIVE"
                        ? "bg-zinc-50 text-zinc-600 border-zinc-100"
                        : table.status === "OCCUPIED"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                  >
                    {table.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* EDIT BUTTON - Explicit click for clarity */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(table);
                    }}
                    className="p-2 text-gray-400 hover:text-zinc-900 transition-colors"
                  >
                    <Pencil size={20} /> {/* Lucide Icon */}
                  </button>
                </td>
              </tr>
            ))}
            {filteredTables.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                  No tables found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- SIDE PANEL: ADD / EDIT / DELETE TABLE FORM --- */}
      <SidePanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        title={isEditing ? `Edit Table: ${tableName}` : "Add New Table"}
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Table Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. T-01"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 4"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 transition-all"
              value={tableCapacity}
              onChange={(e) => setTableCapacity(e.target.value)}
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
        </div>

        {/* Footer Actions (Close, Delete, Save/Update) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-3">
          {/* Delete Button (Only visible in Edit mode) */}
          {isEditing && (
            <Button
              onClick={handleDelete}
              variant="secondary"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              disabled={isLoading}
            >
              <Trash2 size={20} /> {/* Lucide Icon */}
            </Button>
          )}

          {/* Cancel/Close Button */}
          <Button
            onClick={closePanel}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>

          {/* Save/Update Button */}
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white"
            disabled={
              !tableName ||
              !tableCapacity ||
              !selectedSpaceId ||
              !selectedTypeId ||
              isLoading
            }
          >
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Table"
              : "Create Table"}
          </Button>
        </div>
      </SidePanel>

      {/* --- NESTED MODALS (Space & Type) --- */}
      <Modal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        title="Create New Space"
      >
        <div className="flex flex-col gap-4 p-2">
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
            placeholder="Space Name"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
            placeholder="Description"
            value={newSpaceDesc}
            onChange={(e) => setNewSpaceDesc(e.target.value)}
          />
          <Button
            onClick={handleCreateSpace}
            className="w-full bg-zinc-900 text-white uppercase font-bold text-[10px] tracking-widest"
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
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none"
            placeholder="Type Name"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <Button
            onClick={handleCreateType}
            className="w-full bg-zinc-900 text-white uppercase font-bold text-[10px] tracking-widest"
          >
            Save Type
          </Button>
        </div>
      </Modal>
    </div>
  );
}
