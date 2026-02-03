"use client";

import { useEffect, useState } from "react";
import {
  Order,
  OrderStatus,
  OrderType,
  Table,
  spaceType,
  TableType,
  TableSession,
} from "@/lib/types";
import {
  getOrders,
  updateOrderStatus,
  updateOrderItemStatus,
  updateOrderItems,
  createOrder,
  deleteOrderItem,
} from "@/services/order";
import { getTables, getTableTypes, getOccupiedTable } from "@/services/table";
import { getSpaces } from "@/services/space";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { CheckoutModal } from "@/components/orders/CheckoutModal";
import { TableOrderingSystem } from "@/components/tables/TableOrderingSystem";
import { KOTCard } from "@/components/kot/KOTCard";
import { Button } from "@/components/ui/Button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Plus,
  Settings,
  History,
  FileText,
  Slash,
  WifiOff,
  CalendarDays,
  Users,
  ChefHat,
  Wine,
  X,
  Package,
  CreditCard,
} from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { toast } from "sonner";

type ActiveTab = "ORDERS" | "TABLES" | "KOT";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("TABLES");
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [spaces, setSpaces] = useState<spaceType[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderType, setSelectedOrderType] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [occupiedTable, setOccupiedTable] = useState<TableSession[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [existingOrderForAdding, setExistingOrderForAdding] =
    useState<Order | null>(null);
  const [newOrderType, setNewOrderType] = useState<OrderType>("DINE_IN");
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showOrderTypeSelector, setShowOrderTypeSelector] = useState(false);
  const [pendingTable, setPendingTable] = useState<Table | null>(null);
  const [quickMenuTable, setQuickMenuTable] = useState<Table | null>(null);
  const fetchData = async () => {
    // Always refresh orders and occupied tables as they are core to state
    const [oData, busyTables] = await Promise.all([
      getOrders(),
      getOccupiedTable(),
    ]);

    setOrders(oData);
    setOccupiedTable(busyTables || []);

    // Refresh structural data if in TABLES tab or if not yet loaded
    if (activeTab === "TABLES" || tables.length === 0) {
      const [tData, sData, ttData] = await Promise.all([
        getTables(),
        getSpaces(),
        getTableTypes(),
      ]);

      setTables(tData);
      setSpaces(sData);
      setTableTypes(ttData);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [oData, busyTables] = await Promise.all([
          getOrders(),
          getOccupiedTable(),
        ]);
        setOrders(oData || []);
        setOccupiedTable(busyTables || []);

        if (activeTab === "TABLES") {
          const [tData, sData, ttData] = await Promise.all([
            getTables(),
            getSpaces(),
            getTableTypes(),
          ]);
          setTables(tData || []);
          setSpaces(sData || []);
          setTableTypes(ttData || []);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (!showTableSelector) return;

    const loadTableData = async () => {
      const [tData, sData, ttData, busyTables] = await Promise.all([
        getTables(),
        getSpaces(),
        getTableTypes(),
        getOccupiedTable(),
      ]);

      setTables(tData);
      setSpaces(sData);
      setTableTypes(ttData);
      setOccupiedTable(busyTables);
      console.log(tData);
      console.log("occupied tables loaded:", busyTables);
    };

    console.log("tableselectoer", tables);
    console.log("tableselsctor", occupiedTable);

    loadTableData();
  }, [showTableSelector]);

  useEffect(() => {
    console.log("Busy tables", occupiedTable);
    console.log("Busy tables", tables);
  }, [occupiedTable, tables]);

  const handleRemoveItem = async (itemId: string) => {
    const success = await deleteOrderItem(itemId);
    if (success) {
      // 1. Refresh all orders from the server
      await fetchData();

      // 2. Update the "selectedOrder" state so the Modal reflects the change
      if (selectedOrder) {
        // We look for the updated version of this order in the fresh orders list
        const updatedOrders = await getOrders(); // Direct call to ensure fresh data
        const refreshedOrder = updatedOrders.find(
          (o: Order) => o.id === selectedOrder.id,
        );

        if (refreshedOrder) {
          setSelectedOrder(refreshedOrder);
        } else {
          setSelectedOrder(null); // Close if order itself is gone
        }
      }
      toast.success("Item removed from order");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const orderTypes: { id: string; name: string }[] = [
    { id: "ALL", name: "All Types" },
    { id: "DINE_IN", name: "Dine In" },
    { id: "TAKE_AWAY", name: "Take Away" },
    { id: "PICKUP", name: "Pickup" },
    { id: "DELIVERY", name: "Delivery" },
    { id: "RESERVATION", name: "Reservation" },
    { id: "QUICK_BILLING", name: "Quick Billing" },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchQuery === "" ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.table?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedOrderType === "ALL" || o.type === selectedOrderType;
    return matchesSearch && matchesType;
  });

  const getFilteredKOTs = () => {
    let kots: { type: "KITCHEN" | "BAR"; order: Order; items: any[] }[] = [];
    orders
      .filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED")
      .forEach((o) => {
        const kitchenItems = o.items.filter(
          (i) => i.dish?.kotType === "KITCHEN",
        );
        const barItems = o.items.filter((i) => i.dish?.kotType === "BAR");
        if (kitchenItems.length > 0)
          kots.push({ type: "KITCHEN", order: o, items: kitchenItems });
        if (barItems.length > 0)
          kots.push({ type: "BAR", order: o, items: barItems });
      });

    if (searchQuery) {
      kots = kots.filter(
        (k) =>
          k.order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.order.table?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter === "ACTIVE") {
      kots = kots.filter((k) =>
        k.items.some((i) => i.status === "PENDING" || i.status === "PREPARING"),
      );
    }

    return kots;
  };

  const groupedTables = spaces
    .map((space) => ({
      ...space,
      tables: tables.filter(
        (t) =>
          t.spaceId === space.id &&
          t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((s) => s.tables.length > 0);

  // Handlers for Order Actions
  const handlePrintOrder = (order: Order) => {
    window.print();
  };

  const handleCopyOrder = (order: Order) => {
    toast.info("Order copying is not yet implemented.");
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) fetchData();
  };

  const handleUpdateItemStatus = async (
    orderItemId: string,
    status: OrderStatus,
  ) => {
    const success = await updateOrderItemStatus(orderItemId, status);
    if (success) fetchData();
  };

  const handleEditItem = async (itemId: string, updatedData: any) => {
    if (!selectedOrder) return;
    const success = await updateOrderItems(selectedOrder.id, [
      { ...updatedData, id: itemId, action: "update" },
    ]);
    if (success) fetchData();
  };

  const handleCreateOrder = async (
    cart: any[],
    guests: number,
    kotRemarks: string,
  ) => {
    if (!activeTable) return;

    const orderData = {
      tableId: activeTable.id === "DIRECT" ? null : activeTable.id,
      type: "DINE_IN", // default or detect from table
      items: cart.map((item) => ({
        dishId: item.dishId,
        comboId: item.comboId,
        quantity: item.quantity,
        addOnIds: (item.addons || []).map((a: any) => a.id),
        remarks: item.remarks,
      })),
    };

    const success = await createOrder(orderData);
    if (success) {
      setActiveTable(null);
      fetchData();
    }
  };

  const handleQuickCheckout = async (order: Order) => {
    const success = await updateOrderStatus(order.id, "COMPLETED");
    if (success) {
      setSelectedOrder(null);
      fetchData();
    }
  };

  const handleAddItemsToOrder = async (
    cart: any[],
    guests: number,
    kotRemarks: string,
  ) => {
    if (!existingOrderForAdding) return;
    const itemsWithAction = cart.map((item) => ({
      dishId: item.dishId,
      comboId: item.comboId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      selectedAddOns: (item.addons || []).map((a: any) => ({
        addOnId: a.id,
        quantity: 1,
        unitPrice: a.price?.listedPrice || 0,
      })),
      action: "add",
    }));

    const success = await updateOrderItems(
      existingOrderForAdding.id,
      itemsWithAction,
    );
    if (success) {
      setExistingOrderForAdding(null);
      fetchData();
    }
  };

  const handleTableClick = (table: Table) => {
    const session = occupiedTable.find((o) => o.tableId === table.id);

    if (session) {
      setQuickMenuTable(table);
    } else {
      // Open table: Show selection modal
      setPendingTable(table);
      setShowOrderTypeSelector(true);
    }
  };

  const handleNewOrder = (type: OrderType) => {
    setNewOrderType(type);
    setShowOrderTypeSelector(false);

    switch (type) {
      case "DINE_IN":
        if (pendingTable) {
          setActiveTable(pendingTable);
          setPendingTable(null);
        } else {
          setShowTableSelector(true);
        }
        break;

      case "RESERVATION":
        setShowReservationForm(true);
        break;

      case "TAKE_AWAY":
      case "PICKUP":
      case "DELIVERY":
      case "QUICK_BILLING":
        setActiveTable({
          id: "DIRECT",
          name: type.replace("_", " "),
          status: "ACTIVE",
          capacity: 0,
          spaceId: "",
          tableTypeId: "",
          createdAt: new Date(),
          sessions: [],
        });
        break;
    }
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 min-h-screen w-[]">
      {/* Header & Toggle */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-normal text-zinc-900 tracking-tight">
              Orders
            </h1>
            <div className="bg-zinc-100 p-1 rounded-lg flex items-center gap-1">
              <button
                onClick={() => setActiveTab("TABLES")}
                className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all ${activeTab === "TABLES" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                Tables
              </button>
              <button
                onClick={() => setActiveTab("KOT")}
                className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all ${activeTab === "KOT" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                KOT
              </button>
              <button
                onClick={() => setActiveTab("ORDERS")}
                className={`px-4 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-widest transition-all ${activeTab === "ORDERS" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                Orders
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:border-red-500 transition-all outline-none font-normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              onClick={() => {
                setPendingTable(null);
                setShowOrderTypeSelector(true);
              }}
              className="bg-red-600 text-black h-10 px-6 uppercase tracking-widest text-[10px]"
            >
              <Plus size={14} className="mr-2" />
              Add New Order
            </Button>

            <Popover
              trigger={
                <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                  <Settings size={20} className="text-zinc-400" />
                </button>
              }
              align="right"
              content={
                <div className="w-52 py-2">
                  <div className="px-4 py-2 text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                    Options
                  </div>
                  {[
                    { icon: History, label: "KOT History" },
                    { icon: CalendarDays, label: "Reservation" },
                    { icon: FileText, label: "Invoice Setting" },
                    { icon: Settings, label: "KOT Setting" },
                    { icon: Slash, label: "Cancelled History" },
                    { icon: WifiOff, label: "Offline Orders" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </div>

        {/* Sub-Filters */}
        <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-3">
              Filter by
            </span>
            <div className="flex items-center gap-2">
              {orderTypes.slice(0, 6).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedOrderType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${selectedOrderType === type.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"} w-[150px]`}
                >
                  {type.name}
                </button>
              ))}
              <CustomDropdown
                options={orderTypes.slice(6)}
                value={selectedOrderType}
                onChange={setSelectedOrderType}
                placeholder="More"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mr-3">
            <span className="text-xs font-bold text-zinc-600">
              {activeTab === "ORDERS"
                ? filteredOrders.length
                : activeTab === "TABLES"
                  ? tables.length
                  : getFilteredKOTs().length}{" "}
              Items
            </span>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[60vh]">
        {activeTab === "ORDERS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders
              .filter((i) => i.status !== "COMPLETED")
              .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={setSelectedOrder}
                  onQuickCheckout={handleQuickCheckout}
                  onPrint={handlePrintOrder}
                  onCopy={handleCopyOrder}
                  onAddItems={(o) => setExistingOrderForAdding(o)}
                />
              ))}
          </div>
        )}

        {activeTab === "TABLES" && (
          <div className="space-y-10">
            {groupedTables.map((space) => (
              <div key={space.id} className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
                  <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    Area: <span className="text-zinc-900">{space.name}</span>
                  </h2>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded">
                    {space.tables.length} Tables
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {space.tables.map((table) => {
                    const session = occupiedTable.find(
                      (o) => o.tableId === table.id,
                    );
                    const isOccupied = !!session;
                    const isBilled = false; // logic for billed state if exists

                    return (
                      <div
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`relative group cursor-pointer rounded-xl p-5 border transition-all duration-200 flex flex-col items-center gap-3 ${
                          isBilled
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : isOccupied
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-zinc-100 border-zinc-200 text-zinc-400 hover:border-red-500 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBilled ? "bg-amber-100" : isOccupied ? "bg-emerald-100" : "bg-white border border-zinc-200"}`}
                        >
                          <Users size={18} />
                        </div>
                        <div className="text-center">
                          <h3
                            className={`font-bold text-xs uppercase tracking-tight ${isOccupied || isBilled ? "text-zinc-900" : "text-zinc-600"}`}
                          >
                            {table.name}
                          </h3>
                          <p className="text-[9px] font-bold uppercase opacity-80 mt-0.5 text-zinc-500">
                            {table.capacity} Seats
                          </p>
                        </div>

                        {/* Status Label */}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                            isBilled
                              ? "bg-amber-100 border-amber-200 text-amber-700"
                              : isOccupied
                                ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                                : "bg-white border-zinc-200 text-zinc-500"
                          }`}
                        >
                          {isBilled
                            ? "Billed"
                            : isOccupied
                              ? "Occupied"
                              : "Open"}
                        </span>

                        {/* Hover Clear Action */}
                        {(isOccupied || isBilled) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // logic to clear table
                              console.log("Clear", table.id);
                            }}
                            className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "KOT" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Split View: Kitchen & Bar */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2 border-b-2 border-rose-100 pb-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <ChefHat size={22} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">
                  Kitchen
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredKOTs()
                  .filter((k) => k.type === "KITCHEN")
                  .map((kot, i) => (
                    <KOTCard
                      key={i}
                      order={kot.order}
                      items={kot.items}
                      type="KITCHEN"
                      onUpdateStatus={async (ids, status) => {
                        for (const id of ids)
                          await updateOrderItemStatus(id, status);
                        fetchData();
                      }}
                      onDownload={() => {}}
                      onMove={() => {}}
                    />
                  ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2 border-b-2 border-zinc-100 pb-3">
                <div className="p-2.5 bg-zinc-50 text-zinc-600 rounded-2xl">
                  <Wine size={22} />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase">
                  Bar
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredKOTs()
                  .filter((k) => k.type === "BAR")
                  .map((kot, i) => (
                    <KOTCard
                      key={i}
                      order={kot.order}
                      items={kot.items}
                      type="BAR"
                      onUpdateStatus={async (ids, status) => {
                        for (const id of ids)
                          await updateOrderItemStatus(id, status);
                        fetchData();
                      }}
                      onDownload={() => {}}
                      onMove={() => {}}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Centered Modals */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title=""
        size="5xl"
      >
        {selectedOrder && (
          <OrderDetailView
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
            onUpdateItemStatus={handleUpdateItemStatus}
            onEditItem={handleEditItem}
            onRemoveItem={handleRemoveItem}
            onCheckout={(o) => {
              setSelectedOrder(null);
              setCheckoutOrder(o);
            }}
            onAddMore={(o) => {
              setSelectedOrder(null);
              setExistingOrderForAdding(o);
            }}
            onPrint={handlePrintOrder}
          />
        )}
      </Modal>

      {/* New Order Modal */}
      <Modal
        isOpen={!!activeTable}
        onClose={() => setActiveTable(null)}
        title=""
        size="6xl"
      >
        {activeTable && (
          <TableOrderingSystem
            table={activeTable}
            onClose={() => setActiveTable(null)}
            onConfirm={handleCreateOrder}
            isAddingToExisting={false}
          />
        )}
      </Modal>

      {/* Add to Existing Order Modal */}
      <Modal
        isOpen={!!existingOrderForAdding}
        onClose={() => setExistingOrderForAdding(null)}
        title=""
        size="6xl"
      >
        {existingOrderForAdding && (
          <TableOrderingSystem
            table={existingOrderForAdding.table || undefined}
            onClose={() => setExistingOrderForAdding(null)}
            onConfirm={handleAddItemsToOrder}
            isAddingToExisting={true}
            existingItems={existingOrderForAdding.items}
          />
        )}
      </Modal>

      {/* Checkout Modal */}
      {checkoutOrder && (
        <CheckoutModal
          isOpen={!!checkoutOrder}
          onClose={() => setCheckoutOrder(null)}
          order={checkoutOrder}
          onCheckoutComplete={() => {
            fetchData();
            setCheckoutOrder(null);
          }}
        />
      )}

      {/* Table QuickMenu Modal */}
      <Modal
        isOpen={!!quickMenuTable}
        onClose={() => setQuickMenuTable(null)}
        title=""
        size="md"
      >
        {quickMenuTable && (
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                  <Package size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
                    Table {quickMenuTable.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                    Ongoing session
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickMenuTable(null)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(() => {
                const activeOrder = orders.find(
                  (o) =>
                    o.tableId === quickMenuTable.id &&
                    o.status !== "COMPLETED" &&
                    o.status !== "CANCELLED",
                );
                return (
                  <>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                          Current Total
                        </span>
                        <span className="text-2xl font-black text-zinc-900">
                          Rs. {activeOrder?.total.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                          Items
                        </span>
                        <span className="text-sm font-black text-zinc-900">
                          {activeOrder?.items.length || 0} Products
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={() => {
                          if (activeOrder) {
                            setExistingOrderForAdding(activeOrder);
                          } else {
                            // Fallback if no order found but session active
                            setActiveTable(quickMenuTable);
                          }
                          setQuickMenuTable(null);
                        }}
                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <Plus size={18} /> Modify / Add More
                      </Button>

                      <Button
                        onClick={() => {
                          if (activeOrder) {
                            setCheckoutOrder(activeOrder);
                          }
                          setQuickMenuTable(null);
                        }}
                        className="w-full h-14 bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-zinc-200 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                        <CreditCard size={18} /> Direct Checkout
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (activeOrder) {
                            setSelectedOrder(activeOrder);
                          }
                          setQuickMenuTable(null);
                        }}
                        className="w-full h-12 border-zinc-200 text-zinc-600 font-bold text-[10px] uppercase tracking-widest rounded-2xl"
                      >
                        View Order Details
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/*Table Selector */}
      <Modal
        isOpen={showTableSelector}
        onClose={() => setShowTableSelector(false)}
        title="Select Table"
        size="4xl"
      >
        <div className="space-y-6">
          {spaces.map((space) => (
            <div key={space.id}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                {space.name}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tables
                  .filter((t) => t.spaceId === space.id)
                  .map((table) => (
                    <button
                      key={table.id}
                      disabled={occupiedTable.some(
                        (o) =>
                          o.tableId === table.id && table.status === "OCCUPIED",
                      )}
                      onClick={() => {
                        setActiveTable(table);
                        setShowTableSelector(false);
                      }}
                      className="p-4 rounded-lg border bg-white hover:border-red-500 transition-all"
                    >
                      <div className="font-bold text-sm">{table.name}</div>
                      <div className="text-[10px] text-zinc-400">
                        {table.capacity} seats
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Order Type Selector */}
      <Modal
        isOpen={showOrderTypeSelector}
        onClose={() => setShowOrderTypeSelector(false)}
        title="Select Order Type"
        size="md"
      >
        <div className="grid grid-cols-2 gap-4 p-4">
          {[
            { id: "DINE_IN", label: "Dine In", icon: Users },
            { id: "TAKE_AWAY", label: "Take Away", icon: Package },
            { id: "PICKUP", label: "Pickup", icon: Package },
            { id: "DELIVERY", label: "Delivery", icon: Package },
            { id: "RESERVATION", label: "Reservation", icon: CalendarDays },
            { id: "QUICK_BILLING", label: "Quick Billing", icon: FileText },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleNewOrder(type.id as OrderType)}
              className="flex flex-col items-center justify-center p-6 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-red-500 hover:bg-white transition-all gap-3"
            >
              <type.icon size={24} className="text-zinc-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
