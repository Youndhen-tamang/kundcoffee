import { Table, TableType } from "@/lib/types";
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
    const res = await fetch(`/api/tables`, { cache: "no-store" });
    const data = await res.json();
    return data.data || []; // return the array
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTableTypes(): Promise<TableType[]> {
  try {
    const res = await fetch(`/api/tables/type`, { cache: "no-store" });
    const data = await res.json();
    return data.tableType || []; // return the array
  } catch (error) {
    console.error(error);
    return [];
  }
}
