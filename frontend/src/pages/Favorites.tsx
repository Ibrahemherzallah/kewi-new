import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type BackendProduct = {
  _id: string;
  id?: string;
  name?: string | { en: string; ar: string };
  description?: string | { en: string; ar: string };
  image?: string[];
  images?: string[];
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

const Favorites = () => {
  const { favorites } = useFavorites();
  const { t,language } = useLanguage();
  const { toast } = useToast();

  // Helper: get a nice display name regardless of shape
  const getDisplayName = (product: any): string => {
    if (!product?.name) return "";
    if (typeof product.name === "string") return product.name;
    return (
        product.name[language] ||
        product.name.en ||
        product.name.ar ||
        Object.values(product.name)[0] ||
        ""
    );
  };
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
        color: selectedVariant?.color || product?.color,
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

  const favoriteProducts = favorites as any[];

  return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-9 w-9 text-red-500 fill-red-500" />
              {t('favorites.header')}
            </h1>
            <p className="text-muted-foreground">
              {t('favorites.desc')}
            </p>
          </div>

          {favoriteProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-6">
                  {t('favorites.noFav')}
                </p>
                <Link to="/products">
                  <Button size="lg">
                    {t('favorites.browseProducts')}
                  </Button>
                </Link>
              </div>
          ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteProducts.map((product: any) => {
                  const key = product._id || product.id;
                  return (
                      <ProductCard
                          key={key}
                          product={product}
                          onAddToCart={handleAddToCart}
                      />
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
};

export default Favorites;
