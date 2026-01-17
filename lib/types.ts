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
