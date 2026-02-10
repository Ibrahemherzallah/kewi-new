// src/pages/Products.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PRODUCTS_API = `${API_BASE}/admin/products`;
const CATEGORIES_API = `${API_BASE}/admin/categories`;

type ApiProduct = {
  _id: string;
  id?: string;              // your internal ID
  name: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  image?: string[];
  categoryId?: any;         // can be string or populated object
  customerPrice?: number;
  wholesalerPrice?: number;
  stockNumber?: number;
};
type BackendProduct = {
  _id: string;
  id?: string; // your internal code "9999" etc.
  name?: string | { en: string; ar: string };
  description?: string | { en: string; ar: string };
  image?: string[];     // from DB
  images?: string[];    // in case some endpoints use this
  stockNumber?: number;
  customerPrice?: number;
  wholesalerPrice?: number;
  isMultiColor? : boolean;
  salePrice?: number;
  isOnSale?: boolean;
  isSoldOut?: boolean;
  gender?: string;
  size?: string;
  color?: string;
  brand?: string | { name: string };
};

type Category = {
  _id: string;
  name: string;
  image?: string;
};

const Products = () => {
  const { toast } = useToast();
  const { t,language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- helpers for localization ----
  const getLocalizedName = (p: ApiProduct): string => {
    if (!p.name) return "";
    if (typeof p.name === "string") return p.name;
    return (
        p.name[language] ||
        p.name["en"] ||
        Object.values(p.name)[0] ||
        ""
    );
  };

  const getLocalizedDescription = (p: ApiProduct): string => {
    if (!p.description) return "";
    if (typeof p.description === "string") return p.description;
    return (
        p.description[language] ||
        p.description["en"] ||
        Object.values(p.description)[0] ||
        ""
    );
  };

  // ---- fetch products + categories from backend ----
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [prodRes, catRes] = await Promise.all([
          fetch(PRODUCTS_API),
          fetch(CATEGORIES_API),
        ]);

        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const productsData: ApiProduct[] = await prodRes.json();
        setProducts(productsData);

        if (catRes.ok) {
          const categoriesData: Category[] = await catRes.json();
          setCategories(categoriesData);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---- filter products by search + (optional) selectedCategoryId ----
  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();

    const name = getLocalizedName(product).toLowerCase();
    const desc = getLocalizedDescription(product).toLowerCase();
    const internalId = (product.id || "").toLowerCase();

    const matchesSearch =
        name.includes(q) || desc.includes(q) || internalId.includes(q);

    const matchesCategory =
        !selectedCategoryId
            ? true
            : typeof product.categoryId === "object"
                ? product.categoryId?._id === selectedCategoryId
                : product.categoryId === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });
  const getProductName = (product: BackendProduct, language: string) => {
    if (!product.name) return language === "ar" ? "منتج بدون اسم" : "Unnamed product";
    if (typeof product.name === "string") return product.name;

    return (
        product.name[language] ||
        product.name.en ||
        Object.values(product.name)[0] ||
        ""
    );
  };

  // ---- cart handler ----
  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // 🟦 1) Auto-select variant if multi color
    const isMulti = product.isMultiColor && Array.isArray(product.variants);
    console.log("isMulti is :" , isMulti)
    const selectedVariant = isMulti && product.variants.length > 0
        ? product.variants[0]          // 👈 first variant by default
        : null;
    console.log("isMulti selectedVariant is :" , selectedVariant)

    // 🟦 2) Choose correct images
    const variantImage = selectedVariant?.image ? [selectedVariant.image] : [];

    const fallbackImages =
        // some products use `images`, some `image`
        (Array.isArray((product as any).images) && (product as any).images.length > 0)
            ? (product as any).images
            : (Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []));

    const images = variantImage.length > 0 ? variantImage : fallbackImages;

    // 🟦 3) Composite id (per color) – same pattern as ProductDetails
    const compositeId = selectedVariant
        ? `${product._id}-${selectedVariant._id}`
        : product._id;

    // 🟦 4) Find existing item by composite id
    const existingItem = cart.find((item: any) => item.id === compositeId);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({
        ...product,
        id: compositeId,           // unique per product+variant
        _id: product._id,          // REAL product id for backend
        quantity: 1,
        images,
        color: selectedVariant?.color || product.color,
        variantId: selectedVariant?._id || null,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    const productName = getProductName(product, language);

    toast({
      title: t("toast.addedToCart"),
      description: `${productName}${
          selectedVariant ? ` (${selectedVariant.color})` : ""
      } ${t("toast.addedDesc")}`,
    });
  };

  // ---- click on category pill: highlight + navigate to category page ----
  const handleCategoryClick = (category: Category) => {
    setSelectedCategoryId(category._id);
    navigate(`/category/${category._id}`); // 👈 route we'll implement next
  };

  return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-12">
          {/* Category Pills (Kohl's style) */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">
                {language === "ar" ? "ما الذي تبحث عنه اليوم؟" : "What are you shopping for today?"}
              </h2>
            </div>

            <div className="w-full overflow-x-auto pb-2">
              <div className="flex gap-6 min-w-max justify-center md:justify-start">
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat)}
                        className="flex flex-col items-center group focus:outline-none"
                    >
                      <div
                          className={[
                            "w-20 h-20 rounded-full overflow-hidden border-2 transition-all duration-300",
                            selectedCategoryId === cat._id
                                ? "border-primary shadow-lg scale-105"
                                : "border-muted-foreground/20 group-hover:border-primary/80 group-hover:shadow-md",
                          ].join(" ")}
                      >
                        {cat.image ? (
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-xs text-muted-foreground">
                              {cat.name}
                            </div>
                        )}
                      </div>
                      <span className="mt-2 text-sm font-medium text-foreground">
                    {cat.name}
                  </span>
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search + heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {language === "ar" ? "جميع المنتجات" : "All Products"}
            </h1>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="text"
                  placeholder={
                    language === "ar" ? "ابحث عن منتجات..." : "Search products..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
            </div>
          </div>

          {error && (
              <p className="text-sm text-destructive mb-4">
                {language === "ar" ? "حدث خطأ أثناء تحميل المنتجات" : error}
              </p>
          )}

          {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}
              </div>
          ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {language === "ar" ? "لم يتم العثور على منتجات" : "No products found"}
                </p>
              </div>
          ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product as any}
                        onAddToCart={handleAddToCart}
                    />
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default Products;
