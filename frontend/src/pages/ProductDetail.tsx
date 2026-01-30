import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProduct, mockProducts } from "@/data/mockProducts";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingCart, ArrowLeft, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { language } = useLanguage();
  const product = getProduct(id || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Get related products (same category, exclude current)
  const relatedProducts = product 
    ? mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalStock = product.warehouseQty + product.kewiQty;

  const handleAddToCart = (prod?: any) => {
    const productToAdd = prod || product;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === productToAdd.id);
    
    if (existingItem) {
      existingItem.quantity += prod ? 1 : quantity;
    } else {
      cart.push({ ...productToAdd, quantity: prod ? 1 : quantity });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: language === 'ar' ? 'تمت الإضافة' : 'Added to cart',
      description: `${prod ? 1 : quantity}x ${productToAdd.name[language]} ${language === 'ar' ? 'تمت إضافته إلى السلة' : 'added to your cart.'}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
              <img
                src={product.images[selectedImage]}
                alt={product.name.en}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name.en} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.name.en}</h1>
              <p className="text-muted-foreground text-lg">{product.description.en}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={totalStock > 50 ? "default" : "destructive"}>
                {totalStock} in stock
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Barcode className="h-3 w-3" />
                {product.barcode}
              </Badge>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 space-y-3">
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-4xl font-bold text-primary">
                ${product.retailPrice.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 bg-card border border-border rounded-xl">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Brand</div>
                <div className="font-semibold">{product.brand}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <div className="font-semibold">{product.category}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">SKU</div>
                <div className="font-mono text-sm">{product.sku}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Stock Location</div>
                <div className="text-sm">
                  Warehouse: {product.warehouseQty}<br />
                  Kewi: {product.kewiQty}
                </div>
              </div>
            </div>

            {Object.keys(product.properties).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Properties</h3>
                <div className="grid gap-2">
                  {Object.entries(product.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 items-center pt-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                >
                  +
                </Button>
              </div>
              
              <Button
                size="lg"
                className="flex-1 btn-scale bg-primary hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={totalStock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">
                {language === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={() => handleAddToCart(prod)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
