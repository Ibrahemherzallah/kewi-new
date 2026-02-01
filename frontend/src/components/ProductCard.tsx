import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/data/mockProducts";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showWholesale?: boolean;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, showWholesale = false, onAddToCart }: ProductCardProps) => {
  const displayPrice = showWholesale ? product.wholesalePrice : product.retailPrice;
  const totalStock = product.warehouseQty + product.kewiQty;
  const { t, language } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const isFav = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  console.log("The language is : " ,language)
  console.log("The product is : " ,product)
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
            isFav ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
          )} 
        />
      </button>

      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name[language]}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {product.name[language]}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description[language]}
            </p>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={totalStock > 50 ? "default" : "destructive"} className="text-xs">
            {totalStock} {language === 'ar' ? 'متوفر' : 'in stock'}
          </Badge>
          <span className="text-xs text-muted-foreground">{product.brand}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="text-2xl font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </div>
            {showWholesale && (
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? 'التجزئة:' : 'Retail:'} ${product.retailPrice.toFixed(2)}
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
