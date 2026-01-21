"use client";
import { useEffect, useState } from "react";
import { AddOn, Stock, Price } from "@/lib/types";
import { getAddOns, addAddOn, updateAddOn, getStocks } from "@/fetch/menu";
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

export default function AddOnsPage() {
  const router = useRouter();
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [filtered, setFiltered] = useState<AddOn[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [stocks, setStocks] = useState<Stock[]>([]);

  // Form
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"EXTRA" | "ADDON">("EXTRA");
  const [price, setPrice] = useState<Partial<Price>>({});
  const [stockConsumption, setStockConsumption] = useState<
    { stockId: string; quantity: number }[]
  >([]);

  const refresh = async () => {
    const [aData, sData] = await Promise.all([getAddOns(), getStocks()]);
    setAddOns(aData);
    setFiltered(aData);
    setStocks(sData);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(addOns.filter((a) => a.name.toLowerCase().includes(lower)));
  }, [searchQuery, addOns]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setImageFile(null);
    setDescription("");
    setType("EXTRA");
    setPrice({});
    setStockConsumption([]);
    setIsPanelOpen(true);
  };

  const openEdit = (a: AddOn) => {
    setIsEditing(true);
    setSelectedId(a.id);
    setName(a.name);
    setImageFile(a.image || null);
    setDescription(a.description || "");
    setType(a.type);
    setPrice(a.price || {});
    setStockConsumption(
      a.stocks?.map((s) => ({ stockId: s.stockId, quantity: s.quantity })) ||
        [],
    );
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

    const payload = {
      name,
      image: typeof finalImage === "string" ? finalImage : undefined,
      description,
      type,
      price,
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

    if (res) {
      await refresh();
      setIsPanelOpen(false);
      setName("");
      setImageFile(null);
      setDescription("");
      setType("EXTRA");
      setPrice({});
      setStockConsumption([]);
      router.refresh();
    }
  };

  const total = addOns.length;
  const mostUsed = [...addOns].sort(
    (a, b) => (b.usedIn?.length || 0) - (a.usedIn?.length || 0),
  )[0];
  const typeCounts = addOns.reduce(
    (acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return (
    <div>
      <PageHeaderAction
        title="Add-Ons & Extras"
        description="Manage additional items"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Create New</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Items" value={total} />
        <MetricCard title="Most Used" value={mostUsed?.name || "-"} />
        <MetricCard title="Top Type" value={topType} />
        <MetricCard
          title="With Stock Setup"
          value={addOns.filter((a) => a.stocks && a.stocks.length > 0).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-900">Price</th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Used In (Dishes)
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Available
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => openEdit(a)}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  {a.image && (
                    <img
                      src={a.image}
                      className="w-8 h-8 rounded bg-gray-100 object-cover"
                    />
                  )}
                  {a.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${a.type === "ADDON" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}`}
                  >
                    {a.type}
                  </span>
                </td>
                <td className="px-6 py-4">{a.price?.listedPrice || "-"}</td>
                <td className="px-6 py-4">{a.usedIn?.length || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs ${a.isAvailable ? "text-green-600" : "text-gray-400"}`}
                  >
                    {a.isAvailable ? "Active" : "Inactive"}
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
        title={isEditing ? "Edit Add-On" : "Add New Add-On"}
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Name
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Type
              </label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="EXTRA">Extra</option>
                <option value="ADDON">Add-on</option>
              </select>
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
          <PriceForm value={price} onChange={setPrice} />
          <StockConsumptionForm
            stocks={stocks}
            value={stockConsumption}
            onChange={setStockConsumption}
          />

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
