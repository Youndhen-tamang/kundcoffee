"use client";
import { useEffect, useState } from "react";
import { SubMenu } from "@/lib/types";
import {
  getSubMenus,
  addSubMenu,
  updateSubMenu,
  deleteSubMenu,
} from "@/services/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Trash2, Edit2, Plus, Layers, AlertCircle } from "lucide-react";

export default function SubMenusPage() {
  const router = useRouter();
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Side Panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const data = await getSubMenus();
    setSubMenus(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = subMenus.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setImageFile(null);
    setIsActive(true);
    setIsPanelOpen(true);
  };

  const openEdit = (s: SubMenu) => {
    setIsEditing(true);
    setSelectedId(s.id);
    setName(s.name);
    setImageFile(s.image || null);
    setIsActive(s.isActive);
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;

    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;

    if (imageFile instanceof File) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "submenus");
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const { url } = await uploadRes.json();
        if (url) imageUrl = url;
      } catch (err) {
        console.error(err);
      }
      setUploading(false);
    }

    const payload = {
      name,
      image: imageUrl,
      isActive,
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateSubMenu({ ...payload, id: selectedId });
    } else {
      res = await addSubMenu(payload);
    }

    if (res?.success) {
      refresh();
      setIsPanelOpen(false);
      router.refresh();
    }
  };

  // Stats
  const activeCount = subMenus.filter((s) => s.isActive).length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sub Menus</h1>
          <p className="text-gray-500 font-medium">
            Organize dishes into sub-menus (e.g. Starters, Main Course)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          >
            <Plus size={18} className="mr-2" /> Create Sub Menu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Sub Menus" value={subMenus.length} />
        <MetricCard title="Active" value={activeCount} />
        <MetricCard
          title="Total Dishes Linked"
          value={subMenus.reduce(
            (acc, curr) => (acc + (curr.dishes?.length || 0)) as any,
            0,
          )}
          subValue="Across all sub-menus"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <input
            placeholder="Search sub-menus..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-full max-w-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Dishes Count
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr
                key={s.id}
                onClick={() => openEdit(s)}
                className="hover:bg-violet-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {s.image ? (
                      <img
                        src={s.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold bg-slate-100">
                        {s.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {s.name}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                    {/* @ts-ignore */}
                    {s._count?.dishes || 0} Dishes
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${s.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Layers size={24} className="opacity-20" />
                    <p>No sub-menus found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={isEditing ? "Edit Sub Menu" : "New Sub Menu"}
      >
        <div className="space-y-8 pb-24">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Details
            </h3>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Name *
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder="e.g. Starters"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
            </div>

            <ImageUpload
              label="Cover Image"
              value={typeof imageFile === "string" ? imageFile : undefined}
              onChange={setImageFile}
            />
          </section>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-3 z-10">
          <Button
            onClick={() => setIsPanelOpen(false)}
            variant="secondary"
            className="flex-1"
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
            disabled={!name || uploading}
          >
            {uploading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
