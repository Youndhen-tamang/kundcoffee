"use client";
import { useEffect, useState } from "react";
import { Dish, Category, SubMenu, AddOn, Stock, Price } from "@/lib/types";
import {
  getDishes,
  addDish,
  updateDish,
  getCategories,
  getSubMenus,
  getAddOns,
  getStocks,
} from "@/fetch/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import {
  StockConsumptionForm,
  PriceForm,
  RichTextEditor,
} from "@/components/menu/MenuForms";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function DishesPage() {
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filtered, setFiltered] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Aux Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

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

  const refresh = async () => {
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
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(dishes.filter((d) => d.name.toLowerCase().includes(lower)));
  }, [searchQuery, dishes]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    resetForm();
    setIsPanelOpen(true);
  };

  const openEdit = (d: Dish) => {
    setIsEditing(true);
    setSelectedId(d.id);
    setName(d.name);
    setHscode(d.hscode || "");
    setImageFile(d.image || null);
    setPrepTime(d.preparationTime.toString());
    setDescription(d.description || "");
    setCategoryId(d.categoryId);
    setSubMenuId(d.subMenuId || "");
    setType(d.type);
    setKotType(d.kotType);

    // Complex fields
    setPrice(d.price || {});
    setStockConsumption(
      d.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
    setSelectedAddOnIds(d.addOns?.map((da) => da.addOnId) || []);

    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !categoryId || !prepTime) {
      alert("Please fill required fields (Name, Category, Prep Time)");
      return;
    }

    // Handle Image Upload Mock
    let finalImage = imageFile;
    if (imageFile instanceof File) {
      console.log("Uploading file:", imageFile.name);
      finalImage = `https://placehold.co/400?text=${encodeURIComponent(name)}`;
    }

    const payload = {
      name,
      hscode,
      image: typeof finalImage === "string" ? finalImage : undefined,
      preparationTime: parseInt(prepTime),
      description,
      categoryId,
      subMenuId: subMenuId || undefined,
      type,
      kotType,
      price,
      stockConsumption: stockConsumption.filter(
        (s) => s.stockId && s.quantity > 0,
      ),
      addOnIds: selectedAddOnIds,
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateDish({ ...payload, id: selectedId });
    } else {
      res = await addDish(payload);
    }

    if (res) {
      await refresh();
      setIsPanelOpen(false);
      resetForm();
      router.refresh();
    }
  };

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

  return (
    <div>
      <PageHeaderAction
        title="Dishes"
        description="Manage menu items"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Add Dish</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Dishes" value={dishes.length} />
        <MetricCard
          title="Veg Dishes"
          value={dishes.filter((d) => d.type === "VEG").length}
        />
        <MetricCard
          title="Non-Veg Dishes"
          value={dishes.filter((d) => d.type === "NON_VEG").length}
        />
        <MetricCard
          title="Bar Items"
          value={dishes.filter((d) => d.kotType === "BAR").length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">SN</th>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Dish Name
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Prep(m)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((d, i) => (
                <tr
                  key={d.id}
                  onClick={() => openEdit(d)}
                  className="hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                    {d.image && (
                      <img
                        src={d.image}
                        className="w-8 h-8 rounded bg-gray-100 object-cover"
                      />
                    )}
                    {d.name}
                  </td>
                  <td className="px-6 py-4">{d.price?.listedPrice || "-"}</td>
                  <td className="px-6 py-4">{d.category?.name || "-"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${d.type === "VEG" ? "bg-green-100 text-green-800" : d.type === "NON_VEG" ? "bg-red-100 text-red-800" : "bg-gray-100"}`}
                    >
                      {d.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{d.preparationTime}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${d.isAvailable ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      {d.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title={isEditing ? "Edit Dish" : "Add New Dish"}
      >
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Dish Name *
              </label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                HS Code
              </label>
              <input
                className="w-full border rounded p-2 text-sm"
                value={hscode}
                onChange={(e) => setHscode(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Category *
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
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
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Sub Menu
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
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
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Type
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
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
              <label className="text-sm font-medium text-gray-700 block mb-1">
                KOT Type
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={kotType}
                onChange={(e) => setKotType(e.target.value as any)}
              >
                <option value="KITCHEN">Kitchen</option>
                <option value="BAR">Bar</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Prep Time (mins) *
              </label>
              <input
                type="number"
                className="w-full border rounded p-2 text-sm"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
          </div>

          <ImageUpload
            label="Dish Image"
            value={typeof imageFile === "string" ? imageFile : undefined}
            onChange={setImageFile}
          />

          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
          />

          <PriceForm value={price} onChange={setPrice} />
          <StockConsumptionForm
            stocks={stocks}
            value={stockConsumption}
            onChange={setStockConsumption}
          />

          <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">
              Add-ons & Extras
            </h3>
            <div className="flex flex-wrap gap-2">
              {addOns.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center gap-2 border p-2 rounded bg-white text-xs cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
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
                  {addon.name} ({addon.price?.listedPrice})
                </label>
              ))}
              {addOns.length === 0 && (
                <span className="text-gray-400 text-xs">
                  No add-ons available.
                </span>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update Dish" : "Create Dish"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
