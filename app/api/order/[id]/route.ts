import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse,NextRequest } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = context.params;
    const body = await req.json();
    const { status, paymentMethod, items } = body;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Handle Item Updates
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.action === "add") {
            const addOnsTotal = (item.selectedAddOns || []).reduce(
              (sum: number, a: any) =>
                sum + (a.unitPrice || 0) * (a.quantity || 1),
              0,
            );
            const totalPrice =
              (item.unitPrice || 0) * (item.quantity || 1) + addOnsTotal;

            await (tx.orderItem.create as any)({
              data: {
                orderId: id,
                dishId: item.dishId || null,
                comboId: item.comboId || null,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                totalPrice,
                remarks: item.remarks || null,
                selectedAddOns: {
                  create: (item.selectedAddOns || []).map((a: any) => ({
                    addOnId: a.addOnId,
                    quantity: a.quantity || 1,
                    unitPrice: a.unitPrice || 0,
                  })),
                },
              },
            });
          } else if (item.action === "update") {
            const addOnsTotal = (item.selectedAddOns || []).reduce(
              (sum: number, a: any) =>
                sum + (a.unitPrice || 0) * (a.quantity || 1),
              0,
            );
            const totalPrice =
              (item.unitPrice || 0) * (item.quantity || 1) + addOnsTotal;

            await (tx.orderItem.update as any)({
              where: { id: item.id },
              data: {
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice,
                remarks: item.remarks,
              },
            });

            if (item.selectedAddOns) {
              await tx.orderItemAddOn.deleteMany({
                where: { orderItemId: item.id },
              });
              await tx.orderItemAddOn.createMany({
                data: item.selectedAddOns.map((a: any) => ({
                  orderItemId: item.id,
                  addOnId: a.addOnId,
                  quantity: a.quantity || 1,
                  unitPrice: a.unitPrice || 0,
                })),
              });
            }
          } else if (item.action === "remove") {
            await tx.orderItem.delete({ where: { id: item.id } });
          }
        }
      }

      // 2. Recalculate Total
      const allItems = await tx.orderItem.findMany({ where: { orderId: id } });
      const newTotal = allItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // 3. Update Order Level Metadata
      const updateData: any = { total: newTotal };
      if (status) updateData.status = status;

      const order = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              selectedAddOns: { include: { addOn: true } },
              dish: true,
            },
          },
          table: true,
        },
      });

      // 4. Handle Completion and Payments
      // 4. Handle Completion and Payments
if (status === "COMPLETED" && paymentMethod) {
  await tx.payment.upsert({
    where: { orderId: id },
    update: { amount: newTotal, method: paymentMethod, status: "PAID" },
    create: {
      orderId: id,
      amount: newTotal,
      method: paymentMethod,
      status: "PAID",
    },
  });

  if (order.tableId && order.type === "DINE_IN") {
    const session = await tx.tableSession.findFirst({
      where: { tableId: order.tableId, isActive: true },
    });

    if (session) {
      await tx.tableSession.update({
        where: { id: session.id },
        data: {
          total: { increment: order.total },
          isActive: false,
          endedAt: new Date(),
        },
      });
    }

    await tx.table.update({
      where: { id: order.tableId },
      data: { status: "ACTIVE" },
    });
  }
}


      return order;
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    console.error("DEBUG ORDER PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order)
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 400 },
      );

    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete a processed order",
        },
        { status: 400 },
      );
    }
    await prisma.order.delete({
      where: { id },
    });
    return NextResponse.json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}


export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include:{
        table:true,
        customer:true,
      }
    });

    if (!order)
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 400 },
      );

      return NextResponse.json({
        success:true,data:order
      },{status:200})

  } catch (error:any ) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}