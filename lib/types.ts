export type spaceType = {
  id: string;
  name: string;
  description: string;
  tables: Table[];
  createdAt: Date;
};

export type TableType = {
  id: string;
  name: string;
  tables: Table[];
};

export type Table = {
  id: string;
  name: string;
  tableTypeId: string;
  tableType?: TableType | null;
  capacity: number;
  space?: spaceType | null;
  status: "ACTIVE" | "OCCUPIED" | "INACTIVE";
  spaceId?: string | null;
  createdAt: Date;
  qrCode?: QRCode | null;
};

export type QRCode = {
  id: string;
  tableId: string;
  value: string;
  assigned: boolean;
  createdAt: Date;
};

export type Params = Promise<{ id: string }>;

// Menu Module Types

export type Category = {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  dishes?: Dish[];
  combos?: any[]; // Replace with Combo type when defined
  createdAt?: Date;
};

export type Dish = {
  id: string;
  name: string;
  hscode?: string | null;
  image: string[];
  preparationTime: number;
  description?: string | null;
  categoryId: string;
  category?: Category;
  subMenuId?: string | null;
  type: "VEG" | "NON_VEG" | "SNACK" | "DRINK";
  kotType: "KITCHEN" | "BAR";
  isAvailable: boolean;
  price?: Price | null;
  stocks?: StockConsumption[];
  createdAt: Date;
};

export type Price = {
  id?: string;
  actualPrice: number;
  discountPrice?: number;
  listedPrice: number;
  cogs: number;
  grossProfit: number;
};

export type Stock = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  amount: number;
};

export type StockConsumption = {
  id?: string;
  stockId: string;
  stock?: Stock;
  quantity: number;
};
// ... (Previous types)

export type SubMenu = {
  id: string;
  name: string;
  image?: string | null;
  isActive: boolean;
  dishes?: Dish[];
  createdAt: Date;
};

export type AddOn = {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  type: "EXTRA" | "ADDON";
  isAvailable: boolean;
  price?: Price | null;
  stocks?: StockConsumption[];
  createdAt: Date;
};

export type MenuSet = {
  id: string;
  name: string;
  service: string;
  isActive: boolean;
  subMenus?: SubMenu[]; // Through implicit relation or fetch
  createdAt: Date;
};

export type ComboOffer = {
  id: string;
  name: string;
  image: string[];
  hscode?: string | null;
  preparationTime: number;
  description?: string | null;
  categoryId: string;
  subMenuId?: string | null;
  kotType: "KITCHEN" | "BAR";
  isAvailable: boolean;
  price?: Price | null;
  stocks?: StockConsumption[];
  items?: {
    dishId: string;
    quantity: number;
    unitPrice: number;
  }[];
  createdAt: Date;
};

export type KOTType = "KITCHEN" | "BAR";

// --- Order Module Types ---

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READYTOPICK"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";
export type OrderType =
  | "DINE_IN"
  | "PICKUP"
  | "DELIVERY"
  | "RESERVATION"
  | "QUICK_BILLING"
  | "TAKE_AWAY";

export type OrderItem = {
  id: string;
  orderId: string;
  dishId?: string | null;
  dish?: Dish | null;
  comboId?: string | null;
  combo?: ComboOffer | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedAddOns?: OrderItemAddOn[];
  status?: OrderStatus; // Added for per-item status tracking if needed
  remarks?: string;
};

export type OrderItemAddOn = {
  id: string;
  orderItemId: string;
  addOnId: string;
  addOn: AddOn;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  tableId?: string | null;
  table?: Table | null;
  customerId?: string | null;
  customer?: Customer | null;
  items: OrderItem[];
  type: OrderType;
  total: number;
  status: OrderStatus;
  createdAt: Date;
};

export type Customer = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  dob?: string;
  loyaltyId?: string;
  openingBalance: number;
  creditLimit?: number;
  creditTermDays?: number;
  loyaltyPoints: number;
  loyaltyDiscount: number;
  legalName?: string;
  taxNumber?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  dueAmount?: number;
};

export type CustomerLedger = {
  id: string;
  customerId: string;
  txnNo: string;
  type:
    | "SALE"
    | "PAYMENT_IN"
    | "PAYMENT_OUT"
    | "RETURN"
    | "ADJUSTMENT"
    | "OPENING_BALANCE";
  amount: number;
  closingBalance: number;
  referenceId?: string;
  remarks?: string;
  createdAt: string;
};
