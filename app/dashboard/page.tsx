import DashboardClient from "./DashboardClient";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getData(storeId: string) {
  try {
    const [spaces, tables, tableTypes, customers] = await Promise.all([
      prisma.space.findMany({
        where: { storeId },
        include: {
          tables: {
            include: {
              tableType: true,
              qrCode: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.table.findMany({
        where: { storeId },
        include: {
          tableType: true,
          space: true,
          qrCode: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.tableType.findMany({
        where: { storeId },
        include: {
          tables: true,
        },
      }),
      prisma.customer.findMany({
        where: { storeId },
        include: {
          CustomerLedger: true,
        },
      }),
    ]);

    const customerSummary = customers.map((c) => {
      const dueAmount =
        c.openingBalance +
        (c.CustomerLedger?.reduce((sum, l) => {
          if (
            l.type === "SALE" ||
            l.type === "ADJUSTMENT" ||
            l.type === "PAYMENT_OUT"
          )
            return sum + l.amount;
          if (l.type === "PAYMENT_IN" || l.type === "RETURN")
            return sum - l.amount;
          return sum;
        }, 0) || 0);

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        dob: c.dob,
        loyaltyId: c.loyaltyId,
        dueAmount,
      };
    });

    return {
      spaces: JSON.parse(JSON.stringify(spaces)),
      tables: JSON.parse(JSON.stringify(tables)),
      tableTypes: JSON.parse(JSON.stringify(tableTypes)),
      customers: JSON.parse(JSON.stringify(customerSummary)),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    return { spaces: [], tables: [], tableTypes: [], customers: [] };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const storeId = session?.user?.storeId;

  if (!storeId) {
    redirect("/login");
  }

  const { spaces, tables, tableTypes, customers } = await getData(storeId);

  return (
    <DashboardClient
      initialSpaces={spaces}
      initialTables={tables}
      initialTableTypes={tableTypes}
      initialCustomers={customers}
    />
  );
}
