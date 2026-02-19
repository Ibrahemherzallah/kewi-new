// src/pages/ProductDetail.tsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingCart, ArrowLeft, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PRODUCT_API = (id: string) => `${API_BASE}/admin/products/${id}`;
const CATEGORY_PRODUCTS_API = (id: string) =>
    `${API_BASE}/admin/products/category/${id}`;

type ApiProduct = {
  _id: string;
  id?: string; // internal display ID
  name: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  image?: string[] | string;
  images?: string[]; // just in case some endpoint returns this
  categoryId?: any;
  brandId?: any;
  customerPrice?: number;
  wholesalerPrice?: number;
  salePrice?: number | null;
  stockNumber?: number;
  barcode?: string;
  properties?: Record<string, string>;
  isSoldOut?: boolean;
  isOnSale?: boolean;
  isSoon?: boolean;
  isMultiColor?: boolean;
  variants?: any;
};

const ProductDetail = () => {
  const params = useParams();
  const productId = (params.id as string) || (params.productId as string) || "";

  const { toast } = useToast();
  const { language } = useLanguage();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // ---------- HELPERS FOR LOCALIZED FIELDS ----------

  const getLocalizedName = (p: ApiProduct | null): string => {
    if (!p || !p.name) return "";
    if (typeof p.name === "string") return p.name;
    return (
        p.name[language] ||
        p.name["en"] ||
        Object.values(p.name)[0] ||
        ""
    );
  };

  const getLocalizedDescription = (p: ApiProduct | null): string => {
    if (!p || !p.description) return "";
    if (typeof p.description === "string") return p.description;
    return (
        p.description[language] ||
        p.description["en"] ||
        Object.values(p.description)[0] ||
        ""
    );
  };

  const getBrandName = (p: ApiProduct | null): string => {
    if (!p || !p.brandId) return "—";
    if (typeof p.brandId === "object") {
      return p.brandId.name || "—";
    }
    return String(p.brandId);
  };

  const getCategoryName = (p: ApiProduct | null): string => {
    if (!p || !p.categoryId) return "—";
    if (typeof p.categoryId === "object") {
      return p.categoryId.name || "—";
    }
    return String(p.categoryId);
  };

  // images array safe helper (supports image | images)
  const getImages = (p: ApiProduct | null): string[] => {
    if (!p) return [];
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      return p.images;
    }
    if (!p.image) return [];
    if (Array.isArray(p.image)) return p.image;
    return [p.image];
  };

  // ---------- FETCH PRODUCT + RELATED ----------

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Get main product
        const res = await fetch(PRODUCT_API(productId));
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        const prod: ApiProduct = await res.json();
        setProduct(prod);

        // 2) Get related products (same category)
        const catId =
            typeof prod.categoryId === "object"
                ? prod.categoryId?._id
                : prod.categoryId;

        if (catId) {
          const relRes = await fetch(CATEGORY_PRODUCTS_API(catId));
          if (relRes.ok) {
            const rel: ApiProduct[] = await relRes.json();
            const filtered = (rel || [])
                .filter((p) => p._id !== prod._id)
                .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const displayName = getLocalizedName(product);
  const displayDescription = getLocalizedDescription(product);

  const barcode = product?.barcode || product?.id || product?._id;

  // ---------- MULTI-COLOR LOGIC ----------
  const isMulti = product?.isMultiColor && Array.isArray(product?.variants);
  const variants = isMulti ? product!.variants : [];

  const activeVariant = isMulti ? variants[selectedVariantIndex] : null;

  // Main images come from variant OR regular product images
  const variantImages = activeVariant?.image ? [activeVariant.image] : [];
  const images = isMulti ? variantImages : getImages(product);

  // Stock number: if variant → use its stock
  const totalStock = isMulti
      ? activeVariant?.stockNumber ?? 0
      : product?.stockNumber ?? 0;

  const isSoldOut = Boolean(product?.isSoldOut) || totalStock <= 0;
  const isOnSale = Boolean(product?.isOnSale);




  // Badges text
  const badgeEn = isSoldOut ? 'sold out' : product?.isSoldOut
      ? "sold out"
      : product?.isOnSale
          ? "on sale"
          : product?.isSoon
              ? "coming soon"
              : "available";

  const badgeAr = isSoldOut ? 'نفذ' : product?.isSoldOut
      ? "نفذ"
      : product?.isOnSale
          ? "معروض للبيع"
          : product?.isSoon
              ? "قريباً"
              : "متوفر";





  console.log("isSoldOut is : " , isSoldOut)
  // ---------- PRICE LOGIC (UNIFIED WITH ProductCard) ----------

  const role =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isWholesalerUser = role === "wholesaler";

  const customerPrice: number = product?.customerPrice ?? 0;
  const wholesalerPrice: number =
      product?.wholesalerPrice ?? customerPrice;
  const salePrice: number | null = product?.salePrice ?? null;

  let mainPrice = customerPrice;
  let oldPrice: number | null = null;
  let priceLabel: string | null = null;

  if (isWholesalerUser) {
    mainPrice = wholesalerPrice;
    oldPrice = customerPrice;
    priceLabel = language === "ar" ? "سعر الجملة" : "Wholesale price";
  } else if (isOnSale && salePrice != null) {
    mainPrice = salePrice;
    oldPrice = customerPrice;
    priceLabel = language === "ar" ? "سعر العرض" : "Sale price";
  } else {
    mainPrice = customerPrice;
    oldPrice = null;
    priceLabel = null;
  }

  // ---------- CART HANDLER (store full backend object) ----------

  const handleAddToCart = (prod?: ApiProduct) => {
    const productToAdd = prod || product;
    if (!productToAdd) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // 🟦 1) Detect selected variant (color)
    const selectedVariant = isMulti && variants.length > 0
        ? variants[selectedVariantIndex]
        : null;

    // If product has multiple colors, force the user to choose one
    if (isMulti && !selectedVariant) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
            language === "ar"
                ? "الرجاء اختيار اللون قبل الإضافة إلى السلة"
                : "Please choose a color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    // 🟦 2) Choose the correct images
    const variantImage = selectedVariant?.image
        ? [selectedVariant.image]
        : [];

    const fallbackImages =
        productToAdd.images?.length > 0
            ? productToAdd.images
            : productToAdd.image || [];

    const images = variantImage.length > 0 ? variantImage : fallbackImages;

    // 🟦 3) Composite cart ID (unique per color)
    const compositeId = selectedVariant
        ? `${productToAdd._id}-${selectedVariant._id}`
        : productToAdd._id;

    // 🟦 4) Quantity logic
    const qty = prod ? 1 : quantity;

    // 🟦 5) Check if this exact color is already in cart
    const existingItem = cart.find((item: any) => item.id === compositeId);

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        ...productToAdd,
        id: compositeId,              // unique per color
        _id: productToAdd._id,        // REAL product ID for backend
        quantity: qty,
        images,
        color: selectedVariant?.color || product?.color,
        variantId: selectedVariant?._id || null,
      });
    }

    // 🟦 6) Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // 🟦 7) Toast confirmation
    toast({
      title: language === "ar" ? "تمت الإضافة" : "Added to cart",
      description: `${qty}x ${getLocalizedName(productToAdd)} ${
          selectedVariant
              ? `(${selectedVariant.color})`
              : ""
      } ${
          language === "ar"
              ? "تمت إضافته إلى السلة"
              : "added to your cart."
      }`,
    });
  };

  // ---------- RENDERING ----------

  if (loading) {
    return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
            {language === "ar" ? "جاري تحميل المنتج..." : "Loading product..."}
          </div>
        </div>
    );
  }

  if (!product || error) {
    return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">
              {language === "ar" ? "المنتج غير موجود" : "Product not found"}
            </h1>
            {error && (
                <p className="text-sm text-destructive mb-4">{error}</p>
            )}
            <Link to="/products">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === "ar" ? "العودة للمنتجات" : "Back to Products"}
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-12">
          <Link to="/products">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "ar" ? "العودة للمنتجات" : "Back to Products"}
            </Button>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center relative">
                {images.length > 0 ? (
                    <img
                        src={images[selectedImage]}
                        alt={displayName || "Product image"}
                        className={`${isSoldOut ?? `opacity-30` } w-full h-full object-cover`}
                    />
                ) : (
                    <span className="text-muted-foreground text-sm">
                  No image
                </span>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-lg">
                      {language === "ar" ? "غير متوفر" : "Unavailable"}
                    </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                  <div className="flex gap-4">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImage === index
                                    ? "border-primary"
                                    : "border-border"
                            }`}
                        >
                          <img
                              src={image}
                              alt={`${displayName} ${index + 1}`}
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
                <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
                <p className="text-muted-foreground text-lg">
                  {displayDescription}
                </p>
              </div>

              {isMulti && variants.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {language === "ar"
                          ? "الألوان المتوفرة"
                          : "Available Colors"}
                    </div>

                    <div className="flex gap-3">
                      {variants.map((variant: any, index: number) => (
                          <button
                              key={index}
                              onClick={() => {
                                setSelectedVariantIndex(index);
                                setSelectedImage(0); // reset main image
                              }}
                              className={`w-10 h-10 rounded-full border cursor-pointer
                        overflow-hidden flex items-center justify-center
                        transition-all
                        ${
                                  selectedVariantIndex === index
                                      ? "border-primary scale-110"
                                      : "border-gray-300"
                              }`}
                              title={variant.color}
                          >
                            {variant.image ? (
                                <img
                                    src={variant.image}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs">{variant.color}</span>
                            )}
                          </button>
                      ))}
                    </div>
                  </div>
              )}

              <div className="flex items-center gap-3">
                <Badge variant={totalStock > 0 ? "default" : "destructive"}>
                  {language === "ar" ? badgeAr : badgeEn}
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Barcode className="h-3 w-3" />
                  {barcode}
                </Badge>
              </div>

              {/* Price block – unified with ProductCard */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-2">
                <div className="text-sm text-muted-foreground">
                  {language === "ar" ? "السعر" : "Price"}
                </div>
                <div className="text-4xl font-bold text-primary">
                  {mainPrice.toFixed(2)} ₪
                </div>
                {oldPrice != null && oldPrice !== mainPrice && (
                    <div className="text-lg text-muted-foreground line-through">
                      {oldPrice.toFixed(2)} ₪
                    </div>
                )}
                {priceLabel && (
                    <div className="text-xs text-muted-foreground">
                      {priceLabel}
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-card border border-border rounded-xl">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === "ar" ? "الماركة" : "Brand"}
                  </div>
                  <div className="font-semibold">{getBrandName(product)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === "ar" ? "التصنيف" : "Category"}
                  </div>
                  <div className="font-semibold">{getCategoryName(product)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === "ar" ? "المعرف الداخلي" : "Internal ID"}
                  </div>
                  <div className="font-mono text-sm">
                    {product.id || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {language === "ar" ? "حالة المنتج" : "Product Status"}
                  </div>
                  <div className="text-sm">
                    {language === "ar" ? badgeAr : badgeEn}
                  </div>
                </div>
              </div>

              {product.properties &&
                  Object.keys(product.properties).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">
                          {language === "ar"
                              ? "الخصائص"
                              : "Properties"}
                        </h3>
                        <div className="grid gap-2">
                          {Object.entries(product.properties).map(
                              ([key, value]) => (
                                  <div
                                      key={key}
                                      className="flex justify-between p-3 bg-muted/30 rounded-lg"
                                  >
                          <span className="text-muted-foreground capitalize">
                            {key}
                          </span>
                                    <span className="font-medium">{value}</span>
                                  </div>
                              )
                          )}
                        </div>
                      </div>
                  )}

              <div className="flex gap-4 items-center pt-6">
                <div className="flex items-center gap-3">
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                      }
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                          setQuantity((q) =>
                              totalStock > 0 ? Math.min(totalStock, q + 1) : q + 1
                          )
                      }
                  >
                    +
                  </Button>
                </div>

                <Button
                    size="lg"
                    className="flex-1 btn-scale bg-primary hover:bg-primary/90"
                    onClick={() => handleAddToCart()}
                    disabled={isSoldOut}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
              <section className="mt-20">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold">
                    {language === "ar"
                        ? "منتجات ذات صلة"
                        : "Related Products"}
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((prod) => (
                      <ProductCard
                          key={prod._id}
                          product={prod as any}
                          onAddToCart={() => handleAddToCart(prod)}
                      />
                  ))}
                </div>
              </section>
          )}

          <Footer />
        </div>
      </div>
  );
};

export default ProductDetail;
