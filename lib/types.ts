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

export interface Params {
  id: string;
}

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

// --- Order Module Types (Mock/Frontend) ---

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  status: "PENDING" | "COOKING" | "SERVED" | "CANCELLED";
};

export type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "OPEN" | "CLOSED" | "PAID";
  createdAt: Date;
};
