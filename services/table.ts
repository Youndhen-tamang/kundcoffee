import { Table, TableType } from "@/lib/types";
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
