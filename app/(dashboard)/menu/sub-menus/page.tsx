"use client";
import { useEffect, useState } from "react";
import { SubMenu } from "@/lib/types";
import { getSubMenus, addSubMenu, updateSubMenu } from "@/fetch/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function SubMenusPage() {
  const router = useRouter();
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [filtered, setFiltered] = useState<SubMenu[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  const refresh = async () => {
    const data = await getSubMenus();
    setSubMenus(data);
    setFiltered(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(subMenus.filter((s) => s.name.toLowerCase().includes(lower)));
  }, [searchQuery, subMenus]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setImageFile(null);
    setIsPanelOpen(true);
  };

  const openEdit = (s: SubMenu) => {
    setIsEditing(true);
    setSelectedId(s.id);
    setName(s.name);
    setImageFile(s.image || null);
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;

    // Mock upload
    let finalImage = imageFile;
    if (imageFile instanceof File) {
      console.log("Uploading file:", imageFile.name);
      finalImage = `https://placehold.co/400?text=${encodeURIComponent(name)}`;
    }

    if (isEditing && selectedId) {
      const res = await updateSubMenu({
        id: selectedId,
        name,
        image: typeof finalImage === "string" ? finalImage : undefined,
      });
      if (res) await refresh();
    } else {
      const res = await addSubMenu({
        name,
        image: typeof finalImage === "string" ? finalImage : undefined,
      });
      if (res) await refresh();
    }

    setIsPanelOpen(false);
    router.refresh();
  };

  const total = subMenus.length;
  const mostActive = [...subMenus].sort(
    (a, b) => (b.dishes?.length || 0) - (a.dishes?.length || 0),
  )[0];
  const unusedCount = subMenus.filter(
    (s) => (s.dishes?.length || 0) === 0,
  ).length;
  const totalDishes = subMenus.reduce(
    (sum, s) => sum + (s.dishes?.length || 0),
    0,
  );
  const avgDishes = total > 0 ? (totalDishes / total).toFixed(1) : "0";

  return (
    <div>
      <PageHeaderAction
        title="Sub-Menus"
        description="Manage sub-menu groups"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Add Sub-Menu</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Sub-Menus" value={total} />
        <MetricCard title="Most Active" value={mostActive?.name || "-"} />
        <MetricCard title="Avg Dishes" value={avgDishes} />
        <MetricCard title="Unused" value={unusedCount} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Active Dishes
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((s) => (
              <tr
                key={s.id}
                onClick={() => openEdit(s)}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  {s.image && (
                    <img
                      src={s.image}
                      className="w-8 h-8 rounded bg-gray-100 object-cover"
                    />
                  )}
                  {s.name}
                </td>
                <td className="px-6 py-4">{s.dishes?.length || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs ${s.isActive ? "text-green-600" : "text-gray-400"}`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={isEditing ? "Edit Sub-Menu" : "Add Sub-Menu"}
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Sub-Menu Name
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <ImageUpload
            label="Sub-Menu Image"
            value={typeof imageFile === "string" ? imageFile : undefined}
            onChange={setImageFile}
          />

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
