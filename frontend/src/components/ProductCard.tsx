import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: any;
    showWholesale?: boolean; // (still here but we’ll mostly use role)
    onAddToCart?: (product: any) => void;
}

export const ProductCard = ({product, showWholesale = false, onAddToCart,}: ProductCardProps) => {
    const { language } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();

    // --------- NORMALIZATION HELPERS ----------

    // id to use for URL / favorites
    const productId: string = product.id || (product as any)._id || "";
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

    // PRICES (based on your data fields)
    const customerPrice: number =
        product.customerPrice ?? product.retailPrice ?? product.costPrice ?? 0;

    const wholesalerPrice: number =
        product.wholesalerPrice ?? product.wholesalePrice ?? customerPrice;

    const salePrice: number | null = product.salePrice ?? null;

    // stock: either stockNumber or warehouse+kewi
    const totalStock: number =
        product.stockNumber ??
        (product.warehouseQty ?? 0) + (product.kewiQty ?? 0);

    const isOnSale: boolean = Boolean(product.isOnSale);
    const isSoldOut: boolean = Boolean(product.isSoldOut) || totalStock <= 0;
    console.log("sssssssssssssssssss product is : , " , product)

    // brand: string or nested object
    const brandLabel: string =
        typeof product.brand === "string"
            ? product.brand
            : product.brand?.name || "";

    const name = getName();
    const description = getDescription();

    // ---------- USER ROLE (wholesaler or not) ----------
    const role =
        typeof window !== "undefined"
            ? localStorage.getItem("userRole")
            : null;
    const isWholesalerUser = role === "wholesaler";

    // ---------- PRICE DISPLAY LOGIC ----------
    let mainPrice = customerPrice;
    let secondaryPrice: number | null = null;
    let mainLabel: string | null = null;

    if (isWholesalerUser) {
        // wholesaler user: show wholesale clear, customer with line-through
        mainPrice = wholesalerPrice;
        secondaryPrice = customerPrice;
        mainLabel = language === "ar" ? "سعر الجملة" : "Wholesale";
    } else if (isOnSale && salePrice != null) {
        // normal user, product on sale
        mainPrice = salePrice;
        secondaryPrice = customerPrice;
        mainLabel = language === "ar" ? "سعر العرض" : "Sale price";
    } else {
        // normal price
        mainPrice = customerPrice;
        secondaryPrice = null;
        mainLabel = null;
    }

    const isFav = isFavorite(mongoId);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!productId) return;
        // store full product in favorites
        toggleFavorite(product);
    };

    const canAddToCart = !isSoldOut && totalStock > 0;

    return (
        <div
            className={cn(
                "group product-card-hover bg-card rounded-2xl overflow-hidden border border-border shadow-soft relative",
                isSoldOut && "opacity-80"
            )}
        >
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

            {/* SALE / SOLD OUT BADGES */}
            {isOnSale && !isSoldOut && (
                <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white">
                    {language === "ar" ? "عرض" : "Sale"}
                </Badge>
            )}
            {isSoldOut && (
                <Badge className="absolute top-3 left-3 z-10 bg-gray-700 text-white">
                    {language === "ar" ? "نفذت الكمية" : "Sold out"}
                </Badge>
            )}

            <Link to={`/product/${mongoId ? mongoId : productId}`}>
                <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center relative">
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

                    {isSoldOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-lg">
                            {language === "ar" ? "غير متوفر" : "Unavailable"}
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Link
                        to={`/product/${mongoId ? mongoId : productId}`}
                        className="flex-1"
                    >
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
                            variant={
                                isSoldOut
                                    ? "destructive"
                                    : totalStock > 50
                                        ? "default"
                                        : "destructive"
                            }
                            className="text-xs"
                        >
                            {isSoldOut
                                ? language === "ar"
                                    ? "غير متوفر"
                                    : "Out of stock"
                                : `${totalStock} ${
                                    language === "ar" ? "متوفر" : "in stock"
                                }`}
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
                            {mainPrice.toFixed(2)} ₪
                        </div>

                        {secondaryPrice != null && secondaryPrice !== mainPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                                {secondaryPrice.toFixed(2)} ₪
                            </div>
                        )}

                        {mainLabel && (
                            <div className="text-xs text-muted-foreground">
                                {mainLabel}
                            </div>
                        )}
                    </div>

                    <Button
                        size="icon"
                        className={cn(
                            "btn-scale bg-primary hover:bg-primary/90",
                            !canAddToCart && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => canAddToCart && onAddToCart?.(product)}
                        disabled={!canAddToCart}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
