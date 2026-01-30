import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { favorites } = useFavorites();
  const { language } = useLanguage();
  const { toast } = useToast();

  const favoriteProducts = mockProducts.filter(product => 
    favorites.includes(product.id)
  );

  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart',
      description: `${product.name[language]} ${language === 'ar' ? 'تمت إضافته إلى سلتك' : 'has been added to your cart.'}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="h-9 w-9 text-red-500 fill-red-500" />
            {language === 'ar' ? 'المفضلة' : 'Favorites'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'منتجاتك المفضلة محفوظة هنا'
              : 'Your favorite products are saved here'
            }
          </p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'لا توجد منتجات مفضلة'
                : 'No favorite products yet'
              }
            </p>
            <Link to="/products">
              <Button size="lg">
                {language === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
