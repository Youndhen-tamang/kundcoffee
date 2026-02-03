"use client";
import { useEffect, useState } from "react";
import { Dish, Category, SubMenu, AddOn, Stock, Price } from "@/lib/types";
import {
  getDishes,
  addDish,
  updateDish,
  deleteDish,
  getCategories,
  getSubMenus,
  getAddOns,
  getStocks,
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
import { Trash2, Edit2, Plus, Coffee, Utensils } from "lucide-react";

export default function DishesPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filtered, setFiltered] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Aux Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Side Panel State
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
  const [type, setType] = useState<"VEG" | "NON_VEG" | "SNACK" | "DRINK">(
    "VEG",
  );
  const [kotType, setKotType] = useState<"KITCHEN" | "BAR">("KITCHEN");

  const [price, setPrice] = useState<Partial<Price>>({});
  const [stockConsumption, setStockConsumption] = useState<
    { stockId: string; quantity: number }[]
  >([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [dData, cData, sData, aData, stData] = await Promise.all([
      getDishes(),
      getCategories(),
      getSubMenus(),
      getAddOns(),
      getStocks(),
    ]);
    setDishes(dData);
    setFiltered(dData);
    setCategories(cData);
    setSubMenus(sData);
    setAddOns(aData);
    setStocks(stData);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(dishes.filter((d) => d.name.toLowerCase().includes(lower)));
  }, [searchQuery, dishes]);

  const resetForm = () => {
    setName("");
    setHscode("");
    setImageFile(null);
    setPrepTime("");
    setDescription("");
    setCategoryId("");
    setSubMenuId("");
    setType("VEG");
    setKotType("KITCHEN");
    setPrice({});
    setStockConsumption([]);
    setSelectedAddOnIds([]);
  };

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    resetForm();
    setIsPanelOpen(true);
  };

  const openEdit = (d: Dish, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setSelectedId(d.id);
    setName(d.name);
    setHscode(d.hscode || "");
    const firstImage = d.image && d.image.length > 0 ? d.image[0] : null;
    setImageFile(firstImage);

    setPrepTime(d.preparationTime.toString());
    setDescription(d.description || "");
    setCategoryId(d.categoryId);
    setSubMenuId(d.subMenuId || "");
    setType(d.type);
    setKotType(d.kotType);

    // Ensure price is an object, even if null from backend
    setPrice(d.price || {}); 
    
    setStockConsumption(
      d.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
    // @ts-ignore
    setSelectedAddOnIds(d.addOns?.map((da) => da.addOnId) || []);

    setIsPanelOpen(true);
  };

  /**
   * Price calculation logic:
   * 1. Merges new changes with existing state.
   * 2. Calculates listedPrice and grossProfit.
   * 3. Updates the price state.
   */
  const calculateAndSetPrice = (newPartialPrice: Partial<Price>) => {
    // 1. Merge the new changes with the current state
    const newState = { ...price, ...newPartialPrice };

    // 2. Extract and ensure numeric types (use 0 for missing/invalid)
    const actualPrice = parseFloat(newState.actualPrice?.toString() || '0') || 0;
    const discountPrice = parseFloat(newState.discountPrice?.toString() || '0') || 0;
    const cogs = parseFloat(newState.cogs?.toString() || '0') || 0;

    // 3. Auto-calculate listedPrice: listedPrice = actualPrice - discountPrice
    const listedPrice = Math.max(0, actualPrice - discountPrice);

    // 4. Auto-calculate grossProfit: grossProfit = listedPrice - cogs
    const grossProfit = listedPrice - cogs;

    // 5. Update state with calculated values
    setPrice({
      ...newState,
      actualPrice,
      discountPrice,
      cogs,
      listedPrice,
      grossProfit,
    });
  };

  const handleSubmit = async () => {
    if (!name || !categoryId || !prepTime) {
      alert("Please fill required fields (Name, Category, Prep Time)");
      return;
    }

    // Handle Image Upload
    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;

    if (imageFile instanceof File) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "dishes");

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const { url } = await uploadRes.json();
        if (url) imageUrl = url;
      } catch (err) {
        console.error("Upload failed", err);
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
      type,
      kotType,
      // Pass the fully calculated price object from state
      price: {
        actualPrice: price.actualPrice || 0,
        listedPrice: price.listedPrice || 0,
        cogs: price.cogs || 0,
        grossProfit: price.grossProfit || 0,
        discountPrice: price.discountPrice || 0,
        id: price.id,
      },
      stocks: stockConsumption.filter((s) => s.stockId && s.quantity > 0),
      addOnIds: selectedAddOnIds,
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateDish({ ...payload, id: selectedId });
    } else {
      res = await addDish(payload);
    }

    if (res?.success) {
      await refresh();
      setIsPanelOpen(false);
      resetForm();
      router.refresh();
    }
  };

  // Stats
  const totalDishes = dishes.length;
  const vegDishes = dishes.filter((d) => d.type === "VEG").length;
  const avgPrice =
    totalDishes > 0
      ? (
          dishes.reduce((acc, d) => acc + (d.price?.listedPrice || 0), 0) /
          totalDishes
        ).toFixed(2)
      : "0";

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dishes</h1>
          <p className="text-gray-500 font-medium">
            Manage your restaurant menu items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            <Plus size={18} className="mr-2" /> Add Dish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Dishes" value={totalDishes} />
        <MetricCard
          title="Veg / Non-Veg"
          value={`${vegDishes} / ${totalDishes - vegDishes}`}
        />
        <MetricCard title="Avg Listed Price" value={`$${avgPrice}`} />
        <MetricCard title="Most Popular" value="-" subValue="Based on sales" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <input
            placeholder="Search dishes..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-full max-w-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">SN</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Dish Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Prep(m)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  onClick={() => openEdit(d)}
                  className="hover:bg-red-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      {d.image && d.image[0] ? (
                        <img
                          src={d.image[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold bg-slate-100">
                          {d.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{d.name}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    ${d.price?.listedPrice || 0}
                  </td>
                  <td className="px-6 py-4">
                    {categories.find((c) => c.id === d.categoryId)?.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        d.type === "VEG"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : d.type === "NON_VEG"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {d.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">{d.preparationTime}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${d.isAvailable ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {d.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(d, e)}
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
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <Utensils size={24} className="opacity-20" />
                      </div>
                      <p>No dishes found.</p>
                    </div>
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
        title={isEditing ? "Edit Dish" : "Add New Dish"}
      >
        <div className="space-y-8 pb-24">
          {/* Basic Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Coffee size={18} className="text-red-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Basic Info
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Dish Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="e.g. Grilled Chicken"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  HS Code
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="HS Code"
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all appearance-none outline-none"
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
                  Sub Menu (Optional)
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all appearance-none outline-none"
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
                  Type
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="VEG">Veg</option>
                  <option value="NON_VEG">Non-Veg</option>
                  <option value="SNACK">Snack</option>
                  <option value="DRINK">Drink</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  KOT
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all outline-none"
                  value={kotType}
                  onChange={(e) => setKotType(e.target.value as any)}
                >
                  <option value="KITCHEN">Kitchen</option>
                  <option value="BAR">Bar</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Prep(m)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
            </div>

            <ImageUpload
              label="Dish Photo"
              value={typeof imageFile === "string" ? imageFile : undefined}
              onChange={setImageFile}
            />

            <RichTextEditor
              label="Description"
              value={description}
              onChange={setDescription}
            />
          </section>

          {/* Pricing Section - UPDATED HANDLER HERE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-green-600 font-bold">$</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Pricing & Cost
              </h3>
            </div>
            {/* Using the new handler for dynamic calculation */}
            <PriceForm value={price} onChange={calculateAndSetPrice} />
          </section>

          {/* Stock Consumption Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-orange-600 font-bold">📦</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Stock Consumption
              </h3>
            </div>
            <StockConsumptionForm
              stocks={stocks}
              value={stockConsumption}
              onChange={setStockConsumption}
            />
          </section>

          {/* Add-ons Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-blue-600 font-bold">+</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Add-ons & Extras
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-center gap-2 border px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                    selectedAddOnIds.includes(addon.id)
                      ? "bg-red-50 border-red-200 text-red-700 font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="rounded text-red-600 focus:ring-red-500"
                    checked={selectedAddOnIds.includes(addon.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedAddOnIds([...selectedAddOnIds, addon.id]);
                      else
                        setSelectedAddOnIds(
                          selectedAddOnIds.filter((id) => id !== addon.id),
                        );
                    }}
                  />
                  {addon.name}{" "}
                  <span className="text-xs text-gray-400">
                    (${addon.price?.listedPrice})
                  </span>
                </label>
              ))}
              {addOns.length === 0 && (
                <p className="text-gray-400 text-sm italic">
                  No add-ons available. Create them in the Add-ons module.
                </p>
              )}
            </div>
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
            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
            disabled={!name || !categoryId || uploading}
          >
            {uploading
              ? "Saving..."
              : isEditing
                ? "Update Dish"
                : "Create Dish"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}