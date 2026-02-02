import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  // allow any shape, we’ll normalize inside
  product: any;
  showWholesale?: boolean;
  onAddToCart?: (product: any) => void;
}

export const ProductCard = ({
                              product,
                              showWholesale = false,
                              onAddToCart,
                            }: ProductCardProps) => {
  const { language } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();

  // --------- NORMALIZATION HELPERS ----------

  // id to use for URL / favorites
  const productId: string =
      product.id || "";

  const mongoId = product._id;
  // images: support both `images` and `image`
  const rawImages = product.images ?? product.image ?? [];
  const images: string[] = Array.isArray(rawImages)
      ? rawImages
      : rawImages
          ? [rawImages]
          : [];
  const mainImage = images[0];

  // name: can be string OR { en, ar, ... }
  const getName = (): string => {
    if (!product.name) return "";
    if (typeof product.name === "string") return product.name;
    return (
        product.name[language] ||
        product.name.en ||
        Object.values(product.name)[0] ||
        ""
    );
  };

  // description same idea
  const getDescription = (): string => {
    if (!product.description) return "";
    if (typeof product.description === "string") return product.description;
    return (
        product.description[language] ||
        product.description.en ||
        Object.values(product.description)[0] ||
        ""
    );
  };

  // prices: support mock & DB
  const retailPrice: number =
      product.retailPrice ?? product.customerPrice ?? product.costPrice ?? 0;

  const wholesalePrice: number =
      product.wholesalePrice ?? product.wholesalePrice ?? retailPrice;

  const displayPrice = showWholesale ? wholesalePrice : retailPrice;

  // stock: mock (warehouseQty + kewiQty) OR DB (stockNumber)
  const totalStock: number =
      product.stockNumber ??
      (product.warehouseQty ?? 0) + (product.kewiQty ?? 0);

  // brand: string or nested object
  const brandLabel: string =
      typeof product.brand === "string"
          ? product.brand
          : product.brand?.name || "";

  const name = getName();
  const description = getDescription();

  const isFav = isFavorite(productId);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    toggleFavorite(productId);
  };

  console.log("The product is:", product);

  return (
      <div className="group product-card-hover bg-card rounded-2xl overflow-hidden border border-border shadow-soft relative">
        {/* Favorite Button */}
        <button
            onClick={handleFavoriteClick}
            className={cn(
                "absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-background/80 backdrop-blur-sm hover:bg-background shadow-md",
                isFav && "text-red-500"
            )}
        >
          <Heart
              className={cn(
                  "h-5 w-5 transition-all",
                  isFav
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-red-500"
              )}
          />
        </button>

        <Link to={`/product/${mongoId ? mongoId : productId}`}>
          <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
            {mainImage ? (
                <img
                    src={mainImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <span className="text-xs text-muted-foreground">
              {language === "ar" ? "لا توجد صورة" : "No image"}
            </span>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/product/${mongoId ? mongoId : productId}`} className="flex-1">
              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              {description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {description}
                  </p>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {Number.isFinite(totalStock) && (
                <Badge
                    variant={totalStock > 50 ? "default" : "destructive"}
                    className="text-xs"
                >
                  {totalStock}{" "}
                  {language === "ar" ? "متوفر" : "in stock"}
                </Badge>
            )}
            {brandLabel && (
                <span className="text-xs text-muted-foreground">
              {brandLabel}
            </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-primary">
                {displayPrice.toFixed(2)} ₪
              </div>
              {showWholesale && (
                  <div className="text-xs text-muted-foreground">
                    {language === "ar" ? "التجزئة:" : "Retail:"}{" "}
                    {retailPrice.toFixed(2)} ₪
                  </div>
              )}
            </div>

            <Button
                size="icon"
                className="btn-scale bg-primary hover:bg-primary/90"
                onClick={() => onAddToCart?.(product)}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
  );
};
