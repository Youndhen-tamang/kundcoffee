"use client";
import { useEffect, useState } from "react";
import { AddOn, Stock, Price } from "@/lib/types";
import {
  getAddOns,
  addAddOn,
  updateAddOn,
  deleteAddOn,
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
import { Trash2, Edit2, Plus, Puzzle, AlertCircle } from "lucide-react";

export default function AddonsPage() {
  const router = useRouter();
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Side Panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [type, setType] = useState<"EXTRA" | "ADDON">("EXTRA");
  const [isAvailable, setIsAvailable] = useState(true);

  const [price, setPrice] = useState<Partial<Price>>({});
  const [stockConsumption, setStockConsumption] = useState<
    { stockId: string; quantity: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [aData, sData] = await Promise.all([getAddOns(), getStocks()]);
    setAddons(aData);
    setStocks(sData);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = addons.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setDescription("");
    setImageFile(null);
    setType("EXTRA");
    setIsAvailable(true);
    setPrice({});
    setStockConsumption([]);
    setIsPanelOpen(true);
  };

  const openEdit = (a: AddOn) => {
    setIsEditing(true);
    setSelectedId(a.id);
    setName(a.name);
    setDescription(a.description || "");
    setImageFile(a.image || null);
    setType(a.type);
    setIsAvailable(a.isAvailable);
    setPrice(a.price || {});
    setStockConsumption(
      a.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
    setIsPanelOpen(true);
  };

  const handleSubmit = async () => {
    if (!name) return;

    let imageUrl = typeof imageFile === "string" ? imageFile : undefined;

    if (imageFile instanceof File) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("folder", "addons");
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
      description,
      image: imageUrl,
      type,
      isAvailable,
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
      res = await updateAddOn({ ...payload, id: selectedId });
    } else {
      res = await addAddOn(payload);
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
          <h1 className="text-2xl font-bold text-gray-800">Add-ons & Extras</h1>
          <p className="text-gray-500 font-medium">
            Manage extra toppings and add-on items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openCreate}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          >
            <Plus size={18} className="mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Items" value={addons.length} />
        <MetricCard
          title="Types"
          value={`${addons.filter((a) => a.type === "EXTRA").length} Extras / ${addons.filter((a) => a.type === "ADDON").length} Addons`}
        />
        <MetricCard
          title="Available"
          value={addons.filter((a) => a.isAvailable).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <input
            placeholder="Search add-ons..."
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-full max-w-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => openEdit(a)}
                className="hover:bg-violet-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                    {a.image ? (
                      <img
                        src={a.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                        {a.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {a.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${a.type === "EXTRA" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                  >
                    {a.type}
                  </span>
                </td>
                <td className="px-6 py-4">${a.price?.listedPrice || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${a.isAvailable ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {a.isAvailable ? "Available" : "Unavailable"}
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
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Puzzle size={24} className="opacity-20" />
                    <p>No add-ons found.</p>
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
        title={isEditing ? "Edit Add-on" : "New Add-on"}
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
                placeholder="e.g. Extra Cheese"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Type
                </label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="EXTRA">Extra (Topping)</option>
                  <option value="ADDON">Side (Add-on)</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available to Order
                  </span>
                </label>
              </div>
            </div>

            <ImageUpload
              label="Image"
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
              Pricing
            </h3>
            <PriceForm value={price} onChange={setPrice} />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Stock Consumption
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
            disabled={!name || uploading}
          >
            {uploading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
