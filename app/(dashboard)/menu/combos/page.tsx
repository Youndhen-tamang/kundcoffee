"use client";
import { useEffect, useState } from "react";
import { ComboOffer, Category, Dish, Stock, Price, SubMenu } from "@/lib/types";
import {
  getCombos,
  addCombo,
  updateCombo,
  deleteCombo,
  getCategories,
  getDishes,
  getStocks,
  getSubMenus,
} from "@/services/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import {
  RichTextEditor,
  PriceForm,
  StockConsumptionForm,
} from "@/components/menu/MenuForms";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Trash2, Edit2, Plus, Gift, Utensils } from "lucide-react";

export default function CombosPage() {
  const router = useRouter();
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Side Panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [hscode, setHscode] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [prepTime, setPrepTime] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subMenuId, setSubMenuId] = useState("");
  const [kotType, setKotType] = useState<"KITCHEN" | "BAR">("KITCHEN");

  const [price, setPrice] = useState<Partial<Price>>({});
  const [stockConsumption, setStockConsumption] = useState<
    { stockId: string; quantity: number }[]
  >([]);

  // Combo Items State
  const [comboItems, setComboItems] = useState<
    { dishId: string; quantity: number; unitPrice: number }[]
  >([]);

  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [cData, catData, dData, sData, smData] = await Promise.all([
      getCombos(),
      getCategories(),
      getDishes(),
      getStocks(),
      getSubMenus(),
    ]);
    setCombos(cData);
    setCategories(catData);
    setDishes(dData);
    setStocks(sData);
    setSubMenus(smData);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = combos.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setHscode("");
    setImageFile(null);
    setPrepTime("");
    setDescription("");
    setCategoryId("");
    setSubMenuId("");
    setKotType("KITCHEN");
    setPrice({});
    setStockConsumption([]);
    setComboItems([]);
    setIsPanelOpen(true);
  };

  const openEdit = (c: ComboOffer) => {
    setIsEditing(true);
    setSelectedId(c.id);
    setName(c.name);
    setHscode(c.hscode || "");
    const firstImage = c.image && c.image.length > 0 ? c.image[0] : null;
    setImageFile(firstImage);
    setPrepTime(c.preparationTime?.toString() || "");
    setDescription(c.description || "");
    setCategoryId(c.categoryId);
    setSubMenuId(c.subMenuId || "");
    setKotType(c.kotType);
    setPrice(c.price || {});
    setStockConsumption(
      c.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
    // @ts-ignore
    setComboItems(
      c.items?.map((i) => ({
        dishId: i.dishId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) || [],
    );
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !categoryId) return;

    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;

    if (imageFile instanceof File) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "combos");
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
      hscode,
      image: imageUrl ? [imageUrl] : [],
      preparationTime: parseInt(prepTime) || 0,
      description,
      categoryId,
      subMenuId: subMenuId || undefined,
      kotType,
      items: comboItems,
      price: {
        actualPrice: price.actualPrice || 0,
        listedPrice: price.listedPrice || 0,
        cogs: price.cogs || 0,
        grossProfit: price.grossProfit || 0,
        discountPrice: price.discountPrice,
        id: price.id,
      },
      stockConsumption: stockConsumption.filter(
        (s) => s.stockId && s.quantity > 0,
      ),
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateCombo({ ...payload, id: selectedId });
    } else {
      res = await addCombo(payload);
    }

    if (res?.success) {
      refresh();
      setIsPanelOpen(false);
      router.refresh();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Combo Offers</h1>
          <p className="text-gray-500 font-medium">
            Create special combo packs and offers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          >
            <Plus size={18} className="mr-2" /> Add Combo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Combos" value={combos.length} />
        <MetricCard
          title="Active"
          value={combos.filter((c) => c.isAvailable).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <input
            placeholder="Search combos..."
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
                Category
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Original Price
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">
                Listed Price
              </th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
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
                className="hover:bg-violet-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {c.image && c.image[0] ? (
                      <img
                        src={c.image[0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold bg-slate-100">
                        <Gift size={16} />
                      </div>
                    )}
                  </div>
                  {c.name}
                </td>
                <td className="px-6 py-4">
                  {categories.find((cat) => cat.id === c.categoryId)?.name ||
                    "-"}
                </td>
                <td className="px-6 py-4 line-through text-gray-400">
                  ${c.price?.actualPrice || 0}
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  ${c.price?.listedPrice || 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${c.isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {c.isAvailable ? "Available" : "Unavailable"}
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
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Gift size={24} className="opacity-20" />
                    <p>No combos found.</p>
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
        title={isEditing ? "Edit Combo" : "New Combo"}
      >
        <div className="space-y-8 pb-24">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Basic Info
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Combo Name *
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="e.g. Family Feast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  HS Code
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  value={hscode}
                  onChange={(e) => setHscode(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Category *
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Sub Menu
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  value={subMenuId}
                  onChange={(e) => setSubMenuId(e.target.value)}
                >
                  <option value="">Select Sub Menu</option>
                  {subMenus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  KOT
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  value={kotType}
                  onChange={(e) => setKotType(e.target.value as any)}
                >
                  <option value="KITCHEN">Kitchen</option>
                  <option value="BAR">Bar</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Prep Time (m)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
            </div>

            <ImageUpload
              label="Combo Image"
              value={typeof imageFile === "string" ? imageFile : undefined}
              onChange={setImageFile}
            />

            <RichTextEditor
              label="Description"
              value={description}
              onChange={setDescription}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Combo Items
            </h3>
            <div className="space-y-3">
              {comboItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-200"
                >
                  <select
                    className="flex-1 rounded border border-gray-300 p-2 text-sm"
                    value={item.dishId}
                    onChange={(e) => {
                      const newItems = [...comboItems];
                      newItems[index].dishId = e.target.value;
                      setComboItems(newItems);
                    }}
                  >
                    <option value="">Select Dish</option>
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-20 rounded border border-gray-300 p-2 text-sm"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...comboItems];
                      newItems[index].quantity = parseInt(e.target.value) || 0;
                      setComboItems(newItems);
                    }}
                  />
                  <input
                    type="number"
                    className="w-24 rounded border border-gray-300 p-2 text-sm"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const newItems = [...comboItems];
                      newItems[index].unitPrice =
                        parseFloat(e.target.value) || 0;
                      setComboItems(newItems);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newItems = comboItems.filter((_, i) => i !== index);
                      setComboItems(newItems);
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  setComboItems([
                    ...comboItems,
                    { dishId: "", quantity: 1, unitPrice: 0 },
                  ])
                }
              >
                <Plus size={16} className="mr-2" /> Add Item
              </Button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Pricing
            </h3>
            <PriceForm value={price} onChange={setPrice} />
          </section>
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Stock Consumption (Extra)
            </h3>
            <StockConsumptionForm
              stocks={stocks}
              value={stockConsumption}
              onChange={setStockConsumption}
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
            disabled={!name || !categoryId || uploading}
          >
            {uploading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
