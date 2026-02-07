import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 🔹 API base
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const CATEGORIES_API = `${API_BASE}/admin/categories`;
const PRODUCTS_API = `${API_BASE}/user/products`;

type BackendCategory = {
  _id: string;
  name: string;
  image?: string;
};

// Match your Mongo product as much as possible
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

// 👇 This matches what ProductCard expects (like mockProducts)
type UiProduct = {
  id: string;
  name: { en: string; ar: string };
  images: string[];
  sku: string;
  barcode: string;
  warehouseQty: number;
  kewiQty: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
};

const placeholderImage =
    "https://via.placeholder.com/400x400.png?text=No+Image";

const Home = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch categories + products
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [catRes, prodRes] = await Promise.all([
          fetch(CATEGORIES_API),
          fetch(PRODUCTS_API),
        ]);

        if (catRes.ok) {
          const cats: BackendCategory[] = await catRes.json();
          setCategories(cats);
        }

        if (prodRes.ok) {
          const prods: BackendProduct[] = await prodRes.json();

          // Take first 4 as featured, but keep REAL shape
          const top = (prods || []).slice(0, 4).filter(Boolean);

          setFeaturedProducts(top);
        }
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


// helper to get localized name from backend product
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

  const handleAddToCart = (product: BackendProduct) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // 🟦 1) Auto-select variant if multi color
    const isMulti = product.isMultiColor && Array.isArray(product.variants);
    const selectedVariant = isMulti && product.variants.length > 0
        ? product.variants[0]          // 👈 first variant by default
        : null;

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
        color: selectedVariant?.color || null,
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
  return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={0} />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
          <div className="container mx-auto px-4 py-24 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t("home.hero.title")}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t("home.hero.subtitle")}
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/products">
                  <Button
                      size="lg"
                      className="btn-scale bg-primary hover:bg-primary/90 group"
                  >
                    {t("home.shopNow")}
                    <ArrowRight
                        className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${
                            language === "ar" ? "mr-2 rotate-180" : "ml-2"
                        }`}
                    />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="btn-scale">
                    {t("home.learnMore")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Slider */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t("home.shopNow")}</h2>
            </div>

            {categories.length === 0 && !loading ? (
                <p className="text-center text-muted-foreground">
                  لا توجد تصنيفات متاحة حالياً
                </p>
            ) : (
                <Carousel
                    className="w-full max-w-6xl mx-auto"
                    opts={{ align: "start", loop: true }}
                >
                  <CarouselContent>
                    {categories.map((category) => (
                        <CarouselItem
                            key={category._id}
                            className="md:basis-1/2 lg:basis-1/3"
                        >
                          <Link to={`/category/${category._id}`}>
                            <div className="relative group overflow-hidden rounded-2xl h-80 cursor-pointer">
                              <img
                                  src={category.image || placeholderImage}
                                  alt={category.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                                <h3 className="text-white text-3xl font-bold">
                                  {category.name}
                                </h3>
                              </div>
                            </div>
                          </Link>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious
                      className={language === "ar" ? "left-auto right-12" : "left-12"}
                  />
                  <CarouselNext
                      className={language === "ar" ? "right-auto left-12" : "right-12"}
                  />
                </Carousel>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">{t("home.featured")}</h2>
              <p className="text-muted-foreground text-lg">
                {t("home.featuredDesc")}
              </p>
            </div>

            {featuredProducts.length === 0 && !loading ? (
                <p className="text-center text-muted-foreground">
                  لا توجد منتجات مميزة حالياً
                </p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                      <ProductCard
                          key={product._id || product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                      />
                  ))}
                </div>
            )}

            <div className="text-center mt-12">
              <Link to="/products">
                <Button size="lg" variant="outline" className="btn-scale">
                  {t("home.viewAll")}
                  <ArrowRight
                      className={language === "ar" ? "mr-2 rotate-180" : "ml-2"}
                  />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
  );
};

export default Home;
