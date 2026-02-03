// "use client";

// import { use, useEffect, useState } from "react"; // <- use React.use()
// import { useRouter } from "next/navigation";
// import { getOrders } from "@/services/order";
// import { OrderDetailView } from "@/components/orders/OrderDetailView";
// import { Order, OrderStatus } from "@/lib/types";

// interface OrderPageProps {
//   params: Promise<{ id: string }>;
// }

// export default function OrderPage({ params }: OrderPageProps) {
//   const router = useRouter();
//   const { id } = use(params); // <- unwrap the promise here

//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       const orders = await getOrders();
//       const found = orders.find((o) => o.id === id);
//       setSelectedOrder(found || null);
//     };
//     fetchOrder();
//   }, [id]);

  
//   if (!selectedOrder) return <div>Loading...</div>;

//   return (
//     <div className="p-8 min-h-screen bg-zinc-50">
//       <OrderDetailView
//             onRemoveItem={handleRemoveItem} // <--- Pass this new prop
//             order={selectedOrder}
//         onClose={() => router.push("/orders")}
//         onUpdateStatus={async () => {}}
//         onUpdateItemStatus={async () => {}}
//         onEditItem={async () => {}}
//         onCheckout={() => {}}
//         onAddMore={() => {}}
//       />
      
//     </div>
//   );
// }
