// services/customer.ts
import { Customer } from "@/lib/types";

export async function getCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch("/api/customer", { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Failed to fetch customers", err);
    return [];
  }
}

export async function getCustomerSummary() {
  try {
    const res = await fetch("/api/customer/summary", { cache: "no-store" });
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch customer summary", err);
    return {
      success: false,
      data: [],
      metrics: { toReceive: 0, toPay: 0, netToReceive: 0 },
    };
  }
}

export async function getCustomerById(id: string) {
  try {
    const res = await fetch(`/api/customer/${id}`, { cache: "no-store" });
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch customer", err);
    return null;
  }
}

export async function addCustomer(payload: any) {
  const res = await fetch("/api/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCustomer(id: string, payload: any) {
  const res = await fetch(`/api/customer/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`/api/customer/${id}`, { method: "DELETE" });
  return res.json();
}
