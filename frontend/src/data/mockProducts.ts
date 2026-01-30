export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  images: string[];
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  buyCurrency: "USD" | "TRY" | "ILS";
  warehouseQty: number;
  kewiQty: number;
  category: string;
  brand: string;
  properties: Record<string, any>;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    sku: "KW-001",
    barcode: "6291041500213",
    name: {
      en: "Luxury Leather Handbag",
      ar: "حقيبة يد جلدية فاخرة"
    },
    description: {
      en: "Premium genuine leather handbag with elegant design and spacious interior",
      ar: "حقيبة يد من الجلد الطبيعي الفاخر بتصميم أنيق وداخلية واسعة"
    },
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800"
    ],
    costPrice: 45.00,
    retailPrice: 129.99,
    wholesalePrice: 85.00,
    buyCurrency: "USD",
    warehouseQty: 50,
    kewiQty: 15,
    category: "Handbags",
    brand: "Kewi Luxury",
    properties: {
      material: "Genuine Leather",
      color: "Brown",
      size: "Medium"
    }
  },
  {
    id: "2",
    sku: "KW-002",
    barcode: "6291041500220",
    name: {
      en: "Travel Duffle Bag",
      ar: "حقيبة سفر"
    },
    description: {
      en: "Spacious travel bag with multiple compartments, perfect for weekend getaways",
      ar: "حقيبة سفر واسعة مع أقسام متعددة، مثالية لرحلات نهاية الأسبوع"
    },
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
    ],
    costPrice: 35.00,
    retailPrice: 89.99,
    wholesalePrice: 60.00,
    buyCurrency: "USD",
    warehouseQty: 80,
    kewiQty: 25,
    category: "Travel Bags",
    brand: "Voyager",
    properties: {
      material: "Canvas",
      capacity: "45L",
      color: "Navy Blue"
    }
  },
  {
    id: "3",
    sku: "KW-003",
    barcode: "6291041500237",
    name: {
      en: "Modern Backpack",
      ar: "حقيبة ظهر عصرية"
    },
    description: {
      en: "Stylish backpack with laptop compartment and ergonomic design",
      ar: "حقيبة ظهر أنيقة مع قسم للكمبيوتر المحمول وتصميم مريح"
    },
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
    ],
    costPrice: 28.00,
    retailPrice: 69.99,
    wholesalePrice: 45.00,
    buyCurrency: "USD",
    warehouseQty: 100,
    kewiQty: 35,
    category: "Backpacks",
    brand: "Urban Style",
    properties: {
      material: "Nylon",
      laptopSize: "15.6 inch",
      color: "Black"
    }
  },
  {
    id: "4",
    sku: "KW-004",
    barcode: "6291041500244",
    name: {
      en: "Luxury Perfume - Midnight Rose",
      ar: "عطر فاخر - وردة منتصف الليل"
    },
    description: {
      en: "Elegant floral fragrance with notes of rose, jasmine and vanilla",
      ar: "عطر زهري أنيق بنفحات الورد والياسمين والفانيليا"
    },
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
    ],
    costPrice: 25.00,
    retailPrice: 79.99,
    wholesalePrice: 50.00,
    buyCurrency: "USD",
    warehouseQty: 120,
    kewiQty: 40,
    category: "Perfumes",
    brand: "Essence",
    properties: {
      volume: "50ml",
      type: "Eau de Parfum",
      notes: "Floral"
    }
  },
  {
    id: "5",
    sku: "KW-005",
    barcode: "6291041500251",
    name: {
      en: "Designer Sunglasses",
      ar: "نظارات شمسية مصممة"
    },
    description: {
      en: "UV protection sunglasses with stylish frame and premium lenses",
      ar: "نظارات شمسية مع حماية من الأشعة فوق البنفسجية وإطار أنيق وعدسات فاخرة"
    },
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"
    ],
    costPrice: 18.00,
    retailPrice: 49.99,
    wholesalePrice: 32.00,
    buyCurrency: "USD",
    warehouseQty: 90,
    kewiQty: 30,
    category: "Accessories",
    brand: "Vista",
    properties: {
      material: "Metal Frame",
      uvProtection: "UV400",
      color: "Gold"
    }
  },
  {
    id: "6",
    sku: "KW-006",
    barcode: "6291041500268",
    name: {
      en: "Leather Wallet",
      ar: "محفظة جلدية"
    },
    description: {
      en: "Slim leather wallet with RFID protection and multiple card slots",
      ar: "محفظة جلدية نحيفة مع حماية RFID وفتحات متعددة للبطاقات"
    },
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"
    ],
    costPrice: 12.00,
    retailPrice: 34.99,
    wholesalePrice: 22.00,
    buyCurrency: "USD",
    warehouseQty: 150,
    kewiQty: 50,
    category: "Accessories",
    brand: "Kewi Essentials",
    properties: {
      material: "Leather",
      rfid: "Yes",
      color: "Brown"
    }
  }
];

export const getProduct = (id: string) => mockProducts.find(p => p.id === id);
export const getProductByBarcode = (barcode: string) => mockProducts.find(p => p.barcode === barcode);
