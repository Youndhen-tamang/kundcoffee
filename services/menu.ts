import {
  Category,
  Dish,
  SubMenu,
  AddOn,
  MenuSet,
  ComboOffer,
  Stock,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getStocks(): Promise<Stock[]> {
  try {
    const res = await fetch("/api/stocks", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch stocks:", error);
    return [];
  }
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch("/api/category", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function addCategory(data: Partial<Category>) {
  try {
    const res = await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add category:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateCategory(data: Partial<Category>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/category", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const res = await fetch(`/api/category?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, message: "Network error" };
  }
}

// --- Dishes ---

export async function getDishes(): Promise<Dish[]> {
  try {
    const res = await fetch("/api/dishes", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch dishes:", error);
    return [];
  }
}

export async function addDish(data: Partial<Dish>) {
  try {
    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add dish:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateDish(data: Partial<Dish>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/dishes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update dish:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteDish(id: string) {
  try {
    const res = await fetch(`/api/dishes?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete dish:", error);
    return { success: false, message: "Network error" };
  }
}

// --- Sub Menus ---

export async function getSubMenus(): Promise<SubMenu[]> {
  try {
    const res = await fetch("/api/sub-menus", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch sub menus:", error);
    return [];
  }
}

export async function addSubMenu(data: Partial<SubMenu>) {
  try {
    const res = await fetch("/api/sub-menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add sub menu:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateSubMenu(data: Partial<SubMenu>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/sub-menus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update sub menu:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteSubMenu(id: string) {
  try {
    const res = await fetch(`/api/sub-menus?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete sub menu:", error);
    return { success: false, message: "Network error" };
  }
}

// --- Add Ons ---

export async function getAddOns(): Promise<AddOn[]> {
  try {
    const res = await fetch("/api/addons", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch addons:", error);
    return [];
  }
}

export async function addAddOn(data: Partial<AddOn>) {
  try {
    const res = await fetch("/api/addons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add addon:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateAddOn(data: Partial<AddOn>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/addons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update addon:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteAddOn(id: string) {
  try {
    const res = await fetch(`/api/addons?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete addon:", error);
    return { success: false, message: "Network error" };
  }
}

// --- Menu Sets ---

export async function getMenuSets(): Promise<MenuSet[]> {
  try {
    const res = await fetch("/api/menu-sets", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch menu sets:", error);
    return [];
  }
}

export async function addMenuSet(data: Partial<MenuSet>) {
  try {
    const res = await fetch("/api/menu-sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add menu set:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateMenuSet(data: Partial<MenuSet>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/menu-sets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update menu set:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteMenuSet(id: string) {
  try {
    const res = await fetch(`/api/menu-sets?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete menu set:", error);
    return { success: false, message: "Network error" };
  }
}

// --- Combo Offers ---

export async function getCombos(): Promise<ComboOffer[]> {
  try {
    const res = await fetch("/api/combos", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch combos:", error);
    return [];
  }
}

export async function addCombo(data: Partial<ComboOffer>) {
  try {
    const res = await fetch("/api/combos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to add combo:", error);
    return { success: false, message: "Network error" };
  }
}

export async function updateCombo(data: Partial<ComboOffer>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const res = await fetch("/api/combos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to update combo:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteCombo(id: string) {
  try {
    const res = await fetch(`/api/combos?id=${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("Failed to delete combo:", error);
    return { success: false, message: "Network error" };
  }
}
