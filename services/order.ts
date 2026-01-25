import { Order, OrderStatus } from "@/lib/types";

export const getOrders = async (): Promise<Order[]> => {
  const res = await fetch("/api/order");
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  return [];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<boolean> => {
  const res = await fetch(`/api/order/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.success;
};

export const updateOrderItemStatus = async (
  orderItemId: string,
  status: OrderStatus,
): Promise<boolean> => {
  const res = await fetch(`/api/order/item/${orderItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.success;
};

export const createOrder = async (orderData: any): Promise<boolean> => {
  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  return res.ok || data.success;
};

export const updateOrderItems = async (
  orderId: string,
  items: any[],
): Promise<boolean> => {
  const res = await fetch(`/api/order/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  return data.success;
};
