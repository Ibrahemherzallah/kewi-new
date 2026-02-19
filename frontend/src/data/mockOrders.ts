export interface OrderItem {
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  qty: number;
  costPerUnit: number;
  buyPriceUSD: number;
  wholesalePrice: number;
  retailPrice: number;
  images: string[];
  warehouseQty: number;
  kewiQty: number;
}

export interface Order {
  orderId: string;
  supplier: string;
  currency: "USD" | "TRY" | "ILS";
  totalInCurrency: number;
  convertedToUSD: number;
  fixedShekelToUSD: number;
  actualShekelToUSD: number;
  date: string;
  status: "pending" | "received" | "partial" | "transferred" | "completed";
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    orderId: "PO-2025-001",
    supplier: "Mediterranean Imports Ltd",
    currency: "TRY",
    totalInCurrency: 2093.70,
    convertedToUSD: 50.00,
    fixedShekelToUSD: 3.7,
    actualShekelToUSD: 3.85,
    date: "2025-01-15",
    status: "received",
    items: [
      {
        productId: "1",
        sku: "KW-001",
        barcode: "6291041500213",
        name: "Premium Organic Coffee Beans",
        qty: 100,
        costPerUnit: 12.50,
        buyPriceUSD: 12.50,
        wholesalePrice: 18.50,
        retailPrice: 24.99,
        images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800"],
        warehouseQty: 100,
        kewiQty: 0
      }
    ]
  },
  {
    orderId: "PO-2025-002",
    supplier: "Artisan Goods Co",
    currency: "USD",
    totalInCurrency: 450.00,
    convertedToUSD: 450.00,
    fixedShekelToUSD: 3.7,
    actualShekelToUSD: 3.7,
    date: "2025-01-20",
    status: "pending",
    items: [
      {
        productId: "3",
        sku: "KW-003",
        barcode: "6291041500237",
        name: "Handcrafted Ceramic Bowl",
        qty: 50,
        costPerUnit: 15.00,
        buyPriceUSD: 15.00,
        wholesalePrice: 22.00,
        retailPrice: 32.99,
        images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800"],
        warehouseQty: 50,
        kewiQty: 0
      }
    ]
  }
];

export const getOrder = (orderId: string) => mockOrders.find(o => o.orderId === orderId);
