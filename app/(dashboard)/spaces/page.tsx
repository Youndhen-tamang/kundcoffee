"use client";
import { getSpaces } from "@/fetch/space";
import { spaceType } from "@/lib/types";
import { useEffect, useState } from "react";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<spaceType[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchSpaces= async ()=>{
      const  fetchedSpace =  await  getSpaces();
      setSpaces(fetchedSpace);
    }
    fetchSpaces();
  }, []);

  async function createSpace() {
    await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    location.reload();
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Spaces</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          placeholder="Space name"
          className="border p-2 mr-2"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description"
          className="border p-2 mr-2"
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={createSpace} className="bg-black text-white px-4 py-2">
          Add Space
        </button>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Name</th>
            <th>Description</th>
            <th>Tables</th>
          </tr>
        </thead>
        <tbody>
          {spaces.filter(Boolean).map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-3">{s.name}</td>
              <td>{s.description}</td>
              <td>{s.tables.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
