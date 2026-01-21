"use client";
import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { getCategories, addCategory, updateCategory } from "@/fetch/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/menu/MenuForms";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [description, setDescription] = useState("");

  const refresh = async () => {
    const data = await getCategories();
    setCategories(data);
    setFiltered(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(categories.filter((c) => c.name.toLowerCase().includes(lower)));
  }, [searchQuery, categories]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setImageFile(null);
    setDescription("");
    setIsPanelOpen(true);
  };

  const openEdit = (c: Category) => {
    setIsEditing(true);
    setSelectedId(c.id);
    setName(c.name);
    setImageFile(c.image || null);
    setDescription(c.description || "");
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;

    // Simulating file upload by using a fake URL if a File object is present
    let finalImage = imageFile;
    if (imageFile instanceof File) {
      // In a real app, upload to S3/Cloudinary here and get URL
      console.log("Uploading file:", imageFile.name);
      finalImage = `https://placehold.co/400?text=${encodeURIComponent(name)}`;
    }

    if (isEditing && selectedId) {
      const res = await updateCategory({
        id: selectedId,
        name,
        image: typeof finalImage === "string" ? finalImage : undefined,
        description,
      });
      if (res) await refresh();
    } else {
      const res = await addCategory({
        name,
        image: typeof finalImage === "string" ? finalImage : undefined,
        description,
      });
      if (res) await refresh();
    }

    setIsPanelOpen(false);
    router.refresh();
  };

  // Stats
  const totalCategories = categories.length;
  const totalDishes = categories.reduce(
    (sum, c) => sum + (c.dishes?.length || 0),
    0,
  );
  const avgDishes =
    totalCategories > 0 ? (totalDishes / totalCategories).toFixed(1) : "0";
  const mostDishesCategory = [...categories].sort(
    (a, b) => (b.dishes?.length || 0) - (a.dishes?.length || 0),
  )[0];

  return (
    <div>
      <PageHeaderAction
        title="Categories"
        description="Manage menu categories"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Add Category</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Categories" value={totalCategories} />
        <MetricCard title="Total Dishes (All)" value={totalDishes} />
        <MetricCard title="Avg Dishes/Cat" value={avgDishes} />
        <MetricCard
          title="Most Dishes In"
          value={mostDishesCategory?.name || "-"}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Description
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Dishes Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => openEdit(c)}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  {c.image && (
                    <img
                      src={c.image}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  {c.name}
                </td>
                <td className="px-6 py-4 truncate max-w-xs">
                  {c.description || "-"}
                </td>
                <td className="px-6 py-4">{c.dishes?.length || 0}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={isEditing ? "Edit Category" : "Add New Category"}
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Category Name *
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              placeholder="e.g. Main Course"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <ImageUpload
            label="Category Image"
            value={typeof imageFile === "string" ? imageFile : undefined}
            onChange={setImageFile}
          />

          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
          />

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
