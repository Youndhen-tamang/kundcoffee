import { ApiResponse, Table, TableType } from "@/lib/types";
import { TableSession } from "@prisma/client";
import { NextResponse } from "next/server";

export async function addTableType(name: string): Promise<TableType | null> {
  try {
    const res = await fetch("/api/tables/type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error adding table type:", error);
    return null;
  }
}
export async function getOccupiedTable() {
  try {
    const res = await fetch("/api/tableSession", { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch tables:", res.status);
      return null;
    }
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching occupied table:", error);
    return null;
  }
}
export async function addTable(
  name: string,
  capacity: number,
  spaceId?: string,
  tableTypeId?: string,
): Promise<Table | null> {
  try {
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, capacity, spaceId, tableTypeId }),
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error adding table:", error);
    return null;
  }
}

export async function getTables(): Promise<Table[]> {
  try {
    const res = await fetch("/api/tables", {
      cache: "no-store",
      next: { revalidate: 0 },
      credentials: "include",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTableTypes(): Promise<TableType[]> {
  try {
    const res = await fetch(`/api/tables/type`, { cache: "no-store" });
    const data = await res.json();
    return data.tableType || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}



export async function updateTable(data: Partial<Table>): Promise<ApiResponse> {
  const { id, ...updates } = data;
  console.log("ythis is id ",id)
  if (!id) return { success: false, message: "ID required" };

  try {
    const res = await fetch(`/api/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
        return { success: false, message: "Failed to update table" };
    }

    const updatedTable = await res.json();
    return { success: true, data: updatedTable };
  } catch (error) {
    console.error("Failed to update table:", error);
    return { success: false, message: "Network error" };
  }
}

export async function deleteTable(id: string): Promise<ApiResponse> {
  if (!id) return { success: false, message: "ID required" };

  try {
    const res = await fetch(`/api/tables/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return { success: false, message: "Failed to delete table" };
    }

    const responseData = await res.json();
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Failed to delete table:", error);
    return { success: false, message: "Network error" };
  }
}