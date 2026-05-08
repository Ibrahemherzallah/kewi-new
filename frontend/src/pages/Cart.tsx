import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {Minus, Plus, Trash2, ShoppingBag, Gift, Star, Tag,} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getProductPrice } from "@/lib/pricing";
import ReCAPTCHA from "react-google-recaptcha";

interface CartItem {
  id?: string;
  _id?: string;
  name: any; // string or { en, ar, ... }
  customerPrice?: number;
  wholesalerPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  costPrice?: number;
  salePrice?: number | null;
  isOnSale?: boolean;
  isSoldOut?: boolean;
  image?: string[] | string;
  images?: string[];
  quantity: number;
  color?: string;
  variantId?: string;
}

interface CheckoutFormData {
  name: string;
  phone: string;
  address: string; // here we'll store region label if needed
  city: string;
  notes: string;
  paymentMethod: string;
}

const FREE_PRODUCT_POINTS_COST = 100;
const Cart = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const getPricesForItem = (item: CartItem) => {
    return getProductPrice(item, language);
  };
  const { points, getDiscount, redeemFreeProduct, canRedeemFreeProduct, spendPoints } = useLoyalty();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [freeProductId, setFreeProductId] = useState<string | null>(null);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [appliedDiscountPercentage, setAppliedDiscountPercentage] = useState<number | null>(null); // 👈 NEW
  const [loading,setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    paymentMethod: "cash",
  });
  const [cities] = useState([
    { name: { ar: "الضفة الغربية", en: "West Bank", he: 'הגדה המערבית' }, region: "w" },
    { name: { ar: "الداخل", en: "48 Territories" , he: '48 טריטוריות'}, region: "d" },
    { name: { ar: "القدس", en: "Jerusalem" , he: 'יְרוּשָׁלַיִם'}, region: "q" },
  ]);
  const [deliveryTypes] = useState([
    {
      name: { ar: "مستعجل", en: "Express" , he: 'אֶקְסְפּרֶס'},
      duration: { ar: "1 - 2 يوم", en: "1 - 2 days", he: '1-2 ימים' }
    },
    {
      name: { ar: "عادي", en: "Standard" , he: 'תֶקֶן'},
      duration: { ar: "3 - 5 يوم", en: "3 - 5 days", he: '3 - 5 ימים' }
    }
  ]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0);
  const [confirmFreeProductOpen, setConfirmFreeProductOpen] = useState(false);
  const [pendingFreeProductId, setPendingFreeProductId] = useState<string | null>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const discount = getDiscount();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const isLoggedIn = !!token;
  const isWholesalerUser = role === "wholesaler";
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  // ---------- HELPERS ----------

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

  const getItemImages = (item: CartItem): string[] => {
    const raw = item.images ?? item.image ?? [];
    if (Array.isArray(raw)) return raw;
    return raw ? [raw] : [];
  };

  // unified price logic

  const [confirmDiscountOpen, setConfirmDiscountOpen] = useState(false);

  // ---------- LOAD CART ----------
  useEffect(() => {
    const paymentSuccess = localStorage.getItem("paymentSuccess");

    if (paymentSuccess === "true") {
      // clear everything
      updateCart([]);
      setCheckoutOpen(false);
      setFreeProductId(null);
      setApplyDiscount(false);
      setFormData({
        name: "",
        phone: "",
        address: "",
        city: "",
        notes: "",
      });
      setSelectedRegion("");
      setSelectedType("");
      setDeliveryPrice(0);

      // remove flag
      localStorage.removeItem("paymentSuccess");
    }
  }, []);

  useEffect(() => {
    const loadCart = () => {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        const saved = JSON.parse(raw);

        const normalized: CartItem[] = (saved as any[]).map((item) => {
          const images = getItemImages(item);
          return {
            ...item,
            images,
            quantity: item.quantity || 1,
          };
        });

        setCart(normalized);
      } catch (e) {
        console.error("Error parsing cart:", e);
        setCart([]);
      }
    };

    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- AUTO-FILL USER DATA WHEN LOGGED IN ----------

  useEffect(() => {
    if (!isLoggedIn) return;

    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const user = JSON.parse(raw);

      setFormData((prev) => ({
        ...prev,
        name: user.username || user.userName || "",
        phone: user.phone || "",
        // requirement (2): address in userdata -> city field
        city: user.address || "",
      }));
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }, [isLoggedIn]);

  // ---------- DELIVERY PRICE LOGIC ----------

  useEffect(() => {
    if (selectedRegion && selectedType) {
      const fast = deliveryTypes[0].name[language]; // express in current lang

      if (selectedRegion === "w") {
        setDeliveryPrice(selectedType === fast ? 20 : 10);
      } else if (selectedRegion === "d") {
        setDeliveryPrice(selectedType === fast ? 70 : 50);
      } else if (selectedRegion === "q") {
        setDeliveryPrice(selectedType === fast ? 30 : 20);
      }
    } else {
      setDeliveryPrice(0);
    }
  }, [selectedRegion, selectedType, language]);


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

  // ---------- TOTALS / DISCOUNT ----------

  const subtotal = cart.reduce((sum, item) => {
    const { mainPrice } = getPricesForItem(item);
    return sum + mainPrice * (item.quantity || 1);
  }, 0);

  const calculateDiscount = () => {
    // Free product case (uses points >= 100)
    if (freeProductId) {
      const freeItem = cart.find((item) => getItemId(item) === freeProductId);
      if (!freeItem) return 0;
      const { mainPrice } = getPricesForItem(freeItem);
      return mainPrice;
    }

    // Percentage discount case: use the FROZEN applied value, not current points
    if (applyDiscount && appliedDiscountPercentage && appliedDiscountPercentage > 0) {
      return (subtotal * appliedDiscountPercentage) / 100;
    }

    return 0;
  };

  const discountAmount = role === 'user' ? calculateDiscount() : 0 ;
  const total = subtotal - discountAmount;
  const grandTotal = total + deliveryPrice;

  // ---------- CHECKOUT ----------
  const normalizeDelivery = (type: string) => {
    if (!type) return "";

    const found = deliveryTypes.find(
        (t) => t.name[language] === type
    );

    // Always return ARABIC value for backend
    return found?.name.ar || type;
  };

  // For each cart item, figure out how many units are available
  const getAvailableStockForItem = (item: any): number => {
    // If this is a multi-color product with variantId, read stock from that variant
    if (item.variantId && Array.isArray(item.variants)) {
      const variant = item.variants.find((v: any) => v._id === item.variantId);
      if (variant && typeof variant.stockNumber === "number") {
        return variant.stockNumber;
      }
    }

    // Fallback: single-color product → stockNumber on the root product
    if (typeof item.stockNumber === "number") {
      return item.stockNumber;
    }

    // If we don't know, treat as 0 to be safe
    return 0;
  };

  const handleCashOnDeliveryCheckout = async (purchaseBody: any, token: string | null, extras: { totalWithoutDelivery: number; totalWithDelivery: number; numOfItems: number; productsPayload: any[]; }) => {
    const { totalWithoutDelivery, totalWithDelivery, numOfItems, productsPayload } = extras;

    // 1) create purchase
    const purchaseRes = await fetch(`${import.meta.env.VITE_ENV}/user/api/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(purchaseBody),
    });

    if (!purchaseRes.ok) {
      const errData = await purchaseRes.json().catch(() => null);
      throw new Error(errData?.message || "فشل في إرسال الطلب");
    }

    // 2) send WhatsApp
    const whatsappBody = {
      cName: formData.name,
      cNumber: formData.phone,
      cAddress: formData.city,
      cCity: formData.address || "",
      notes: formData.notes,
      price: totalWithDelivery,
      totalPrice: totalWithoutDelivery,
      numOfItems,
      delivery: normalizeDelivery(selectedType),
      type: isWholesalerUser ? "تاجر" : "زبون",
      products: productsPayload,
    };

    const waRes = await fetch(`${import.meta.env.VITE_ENV}/user/api/purchase/send-whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(whatsappBody),
    });

    if (!waRes.ok) {
      const waErr = await waRes.json().catch(() => null);
      throw new Error(waErr?.message || "فشل في إرسال رسالة واتساب");
    }

    // 3) Clear + Toast
    updateCart([]);
    setCheckoutOpen(false);
    setFreeProductId(null);
    setApplyDiscount(false);
    setFormData({ name: "", phone: "", address: "", city: "", notes: "" });
    setSelectedRegion("");
    setSelectedType("");
    setDeliveryPrice(0);

    toast({
      title: t("toast.orderPlaced"),
      description: t("toast.orderDesc"),
    });
  };

  const handleVisaCheckout = async ({purchaseBody, totalWithDelivery,}: { purchaseBody: any; totalWithDelivery: number; }) => {
    try {
      // ✅ Save purchase data temporarily
      localStorage.setItem(
          "pendingOrder",
          JSON.stringify(purchaseBody)
      );

      // ✅ Initialize Lahza ONLY
      const res = await fetch(
          `${import.meta.env.VITE_ENV}/user/api/payments/lahza/init`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amountILS: totalWithDelivery,
              email: "",
              mobile: purchaseBody.cNumber,
              ref: crypto.randomUUID(), // temporary reference
              // ✅ ADD THIS
              captchaToken: captchaValue,

            }),
          }
      );

      if (!res.ok) {
        throw new Error("Failed to start payment");
      }

      const data = await res.json();

      if (!data.authorizationUrl) {
        throw new Error("Payment URL not returned");
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      console.error(err);
    }
  };
  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (cart.length === 0) {
      setLoading(false);
      return;
    }

    // 🔎 0) Check stock for each item before doing anything else
    const outOfStockItem = cart.find((item) => {
      const requested = item.quantity || 1;
      const available = getAvailableStockForItem(item);
      return requested > available;
    });

    if (outOfStockItem) {
      const name = getItemName(outOfStockItem);

      toast({
        title: t("toast.err.insufficientStock"),
        description: t("toast.err.insufficientStock.desc", {
          name,
        }),
        variant: "destructive",
      });

      setLoading(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // loyalty free product logic...
      // (keep as is)

      // ✅ productsPayload, numOfItems, totals
      const productsPayload = cart.map((item) => {
        const { mainPrice } = getPricesForItem(item);
        return {
          productId: item._id,
          id: item.id,
          name: getItemName(item),
          quantity: item.quantity || 1,
          color: (item as any).color || "",
          variantId: (item as any).variantId || null,
          price: mainPrice,
          unitPrice: mainPrice,
        };
      });

      const numOfItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const tokenRecaptcha = await recaptchaRef.current?.executeAsync();

      if (!tokenRecaptcha) {
        toast({
          title: t("toast.captchaValue.title"),
          description: t("toast.captchaValue.desc"),
          variant: "destructive",
        });
        return;
      }

      setCaptchaValue(tokenRecaptcha);
      recaptchaRef.current?.reset();
      const totalWithoutDelivery = Number(total.toFixed(2));
      const totalWithDelivery = Number(grandTotal.toFixed(2));

      if (formData.phone.length < 10) {
        toast({
          title: t('toast.err.phoneNotValid'),
          description: t('toast.err.phoneNotValid.desc'),
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      if (!captchaValue) {
        toast({
          title: t("toast.captchaValue.title"),
          description: t("toast.captchaValue.desc"),
          variant: "destructive",
        });
        return;
      }
      if (!acceptedPolicies) {
        toast({
          title: t("toast.acceptedPolicies.title"),
          description: t("toast.acceptedPolicies.desc"),
          variant: "destructive"
        });
        return;
      }
      // Shared purchase body (we might use it differently for each method)
      const purchaseBody = {
        cName: formData.name,
        cNumber: formData.phone,
        cAddress: formData.city,
        cCity: formData.address || "",
        delivery: normalizeDelivery(selectedType),
        notes: formData.notes,
        products: productsPayload,
        totalPrice: totalWithoutDelivery,
        discount: !!(freeProductId || applyDiscount),
        numOfItems,
        paymentMethod: formData.paymentMethod,
        // ✅ ADD THIS
        captchaToken: captchaValue,
      };

      // 🔥 Now branch by payment method:
      if (formData.paymentMethod === "cash") {
        // CASH ON DELIVERY FLOW (keep your existing logic)
        await handleCashOnDeliveryCheckout(purchaseBody, token, {
          totalWithoutDelivery,
          totalWithDelivery,
          numOfItems,
          productsPayload,
        });
      } else if (formData.paymentMethod === "visa") {
        await handleVisaCheckout({
          purchaseBody,
          token,
          totalWithDelivery,
          totalWithoutDelivery,
          numOfItems,
          productsPayload,
        });
      } else {
        toast({
          title: t('toast.err.paymentError'),
          description: t('toast.err.paymentError.desc'),
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error sending order:", err);
      toast({
        title: language === "ar" ? "حدث خطأ" : "Something went wrong",
        description:
            err?.message ||
            (language === "ar"
                ? "حدث خطأ أثناء إرسال الطلب"
                : "An error occurred while sending your order"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSelectFreeProduct = (productId: string) => {
    const pointsCost = FREE_PRODUCT_POINTS_COST;

    if (points < pointsCost) {
      toast({
        title: ('toast.err.notEnoughPoints'),
        description: t("cart.loyaltyPoints.needPointsForFreeProduct", {
          points: pointsCost,
        }),
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: t('toast.err.notLoggedIn'),
        description: t('toast.err.notLoggedIn.desc'),
        variant: "destructive",
      });
      return;
    }

    // ✅ Store temporarily and open modal
    setPendingFreeProductId(productId);
    setConfirmFreeProductOpen(true);
  };
  const handleConfirmFreeProduct = async () => {
    if (!pendingFreeProductId) return;

    const pointsCost = FREE_PRODUCT_POINTS_COST;

    try {
      const res = await fetch(
          `${import.meta.env.VITE_ENV}/user/api/loyalty/redeem-discount`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pointsCost }),
          }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
            errData?.message ||
            (language === "ar"
                ? "فشل في استخدام النقاط"
                : "Failed to use loyalty points")
        );
      }

      // ✅ Deduct locally
      spendPoints(pointsCost);

      // ✅ Apply free product
      setFreeProductId(pendingFreeProductId);
      setApplyDiscount(false);
      setAppliedDiscountPercentage(null);

      setConfirmFreeProductOpen(false);
      setPendingFreeProductId(null);

      toast({
        title: t('toast.suc.doneFreeProduct'),
        description: t("cart.loyaltyPoints.pointsDeducted", {
          points: pointsCost,
        }),
      });
    } catch (err: any) {
      toast({
        title: t('toast.err'),
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const handleApplyPercentDiscountClick = () => {
    setConfirmDiscountOpen(true);
  };

  const handleConfirmDiscountApply = async () => {
    const discountInfo = discount;
    const percentage = discountInfo.percentage;

    // Cost rule: 1 point per 1% discount
    const pointsCost = percentage;

    if (!percentage || percentage <= 0) {
      setConfirmDiscountOpen(false);
      return;
    }

    // Check locally first
    if (points < pointsCost) {
      toast({
        title: t('toast.err.notEnoughPoints'),
        description: t("toast.err.notEnoughPoints.desc", {
          points: pointsCost,
        }),
        variant: "destructive",
      });
      setConfirmDiscountOpen(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast({
          title: t('toast.err.notLoggedIn'),
          description: t('toast.err.notLoggedIn.desc'),
          variant: "destructive",
        });
        setConfirmDiscountOpen(false);
        return;
      }

      const res = await fetch(
          `${import.meta.env.VITE_ENV}/user/api/loyalty/redeem-discount`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pointsCost }),
          }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
            errData?.message || t('toast.err.fieldUsePoints')
        )
      }

      const result = await res.json();

      // 🔹 Update local state (loyalty + applied discount)
      spendPoints(pointsCost);

      setAppliedDiscountPercentage(percentage); // 👈 freeze the value used for this order
      setApplyDiscount(true);
      setFreeProductId(null); // can't combine free product + % discount
      setConfirmDiscountOpen(false);

      toast({
        title: t("toast.suc.doneDiscount"),
        description:
            t("cart.loyaltyPoints.pointsDeducted", {
              points: pointsCost,
            }),
      });
    } catch (err: any) {
      console.error("Error redeeming discount:", err);
      toast({
        title: t("toast.err"),
        description: err?.message ||  t("toast.suc.fieldApplyDiscount"),
        variant: "destructive",
      });
    }
  };

  // ---------- RENDER ----------

  return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cart.length} />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">{t("cart.title")}</h1>

          {/* Guest banner */}
          {!isLoggedIn && (
              <div className="mb-8 p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {t('cart.joinUs')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('cart.joinUs.desc')}
                  </p>
                </div>
                <Link to="/signup">
                  <Button size="sm" className="whitespace-nowrap">
                    {t('cart.joinUs.createAccount')}
                  </Button>
                </Link>
              </div>
          )}

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
                {/* Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const id = getItemId(item);
                    const images = getItemImages(item);
                    const { mainPrice, oldPrice } = getPricesForItem(item);

                    return (
                        <div key={id} className="bg-card border border-border rounded-2xl p-6 flex gap-4 relative">
                          {freeProductId === id && (
                              <Badge className="absolute top-2 left-2 bg-primary">
                                <Gift className="h-3 w-3 mr-1" />
                                {t("cart.freeProduct")}
                              </Badge>
                          )}

                          <img src={images[0]} alt={getItemName(item)} className="w-24 h-24 object-cover rounded-lg"/>

                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {getItemName(item)}
                            </h3>

                            <div className="space-x-2 space-y-1">
                                  <span className="text-primary font-bold text-lg">
                                    {mainPrice.toFixed(2)} ₪
                                  </span>
                              {oldPrice != null && oldPrice !== mainPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {oldPrice.toFixed(2)} ₪
                                  </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(id, -1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button variant="outline" size="icon" onClick={() => updateQuantity(id, 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Button variant="ghost" size="icon" onClick={() => removeItem(id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                    );
                  })}
                </div>

                {/* Right column: loyalty + summary */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Loyalty Points Banner */}
                  {
                    role === 'user' && (
                          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 text-primary" />
                              <span className="font-semibold">
                                {t('cart.loyaltyPoints')}
                              </span>
                              <Badge variant="secondary">{points} pts</Badge>
                            </div>

                            {!isLoggedIn && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {t('cart.loyaltyPoints.createAccount')}
                                </p>
                            )}

                            {/* Free Product Option */}
                            {isLoggedIn && canRedeemFreeProduct && (
                                <div className="mb-3 p-3 bg-background/60 rounded-lg">
                                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                                    <Gift className="h-4 w-4 text-primary" />
                                    {t('cart.loyaltyPoints.pickFreeProduct')}
                                  </p>
                                  <RadioGroup value={freeProductId || ""} onValueChange={handleSelectFreeProduct}>
                                    {cart.map((item) => {
                                      const id = getItemId(item);
                                      const { mainPrice } = getPricesForItem(item);
                                      return (
                                          <div key={id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={id} id={`free-${id}`} />
                                            <Label htmlFor={`free-${id}`} className="text-sm cursor-pointer">
                                              {getItemName(item)} ({mainPrice.toFixed(2)} ₪)
                                            </Label>
                                          </div>
                                      );
                                    })}
                                  </RadioGroup>
                                </div>
                            )}

                            {/* Percentage Discount Option */}
                            {isLoggedIn && discount.percentage > 0 && discount.type === "discount" &&
                                !freeProductId && (
                                    <div className="p-3 bg-background/60 rounded-lg">
                                      <Button
                                          variant={applyDiscount ? "default" : "outline"}
                                          size="sm"
                                          className="w-full"
                                          onClick={handleApplyPercentDiscountClick}
                                      >
                                        <Tag className="h-4 w-4 mr-2" />
                                        {applyDiscount
                                            ? language === "ar"
                                                ? `تم تطبيق خصم ${
                                                    appliedDiscountPercentage ?? discount.percentage
                                                }%`
                                                : `${
                                                    appliedDiscountPercentage ?? discount.percentage
                                                }% discount applied`
                                            : language === "ar"
                                                ? `تطبيق خصم ${discount.percentage}%`
                                                : `Apply ${discount.percentage}% discount`}
                                      </Button>
                                    </div>
                                )}

                            {discount.type === "none" && (
                                <p className="text-sm text-muted-foreground">
                                  {t('cart.loyaltyPoints.collectPointsToApplyDiscount')}
                                </p>
                            )}
                          </div>
                      )
                  }

                  {/* Order Summary */}
                  <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
                    <h2 className="text-2xl font-bold mb-6">
                      {t("cart.total")}
                    </h2>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("cart.subtotal")}</span>
                        <span>{subtotal.toFixed(2)} ₪</span>
                      </div>

                      {discountAmount > 0 && (
                          <div className="flex justify-between text-primary">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {freeProductId
                            ? t('cart.loyaltyPoints.freeProduct')
                            : language === "ar"
                                ? `خصم ${appliedDiscountPercentage}%`
                                : `${appliedDiscountPercentage}% discount`}
                            </span>
                            <span>- {discountAmount.toFixed(2)} ₪</span>
                          </div>
                      )}

                      <div className="flex justify-between text-muted-foreground">
                    <span>
                      {t('cart.loyaltyPoints.deliveryPrice')}
                    </span>
                        <span>{deliveryPrice.toFixed(2)} ₪</span>
                      </div>

                      <div className="border-t border-border pt-3 flex justify-between text-xl font-bold">
                        <span>{t("cart.total")}</span>
                        <span className="text-primary">
                      {grandTotal.toFixed(2)} ₪
                    </span>
                      </div>
                    </div>
                    <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
                      {t("cart.checkout")}
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Checkout dialog */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto z-[9999]">
            <DialogHeader>
              <DialogTitle className={'text-start'}>{t("checkout.title")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("checkout.name")}</Label>
                <Input id="name" required value={formData.name} onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("checkout.phone")}</Label>
                <Input
                    dir={language == 'en' ? 'ltr' : 'rtl'}
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                    }
                />
              </div>
              <div>
                <Label htmlFor="city">{t("checkout.city")}</Label>
                <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                    }
                />
              </div>

              {/* Region dropdown instead of address textarea */}
              <div>
                <Label htmlFor="region">
                  {t("cart.checkoutDialog.region")}
                </Label>

                <select id="region" required className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm" value={selectedRegion} onChange={(e) => {
                      const value = e.target.value;
                      setSelectedRegion(value);

                      const cityObj = cities.find((c) => c.region === value);

                      setFormData((prev) => ({
                        ...prev,
                        address: cityObj ? cityObj.name[language] : "",
                      }));
                    }}
                >
                  <option value="">
                    {t("cart.checkoutDialog.selectRegion")}
                  </option>

                  {cities.map((c) => (
                      <option key={c.region} value={c.region}>
                        {c.name[language]}
                      </option>
                  ))}
                </select>
              </div>


              {/* Delivery type */}
              <div>
                <Label htmlFor="deliveryType">
                  {t("cart.checkoutDialog.deliveryType")}
                </Label>

                <select id="deliveryType" required className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="">
                    {t("cart.checkoutDialog.selectDeliveryType")}
                  </option>

                  {deliveryTypes.map((type) => (
                      <option key={type.name.ar} value={type.name[language]}>
                        {type.name[language]} ({type.duration[language]})
                      </option>
                  ))}
                </select>
              </div>


              <div>
                <Label htmlFor="notes">{t("checkout.notes")}</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                    }
                />
              </div>
              {/* Payment method */}
              <div>
                <Label>
                  {t("cart.checkoutDialog.paymentMethod")}
                </Label>

                <div className="mt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, paymentMethod: e.target.value as "cash" | "visa" }))
                        }
                    />
                    <span className="text-sm">
                      {t("cart.checkoutDialog.payCash")}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="visa"
                        checked={formData.paymentMethod === "visa"}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, paymentMethod: e.target.value as "cash" | "visa" }))
                        }
                    />
                    <span className="text-sm">
                      {t("cart.checkoutDialog.payVisa")}
                    </span>
                  </label>
                </div>

                {/* Optional info text */}
                {formData.paymentMethod === "visa" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("cart.checkoutDialog.navigateToPaymentGateway")}
                    </p>
                )}
              </div>

              {/* Summary inside dialog */}
              <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />

                  {discountAmount > 0
                      ? freeProductId
                          ? t("checkout.summary.includesFreeProduct")
                          : t("checkout.summary.discountApplied", {
                            percentage: appliedDiscountPercentage,
                          })
                      : t("checkout.summary.totalIncludesDelivery")}
                </p>

                <p className="text-xs text-muted-foreground">
                  {t("checkout.summary.deliveryPrice", {
                    price: deliveryPrice.toFixed(2),
                  })}
                </p>

                <p className="text-lg font-bold text-primary">
                  {t("checkout.summary.total")}{" "}
                  {grandTotal.toFixed(2)} ₪
                </p>
              </div>
              <div className="flex items-start gap-2 mt-3">
                <input type="checkbox" checked={acceptedPolicies} onChange={(e) => setAcceptedPolicies(e.target.checked)}/>
                <p className="text-xs text-muted-foreground">
                  {t("agreement.prefix")}{" "}

                  <Link to="/return-policy" className="text-primary">
                    {t("agreement.returnPolicy")}
                  </Link>{" "}

                  {t("agreement.and")}{" "}

                  <Link to="/privacy-policy" className="text-primary">
                    {t("agreement.privacyPolicy")}
                  </Link>
                </p>
              </div>
              <div className="relative z-[10000]">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6Lfi69osAAAAACRbBx1MQzaxz37xxc6U1U8bVZ_9"
                    size="invisible"
                    onChange={(value) => setCaptchaValue(value)}
                />
                {/*<ReCAPTCHA sitekey="6Lfi69osAAAAACRbBx1MQzaxz37xxc6U1U8bVZ_9" onChange={(value) => setCaptchaValue(value)}/>*/}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCheckoutOpen(false)} className="flex-1">
                  {t("checkout.cancel")}
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {t("checkout.submit")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={confirmDiscountOpen} onOpenChange={setConfirmDiscountOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("cart.points.confirmPointsUsage")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("cart.loyaltyPoints.confirmDiscount", {
                  percentage: discount.percentage,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDiscountApply}>
                {t("common.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={confirmFreeProductOpen} onOpenChange={setConfirmFreeProductOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("cart.points.confirmPointsUsage")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("cart.loyaltyPoints.confirmFreeProduct", {
                  points: FREE_PRODUCT_POINTS_COST,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmFreeProduct}>
                {t("common.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Cart;
