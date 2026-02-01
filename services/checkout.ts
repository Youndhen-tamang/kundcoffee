export const getCheckoutDetails = async (tableId: string) => {
  const res = await fetch(`/api/checkout/table/${tableId}`);
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || "Failed to fetch checkout details");
};

export const processCheckout = async (payload: {
  tableId: string;
  sessionId: string;
  paymentMethod: "CASH" | "QR" | "ESEWA";
  amount: number;
  customerId?: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
}) => {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || "Checkout failed");
};
