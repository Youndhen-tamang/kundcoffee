"use client";
import { useEffect, useState } from "react";
import { Table, TableType, spaceType } from "@/lib/types";
import { getTables, getTableTypes } from "@/fetch/table";
import { getSpaces } from "@/fetch/space";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [spaces, setSpaces] = useState<spaceType[]>([]);

  const [name, setName] = useState<string>("");
  const [capacity, setCapacity] = useState<number>();
  
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState<string>("");

  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [newSpaceName, setNewSpaceName] = useState<string>("");
  const [spaceDescription,setSpaceDescription] = useState<string>("")
  useEffect(() => {
    const fetchData = async () => {
      const tablesData = await getTables();
      const typesData = await getTableTypes();
      const spacesData = await getSpaces();
      setTables(tablesData);
      
      setTableTypes(typesData);
      setSpaces(spacesData);
      console.log(spaces)
    };
    fetchData();
  }, []);

  const createTable = async () => {
    if (
      !name ||
      !capacity ||
      (!selectedTypeId && !newTypeName) ||
      (!selectedSpaceId && !newSpaceName)
    ) {
      alert("Please fill all fields");
      return;
    }

    const body = {
      name,
      capacity,
      tableTypeId: selectedTypeId || undefined,
      tableTypeName: newTypeName || undefined,
      spaceId: selectedSpaceId || undefined,
      spaceName: newSpaceName || undefined,
      spaceDescription
    };

    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) {
      alert("Table created!");
      setTables((prev) => [...prev, data.data]);
      setName("");
      setCapacity(undefined);
      setSelectedTypeId(null);
      setNewTypeName("");
      setSelectedSpaceId(null);
      setNewSpaceName("");
    } else {
      alert(data.message || data.error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Tables</h1>

      <div className="bg-white p-4 rounded shadow mb-6 flex flex-col gap-2">

        {/* Table Name */}
        <input
          placeholder="Table name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Capacity */}
        <input
          placeholder="Capacity"
          type="number"
          className="border p-2"
          value={capacity || ""}
          onChange={(e) => setCapacity(parseInt(e.target.value))}
        />

        {/* Table Type Selection / Create */}
        <div className="flex gap-2">
          <select
            className="border p-2 flex-1"
            value={selectedTypeId || ""}
            onChange={(e) => setSelectedTypeId(e.target.value)}
          >
            <option value="">-- Select existing table type --</option>
            {tableTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Or create new table type"
            className="border p-2 flex-1"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
        </div>

        {/* Space Selection / Create */}
        <div className="flex gap-2">
          <select
            className="border p-2 flex-1"
            value={selectedSpaceId || ""}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
          >
            <option value="">-- Select existing space --</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
         <div className=" flex gap-2 flex-3">
         <input
            placeholder="Or create new space"
            className="border p-2 flex-1"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
          />
                    <input
            placeholder="Description"
            className="border p-2 flex-2"
            value={spaceDescription}
            onChange={(e) => setSpaceDescription(e.target.value)}
          />
         </div>
        </div>

        <button
          onClick={createTable}
          className="bg-black text-white px-4 py-2 mt-2"
        >
          Add Table
        </button>
      </div>

      {/* Table List */}
      <table className="w-full bg-white rounded shadow text-black">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">Name</th>
            <th>Type</th>
            <th>Space</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tables.filter(Boolean).map((t: Table) => (
            <tr key={t.id} className="border-b">
              <td className="p-3">{t.name}</td>
              <td>{t.tableType?.name || "—"}</td>
              <td>{t.space?.name || "—"}</td>
              <td>{t.capacity}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
