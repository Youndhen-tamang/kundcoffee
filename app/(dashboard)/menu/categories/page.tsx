"use client";
import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "@/services/menu";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/menu/MenuForms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setFiltered(data);
    setLoading(false);
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

  const openEdit = (c: Category, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setSelectedId(c.id);
    setName(c.name);
    setImageFile(c.image || null);
    setDescription(c.description || "");
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;

    // Handle Image Upload
    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;

    if (imageFile instanceof File) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "categories");

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const { url } = await uploadRes.json();
        if (url) imageUrl = url;
      } catch (err) {
        console.error("Upload failed", err);
        // Optionally handle error
      }
      setUploading(false);
    }

    const payload = {
      name,
      image: imageUrl,
      description,
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateCategory({ id: selectedId, ...payload });
    } else {
      res = await addCategory(payload);
    }

    if (res?.success) {
      setIsPanelOpen(false);
      refresh();
      router.refresh();
    }
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
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 font-medium">
            Manage your menu categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            <Plus size={18} className="mr-2" /> Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters could go here if separate from header */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Categories" value={totalCategories} />
        <MetricCard title="Total Dishes" value={totalDishes} />
        <MetricCard title="Avg Dishes/Cat" value={avgDishes} />
        <MetricCard
          title="Top Category"
          value={mostDishesCategory?.name || "-"}
          subValue={
            mostDishesCategory
              ? `${mostDishesCategory.dishes?.length} dishes`
              : ""
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <input
            placeholder="Search categories..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-full max-w-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Category Name
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Description
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-center">
                Dishes
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => openEdit(c)}
                className="hover:bg-red-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold bg-slate-100">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{c.name}</span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                  {c.description ? (
                    <span title={c.description}>
                      {c.description.replace(/[#*_]/g, "")}
                    </span>
                  ) : (
                    <span className="text-gray-300 italic">No description</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {c.dishes?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEdit(c, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                      <Trash2 size={24} className="opacity-20" />
                    </div>
                    <p>No categories found.</p>
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
        title={isEditing ? "Edit Category" : "Add New Category"}
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
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
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-3">
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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!name || uploading}
          >
            {uploading
              ? "Saving..."
              : isEditing
                ? "Update Category"
                : "Create Category"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
