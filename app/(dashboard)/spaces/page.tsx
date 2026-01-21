"use client";
import { useEffect, useState } from "react";
import { spaceType } from "@/lib/types";
import { getSpaces, addSpace } from "@/services/space";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

export default function SpacesPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<spaceType[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<spaceType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const data = await getSpaces();
      setSpaces(data);
      setFilteredSpaces(data);
    };
    fetch();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredSpaces(
      spaces.filter((s) => s.name.toLowerCase().includes(lower)),
    );
  }, [searchQuery, spaces]);

  const handleCreate = async () => {
    if (!name) return;
    const res = await addSpace(name, description);
    if (res) {
      const updated = await getSpaces();
      setSpaces(updated);
      setName("");
      setDescription("");
      setIsModalOpen(false);
      router.refresh();
    }
  };

  const handleExport = () => {
    const headers = ["Name", "Description", "Table Count"];
    const csvContent = [
      headers.join(","),
      ...filteredSpaces.map((s) =>
        [s.name, s.description, s.tables?.length || 0].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "spaces_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeaderAction
        title="Spaces"
        description="Manage dining areas"
        onSearch={setSearchQuery}
        onExport={handleExport}
        actionButton={
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          >
            <span className="flex items-center gap-2">Add Space</span>
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Spaces" value={spaces.length} />
        <MetricCard
          title="With Tables"
          value={spaces.filter((s) => s.tables?.length > 0).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Description
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">Tables</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSpaces.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-violet-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {s.name}
                </td>
                <td className="px-6 py-4">{s.description || "-"}</td>
                <td className="px-6 py-4">{s.tables?.length || 0}</td>
              </tr>
            ))}
            {filteredSpaces.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No spaces found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Space"
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Space Name
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="e.g. Garden"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreate}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          >
            Create Space
          </Button>
        </div>
      </Modal>
    </div>
  );
}
