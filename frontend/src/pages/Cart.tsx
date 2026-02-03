import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Gift, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CartItem {
  id?: string;
  _id?: string;
  name: any; // can be string or { en, ar, ... }
  retailPrice: number;
  quantity: number;
  images: string[];
}

const Cart = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { points, getDiscount, redeemFreeProduct, canRedeemFreeProduct } = useLoyalty();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [freeProductId, setFreeProductId] = useState<string | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const discount = getDiscount();

  // Helpers
  const getItemId = (item: CartItem): string => item.id || item._id || "";

  const getItemName = (item: CartItem): string => {
    if (!item.name) return "";
    if (typeof item.name === "string") return item.name;
    return (
        item.name[language] ||
        item.name.en ||
        item.name.ar ||
        Object.values(item.name)[0] ||
        ""
    );
  };

  useEffect(() => {
    const loadCart = () => {
      const raw = localStorage.getItem("cart") || "[]";
      const savedCart = JSON.parse(raw);

      const normalized: CartItem[] = (savedCart as any[]).map((item) => {
        const rawImages = item.images ?? item.image ?? [];
        const images = Array.isArray(rawImages)
            ? rawImages
            : rawImages
                ? [rawImages]
                : [];

        return {
          ...item,
          images,
          quantity: item.quantity || 1,
        };
      });

      setCart(normalized);
    };

    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateQuantity = (targetId: string, delta: number) => {
    const newCart = cart.map((item) => {
      const id = getItemId(item);
      if (id === targetId) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    updateCart(newCart);
  };

  const removeItem = (targetId: string) => {
    if (freeProductId === targetId) {
      setFreeProductId(null);
    }
    updateCart(cart.filter((item) => getItemId(item) !== targetId));
  };

  const subtotal = cart.reduce(
      (sum, item) => sum + (item.retailPrice || 0) * (item.quantity || 1),
      0
  );

  // Calculate discount amount
  const calculateDiscount = () => {
    if (canRedeemFreeProduct && freeProductId) {
      const freeItem = cart.find((item) => getItemId(item) === freeProductId);
      return freeItem ? freeItem.retailPrice || 0 : 0;
    }
    if (applyDiscount && discount.percentage > 0) {
      return (subtotal * discount.percentage) / 100;
    }
    return 0;
  };

  const discountAmount = calculateDiscount();
  const total = subtotal - discountAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // If using free product redemption, deduct points
    if (canRedeemFreeProduct && freeProductId) {
      redeemFreeProduct();
    }

    updateCart([]);
    setCheckoutOpen(false);
    setFreeProductId(null);
    setApplyDiscount(false);
    setFormData({ name: "", phone: "", address: "", city: "", notes: "" });
    toast({
      title: t("toast.orderPlaced"),
      description: t("toast.orderDesc"),
    });
  };

  const handleSelectFreeProduct = (productId: string) => {
    setFreeProductId(productId);
    setApplyDiscount(false); // Can't use both
  };

  const handleApplyPercentDiscount = () => {
    setApplyDiscount(true);
    setFreeProductId(null); // Can't use both
  };

  console.log("The cart is L ", cart)
  return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">{t("cart.title")}</h1>

          {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground mb-6">
                  {t("cart.empty")}
                </p>
                <Link to="/products">
                  <Button size="lg">{t("cart.continueShopping")}</Button>
                </Link>
              </div>
          ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const id = getItemId(item);
                    return (
                        <div key={id} className="bg-card border border-border rounded-2xl p-6 flex gap-4 relative">
                          {freeProductId === id && (
                              <Badge className="absolute top-2 left-2 bg-primary">
                                <Gift className="h-3 w-3 mr-1" />
                                {language === "ar" ? "مجاني!" : "FREE!"}
                              </Badge>
                          )}
                          <img
                              src={item.images?.[0]}
                              alt={getItemName(item)}
                              className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {getItemName(item)}
                            </h3>
                            <p className="text-primary font-bold">
                              {freeProductId === id ? (
                                  <span className="line-through text-muted-foreground">
                            ${item?.retailPrice?.toFixed(2)}
                          </span>
                              ) : (
                                  `$${item?.retailPrice?.toFixed(2)}`
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => updateQuantity(id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(id)}
                              className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                    );
                  })}
                </div>

                <div className="lg:col-span-1 space-y-4">
                  {/* Loyalty Points Banner */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span className="font-semibold">
                    {language === "ar" ? "نقاط الولاء" : "Loyalty Points"}
                  </span>
                      <Badge variant="secondary">{points} pts</Badge>
                    </div>

                    {/* Free Product Option */}
                    {canRedeemFreeProduct && (
                        <div className="mb-3 p-3 bg-background/60 rounded-lg">
                          <p className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Gift className="h-4 w-4 text-primary" />
                            {language === "ar"
                                ? "اختر منتج مجاني (100 نقطة)"
                                : "Choose a free product (100 pts)"}
                          </p>
                          <RadioGroup
                              value={freeProductId || ""}
                              onValueChange={handleSelectFreeProduct}
                          >
                            {cart.map((item) => {
                              const id = getItemId(item);
                              return (
                                  <div key={id} className="flex items-center space-x-2">
                                    <RadioGroupItem value={id} id={`free-${id}`} />
                                    <Label
                                        htmlFor={`free-${id}`}
                                        className="text-sm cursor-pointer"
                                    >
                                      {getItemName(item)} ($
                                      {item.retailPrice.toFixed(2)})
                                    </Label>
                                  </div>
                              );
                            })}
                          </RadioGroup>
                        </div>
                    )}

                    {/* Percentage Discount Option */}
                    {discount.percentage > 0 &&
                        discount.type === "discount" &&
                        !freeProductId && (
                            <div className="p-3 bg-background/60 rounded-lg">
                              <Button
                                  variant={applyDiscount ? "default" : "outline"}
                                  size="sm"
                                  className="w-full"
                                  onClick={handleApplyPercentDiscount}
                              >
                                <Tag className="h-4 w-4 mr-2" />
                                {applyDiscount
                                    ? language === "ar"
                                        ? `تم تطبيق خصم ${discount.percentage}%`
                                        : `${discount.percentage}% discount applied`
                                    : language === "ar"
                                        ? `تطبيق خصم ${discount.percentage}%`
                                        : `Apply ${discount.percentage}% discount`}
                              </Button>
                            </div>
                        )}

                    {discount.type === "none" && (
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                              ? "اجمع 20 نقطة للحصول على خصم 20%"
                              : "Collect 20 points to get 20% off"}
                        </p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                    <h2 className="text-2xl font-bold mb-6">{t("cart.total")}</h2>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("cart.subtotal")}</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>

                      {discountAmount > 0 && (
                          <div className="flex justify-between text-primary">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {freeProductId
                            ? language === "ar"
                                ? "منتج مجاني"
                                : "Free product"
                            : language === "ar"
                                ? `خصم ${discount.percentage}%`
                                : `${discount.percentage}% discount`}
                      </span>
                            <span>- ${discountAmount.toFixed(2)}</span>
                          </div>
                      )}

                      <div className="border-t border-border pt-3 flex justify-between text-xl font-bold">
                        <span>{t("cart.total")}</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={() => setCheckoutOpen(true)}
                    >
                      {t("cart.checkout")}
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Checkout dialog stays the same, only using `total` + `discountAmount` */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("checkout.title")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* form fields unchanged ... */}
              {/* ... */}
              {discountAmount > 0 && (
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      {freeProductId
                          ? language === "ar"
                              ? "يتضمن منتج مجاني!"
                              : "Includes a free product!"
                          : language === "ar"
                              ? `خصم ${discount.percentage}% مطبق`
                              : `${discount.percentage}% discount applied`}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {language === "ar" ? "الإجمالي:" : "Total:"} $
                      {total.toFixed(2)}
                    </p>
                  </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCheckoutOpen(false)}
                    className="flex-1"
                >
                  {t("checkout.cancel")}
                </Button>
                <Button type="submit" className="flex-1">
                  {t("checkout.submit")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default Cart;
