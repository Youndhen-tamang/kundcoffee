"use client";
import { useEffect, useState } from "react";
import { ComboOffer, Category, SubMenu, Dish, Stock, Price } from "@/lib/types";
import {
  getCombos,
  addCombo,
  updateCombo,
  getCategories,
  getSubMenus,
  getDishes,
  getStocks,
} from "@/fetch/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  StockConsumptionForm,
  PriceForm,
  RichTextEditor,
} from "@/components/menu/MenuForms";

export default function CombosPage() {
  const router = useRouter();
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [filtered, setFiltered] = useState<ComboOffer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Aux Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

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

  // Combo Items
  const [items, setItems] = useState<
    { dishId: string; quantity: number; unitPrice: number }[]
  >([]);

  const refresh = async () => {
    const [coData, cData, smData, dData, sData] = await Promise.all([
      getCombos(),
      getCategories(),
      getSubMenus(),
      getDishes(),
      getStocks(),
    ]);
    setCombos(coData);
    setFiltered(coData);
    setCategories(cData);
    setSubMenus(smData);
    setDishes(dData);
    setStocks(sData);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(combos.filter((c) => c.name.toLowerCase().includes(lower)));
  }, [searchQuery, combos]);

  const addItem = () => {
    setItems([...items, { dishId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, val: any) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = val;
    setItems(newItems);
  };

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    resetForm();
    setIsPanelOpen(true);
  };

  const openEdit = (c: ComboOffer) => {
    setIsEditing(true);
    setSelectedId(c.id);
    setName(c.name);
    setHscode(c.hscode || "");
    setImageFile(c.image || null);
    setPrepTime(c.preparationTime.toString());
    setDescription(c.description || "");
    setCategoryId(c.categoryId);
    setSubMenuId(c.subMenuId || "");
    setKotType(c.kotType);
    setPrice(c.price || {});
    setItems(
      c.items?.map((i) => ({
        dishId: i.dishId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })) || [],
    );
    setStockConsumption(
      c.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
    setIsPanelOpen(true);
  };

  const resetForm = () => {
    setName("");
    setHscode("");
    setImageFile(null);
    setPrepTime("");
    setDescription("");
    setCategoryId("");
    setSubMenuId("");
    setKotType("KITCHEN");
    setPrice({});
    setItems([]);
    setStockConsumption([]);
  };

  const handleSubmit = async () => {
    if (!name || !categoryId || !prepTime) return;

    // Mock upload
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
      kotType,
      price,
      items: items.filter((i) => i.dishId && i.quantity > 0),
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

    if (res) {
      await refresh();
      setIsPanelOpen(false);
      resetForm();
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeaderAction
        title="Combo Offers"
        description="Manage combo deals"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Create Combo</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Combos" value={combos.length} />
        <MetricCard
          title="Active"
          value={combos.filter((c) => c.isAvailable).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Combo Name
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Category
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">Price</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Items</th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Available
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
                      className="w-8 h-8 rounded bg-gray-100 object-cover"
                    />
                  )}
                  {c.name}
                </td>
                <td className="px-6 py-4">{c.category?.name || "-"}</td>
                <td className="px-6 py-4">{c.price?.listedPrice || "-"}</td>
                <td className="px-6 py-4">{c.items?.length || 0} items</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs ${c.isAvailable ? "text-green-600" : "text-gray-400"}`}
                  >
                    {c.isAvailable ? "Yes" : "No"}
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
        title={isEditing ? "Edit Combo Offer" : "Add Combo Offer"}
      >
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Combo Name *
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

          <div className="grid grid-cols-2 gap-4">
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
            label="Combo Image"
            value={typeof imageFile === "string" ? imageFile : undefined}
            onChange={setImageFile}
          />

          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
          />

          {/* Combo Items Selection */}
          <div className="border p-4 rounded bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Combo Items</h3>
              <Button size="sm" variant="secondary" onClick={addItem}>
                + Add Dish
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end mb-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500">Dish</label>
                  <select
                    className="w-full border rounded p-1 text-sm"
                    value={item.dishId}
                    onChange={(e) => updateItem(idx, "dishId", e.target.value)}
                  >
                    <option value="">Select Dish</option>
                    {dishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs text-gray-500">Qty</label>
                  <input
                    type="number"
                    className="w-full border rounded p-1 text-sm"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded p-1 text-sm"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, "unitPrice", parseFloat(e.target.value))
                    }
                  />
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeItem(idx)}
                >
                  X
                </Button>
              </div>
            ))}
          </div>

          <PriceForm value={price} onChange={setPrice} />
          <StockConsumptionForm
            stocks={stocks}
            value={stockConsumption}
            onChange={setStockConsumption}
          />

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update Combo" : "Create Combo"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
