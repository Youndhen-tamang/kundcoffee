import DashboardClient from "./DashboardClient";
import { getSpaces } from "@/services/space";
import { getTables, getTableTypes } from "@/services/table";

// Helper to handle server-side fetch with absolute URL fallback or direct DB?
// Since we have helper functions, let's try to use them.
// But we know 'fetch' needs absolute URL on server.
// Let's assume the user is running on localhost:3000 for now as per their code.
// Ideally we should move logic to direct DB calls for server components to avoid loopback http overhead,
// but to respect "don't change logic", we will keep using the API routes via fetch,
// just fixing the URL issue.

async function getData() {
  const baseUrl = "http://localhost:3000";

  try {
    const [spacesRes, tablesRes, typesRes, customersRes] = await Promise.all([
      fetch(`${baseUrl}/api/spaces`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/tables`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/tables/type`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/customer/summary`, { cache: "no-store" }),
    ]);

    const spaces = await spacesRes.json();
    const tables = await tablesRes.json();
    const types = await typesRes.json();
    const customers = await customersRes.json();

    return {
      spaces: spaces.success ? spaces.data : [],
      tables: tables.data || [],
      tableTypes: types.tableType || [],
      customers: customers.success ? customers.data : [],
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    return { spaces: [], tables: [], tableTypes: [], customers: [] };
  }
}

export default async function DashboardPage() {
  const { spaces, tables, tableTypes, customers } = await getData();

  return (
    <DashboardClient
      initialSpaces={spaces}
      initialTables={tables}
      initialTableTypes={tableTypes}
      initialCustomers={customers}
    />
  );
}
