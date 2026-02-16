"use client";
import { useEffect, useState } from "react";
import { Category } from "@/lib/types";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "@/services/menu";
import { toast } from "sonner";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/menu/MenuForms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Trash2, Edit2, Plus } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "description" | "dishes">(
    "name",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);

  // --- Inline Editing State ---
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);

  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // --- Sorting Logic ---
  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    let f = categories.filter((c) => c.name.toLowerCase().includes(lower));

    f = [...f].sort((a, b) => {
      // 1. Primary Sort: sortOrder (Ascending)
      const aSort = (a as any).sortOrder ?? 0;
      const bSort = (b as any).sortOrder ?? 0;
      if (aSort !== bSort) return aSort - bSort;

      // 2. Secondary Sort: Selected Column
      const mult = sortDir === "asc" ? 1 : -1;
      let va: string | number = "";
      let vb: string | number = "";
      if (sortBy === "name") {
        va = a.name;
        vb = b.name;
      } else if (sortBy === "description") {
        va = a.description || "";
        vb = b.description || "";
      } else {
        va = a.dishes?.length || 0;
        vb = b.dishes?.length || 0;
      }

      if (typeof va === "string")
        return mult * String(va).localeCompare(String(vb));
      return mult * (Number(va) - Number(vb));
    });
    setFiltered(f);
  }, [searchQuery, categories, sortBy, sortDir]);

  // --- Inline Sort Handlers ---
  const handleSortOrderClick = (c: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRowId(c.id);
    setEditingValue((c as any).sortOrder ?? 0);
  };

  const handleSortOrderBlur = async (id: string) => {
    const current = categories.find((c) => c.id === id);
    if (current && (current as any).sortOrder === editingValue) {
      setEditingRowId(null);
      return;
    }

    try {
      const res = await updateCategory({ id, sortOrder: editingValue });
      if (res?.success) {
        toast.success("Order updated");
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, sortOrder: editingValue } : c,
          ),
        );
      }
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setEditingRowId(null);
    }
  };

  const handleSortOrderKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    if (e.key === "Escape") setEditingRowId(null);
  };

  // --- Form Handlers ---
  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setImageFile(null);
    setDescription("");
    setSortOrder(0);
    setIsPanelOpen(true);
  };

  const openEdit = (c: Category, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setSelectedId(c.id);
    setName(c.name);
    setImageFile(c.image || null);
    setDescription(c.description || "");
    setSortOrder((c as any).sortOrder ?? 0);
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;
    setUploading(true);

    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;
    if (imageFile instanceof File) {
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
        console.error(err);
      }
    }

    const payload = { name, image: imageUrl, description, sortOrder };

    let res;
    if (isEditing && selectedId) {
      res = await updateCategory({ id: selectedId, ...payload });
    } else {
      res = await addCategory(payload);
    }

    if (res?.success) {
      toast.success(isEditing ? "Category updated" : "Category created");
      setIsPanelOpen(false);
      refresh();
      router.refresh();
    } else {
      toast.error(res?.message || "Failed to save");
    }
    setUploading(false);
  };

  // --- Stats Calculations (FIXED) ---
  const totalCategories = categories.length;
  const totalDishes = categories.reduce(
    (sum, c) => sum + (c.dishes?.length || 0),
    0,
  );
  const avgDishes =
    totalCategories > 0 ? (totalDishes / totalCategories).toFixed(1) : "0";

  const mostDishesCategory =
    categories.length > 0
      ? [...categories].sort(
          (a, b) => (b.dishes?.length || 0) - (a.dishes?.length || 0),
        )[0]
      : null;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500 font-medium">
            Manage your menu categories
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
        >
          <Plus size={18} className="mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Categories" value={totalCategories} />
        <MetricCard title="Total Dishes" value={totalDishes} />
        <MetricCard title="Avg Dishes/Cat" value={avgDishes} />
        <MetricCard
          title="Top Category"
          value={mostDishesCategory?.name || "-"}
          subValue={
            mostDishesCategory
              ? `${mostDishesCategory.dishes?.length || 0} dishes`
              : ""
          }
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 flex-wrap">
          <input
            placeholder="Search categories..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="name">Category Name</option>
              <option value="description">Description</option>
              <option value="dishes">Dishes</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 w-24">
                  Row #
                </th>
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
                  <td
                    className="px-6 py-4"
                    onClick={(e) => handleSortOrderClick(c, e)}
                  >
                    {editingRowId === c.id ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) =>
                          setEditingValue(parseInt(e.target.value) || 0)
                        }
                        onBlur={() => handleSortOrderBlur(c.id)}
                        onKeyDown={(e) => handleSortOrderKeyDown(e, c.id)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none font-mono"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-400 font-mono hover:text-gray-900 cursor-text">
                        {(c as any).sortOrder ?? 0}
                      </span>
                    )}
                  </td>

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
                      c.description.replace(/[#*_]/g, "")
                    ) : (
                      <span className="text-gray-300 italic">
                        No description
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {c.dishes?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Trash2 size={24} className="mx-auto mb-2 opacity-20" />
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={isEditing ? "Edit Category" : "Add New Category"}
      >
        <div className="space-y-6 pb-20">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Category Name *
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 outline-none focus:bg-white transition-all"
              placeholder="e.g. Main Course"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Display Order (Row #)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 outline-none focus:bg-white transition-all"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
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

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center gap-3 z-10">
          {isEditing && selectedId && (
            <Button
              onClick={() => setIsDeleteModalOpen(true)}
              variant="secondary"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            >
              <Trash2 size={18} />
            </Button>
          )}
          <Button
            onClick={() => setIsPanelOpen(false)}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-red-600 text-white hover:bg-red-700 shadow-md"
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!selectedId) return;
          try {
            const res = await deleteCategory(selectedId);
            if (res?.success) {
              toast.success("Category deleted");
              refresh();
              setIsPanelOpen(false);
              setIsDeleteModalOpen(false);
              router.refresh();
            } else {
              toast.error(res?.message || "Failed to delete");
            }
          } catch (e) {
            toast.error("Failed to delete");
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete category "${name}"? You should remove associated dishes first.`}
        isLoading={uploading}
      />
    </div>
  );
}
