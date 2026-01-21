"use client";
import { useEffect, useState } from "react";
import { MenuSet, SubMenu } from "@/lib/types";
import {
  getMenuSets,
  addMenuSet,
  updateMenuSet,
  getSubMenus,
} from "@/fetch/menu";
import { PageHeaderAction } from "@/components/ui/PageHeaderAction";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/SidePanel";
import { useRouter } from "next/navigation";

export default function MenuSetsPage() {
  const router = useRouter();
  const [menuSets, setMenuSets] = useState<MenuSet[]>([]);
  const [filtered, setFiltered] = useState<MenuSet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Side Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);

  // Form
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [selectedSubMenuIds, setSelectedSubMenuIds] = useState<string[]>([]);

  const refresh = async () => {
    const [mData, sData] = await Promise.all([getMenuSets(), getSubMenus()]);
    setMenuSets(mData);
    setFiltered(mData);
    setSubMenus(sData);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFiltered(menuSets.filter((m) => m.name.toLowerCase().includes(lower)));
  }, [searchQuery, menuSets]);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedId(null);
    setName("");
    setService("");
    setSelectedSubMenuIds([]);
    setIsPanelOpen(true);
  };

  const openEdit = (m: MenuSet) => {
    setIsEditing(true);
    setSelectedId(m.id);
    setName(m.name);
    setService(m.service);
    setSelectedSubMenuIds(m.subMenus?.map((sm) => sm.subMenuId) || []);
    setIsPanelOpen(true);
  };

  const toggleSubMenu = (id: string) => {
    if (selectedSubMenuIds.includes(id)) {
      setSelectedSubMenuIds(selectedSubMenuIds.filter((i) => i !== id));
    } else {
      setSelectedSubMenuIds([...selectedSubMenuIds, id]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !service) return;

    const payload = {
      name,
      service,
      subMenuIds: selectedSubMenuIds,
    };

    let res;
    if (isEditing && selectedId) {
      res = await updateMenuSet({ ...payload, id: selectedId });
    } else {
      res = await addMenuSet(payload);
    }

    if (res) {
      await refresh();
      setIsPanelOpen(false);
      setName("");
      setService("");
      setSelectedSubMenuIds([]);
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeaderAction
        title="Menu Sets"
        description="Manage menu availability"
        onSearch={setSearchQuery}
        actionButton={<Button onClick={openCreate}>Create Menu Set</Button>}
      />

      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Sets" value={menuSets.length} />
        <MetricCard
          title="Active Sets"
          value={menuSets.filter((m) => m.isActive).length}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Set Name
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">Service</th>
              <th className="px-6 py-4 font-semibold text-gray-900">
                Sub Menus
              </th>
              <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((m) => (
              <tr
                key={m.id}
                onClick={() => openEdit(m)}
                className="hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {m.name}
                </td>
                <td className="px-6 py-4">{m.service}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {m.subMenus?.map((sm) => (
                      <span
                        key={sm.id}
                        className="bg-gray-100 px-2 py-0.5 rounded text-xs"
                      >
                        {sm.subMenu?.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs ${m.isActive ? "text-green-600" : "text-gray-400"}`}
                  >
                    {m.isActive ? "Active" : "Inactive"}
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
        title={isEditing ? "Edit Menu Set" : "Add Menu Set"}
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Menu Set Name
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekday Lunch"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Service Type
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Dine In"
            />
          </div>

          <div className="border p-4 rounded bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-2">
              Select Sub Menus
            </h3>
            <div className="flex flex-wrap gap-2">
              {subMenus.map((sm) => (
                <label
                  key={sm.id}
                  className="flex items-center gap-2 bg-white px-2 py-1 rounded border cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubMenuIds.includes(sm.id)}
                    onChange={() => toggleSubMenu(sm.id)}
                  />
                  <span className="text-sm">{sm.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {isEditing ? "Update Menu Set" : "Create Menu Set"}
          </Button>
        </div>
      </SidePanel>
    </div>
  );
}
