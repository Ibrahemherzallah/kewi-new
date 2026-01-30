import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CategoryFilter, mockCategories } from "@/components/CategoryFilter";
import { useLanguage } from "@/contexts/LanguageContext";

const Products = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Map category names to filter IDs
  const categoryMapping: Record<string, string> = {
    'Handbags': 'handbags',
    'Travel Bags': 'travel',
    'Backpacks': 'backpacks',
    'Perfumes': 'perfumes',
    'Accessories': 'accessories'
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      categoryMapping[product.category] === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
        {/* Category Filter Cards */}
        <div className="mb-8">
          <CategoryFilter
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
          </h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن منتجات...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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

export default Products;
