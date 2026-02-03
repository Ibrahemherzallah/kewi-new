// src/pages/Favorites.tsx (or wherever it is)
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { favorites } = useFavorites();        // now favorites = array of full products
  const { language } = useLanguage();
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

  const handleAddToCart = (product: any) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Normalize ID
    const id = product._id || product.id;
    if (!id) {
      console.warn("Product has no id/_id, cannot add to cart", product);
      return;
    }

    // Try to find existing item by whichever id we used before
    const existingItem = existingCart.find(
        (item: any) =>
            item.id === id || item._id === id // support old shape too
    );

    // Normalize name for cart
    let name = product.name;
    if (typeof name === "string") {
      name = { en: name, ar: name };
    } else {
      // ensure both languages exist as much as possible
      name = {
        en: name?.en || name?.ar || Object.values(name || {})[0] || "",
        ar: name?.ar || name?.en || Object.values(name || {})[0] || "",
      };
    }

    // Normalize images
    const rawImages = product.images ?? product.image ?? [];
    const images: string[] = Array.isArray(rawImages)
        ? rawImages
        : rawImages
            ? [rawImages]
            : [];

    const retailPrice =
        product.retailPrice ??
        product.customerPrice ??
        product.costPrice ??
        0;

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      existingCart.push({
        id,            // standardize on id for new items
        name,
        retailPrice,
        images,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));

    const displayName = getDisplayName(product);

    toast({
      title: language === "ar" ? "تمت الإضافة للسلة" : "Added to cart",
      description:
          displayName +
          " " +
          (language === "ar"
              ? "تمت إضافته إلى سلتك"
              : "has been added to your cart."),
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
              {language === "ar" ? "المفضلة" : "Favorites"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar"
                  ? "منتجاتك المفضلة محفوظة هنا"
                  : "Your favorite products are saved here"}
            </p>
          </div>

          {favoriteProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-6">
                  {language === "ar"
                      ? "لا توجد منتجات مفضلة"
                      : "No favorite products yet"}
                </p>
                <Link to="/products">
                  <Button size="lg">
                    {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
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
