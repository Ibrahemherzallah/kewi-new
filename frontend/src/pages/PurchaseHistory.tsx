import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Package, Calendar, CreditCard, Star, Gift,} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import {useLoyalty, calculatePotentialPoints,} from "@/contexts/LoyaltyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";

interface PurchaseProduct {
  productId: string;
  quantity: number;
  color?: string;
  name?: string;
  price?: number; // unit price if you stored it
}

interface ApiPurchase {
  _id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  streetAddress?: string;
  deliveryType?: string;
  notes?: string;
  totalPrice: number;
  products: PurchaseProduct[];
  orderStatus?: "ordered" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

type UIStatus = 'ordered' | 'confirmed' | 'shipped' | 'delivered';

interface Purchase {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: UIStatus;
  isConfirmed: boolean;
  pointsEarned: number;
}

const mapOrderStatusToUI = (status?: ApiPurchase["orderStatus"]): UIStatus => {
  // fallback for old / missing data
  if (!status) return "ordered";
  return status;
};

const PurchaseHistory = () => {
  const { language } = useLanguage();
  const { addPoints } = useLoyalty();
  const { toast } = useToast();
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const action = "delivered";
  const statusLabel = (status: UIStatus, lang: string) => {
    if (lang === "ar") {
      switch (status) {
        case "ordered":
          return "تم إنشاء الطلب";
        case "confirmed":
          return "تم تأكيد الطلب";
        case "shipped":
          return "تم شحن الطلب";
        case "delivered":
          return "تم التسليم";
      }
    } else {
      switch (status) {
        case "ordered":
          return "Order created";
        case "confirmed":
          return "Order confirmed";
        case "shipped":
          return "Order shipped";
        case "delivered":
          return "Order delivered";
      }
    }
  };
  // 🔹 Fetch user purchases from backend
  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null;

        if (!token) {
          setError(
              language === "ar"
                  ? "الرجاء تسجيل الدخول لرؤية طلباتك"
                  : "Please log in to view your orders"
          );
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/admin/api/purchase/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(
              errData?.message ||
              (language === "ar"
                  ? "فشل في جلب الطلبات"
                  : "Failed to fetch orders")
          );
        }

        const data: ApiPurchase[] = await res.json();

        const mapped: Purchase[] = data.map((order) => ({
          id: order._id,
          date: order.createdAt,
          items: order.products.map((p, idx) => ({
            name:
                p.name ||
                `${language === "ar" ? "منتج" : "Product"} #${idx + 1}`,
            quantity: p.quantity,
            price: p.price ?? 0,
          })),
          total: order.totalPrice,
          status: mapOrderStatusToUI(order.orderStatus),
          isConfirmed: order.orderStatus === "delivered",
          pointsEarned: 0,
        }));

        setPurchases(mapped);
      } catch (err: any) {
        console.error("Error fetching purchases:", err);
        setError(
            err?.message ||
            (language === "ar"
                ? "حدث خطأ أثناء جلب الطلبات"
                : "An error occurred while fetching orders.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [language]);

  // ✅ User confirms order received
// inside PurchaseHistory component

// ...

  const handleConfirmReceived = async (orderId: string) => {
    const target = purchases.find((p) => p.id === orderId);
    if (!target || target.isConfirmed) return;

    try {
      const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        toast({
          title: language === "ar" ? "غير مسجل" : "Not logged in",
          description:
              language === "ar"
                  ? "الرجاء تسجيل الدخول لتأكيد الطلب"
                  : "Please log in to confirm the order.",
          variant: "destructive",
        });
        return;
      }
      console.log("token is: ", token)
      const res = await fetch(`${API_BASE}/user/api/purchase/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "delivered", role }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to confirm order");
      }

      const result = await res.json();
      const pointsEarned = result.earnedPoints ?? 0;

      // update loyalty context
      addPoints(pointsEarned);

      // update local state
      setPurchases((prev) =>
          prev.map((p) =>
              p.id === orderId
                  ? {
                    ...p,
                    isConfirmed: true,
                    status: "delivered",
                    pointsEarned,
                  }
                  : p
          )
      );

      toast({
        title: language === "ar" ? "تم تأكيد الاستلام!" : "Order confirmed!",
        description:
            pointsEarned > 0
                ? role === 'user' ? language === "ar"
                    ? `حصلت على ${pointsEarned} نقطة ولاء`
                    : `You earned ${pointsEarned} loyalty points!` : ''
                : language === "ar"
                    ? "تم تأكيد الطلب"
                    : "Order has been confirmed",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
            err?.message ||
            (language === "ar"
                ? "فشل في تأكيد استلام الطلب"
                : "Failed to confirm order delivery."),
        variant: "destructive",
      });
    }
  };

  return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {language === "ar" ? "سجل المشتريات" : "Purchase History"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar"
                  ? "تتبع طلباتك واكسب نقاط الولاء"
                  : "Track your orders and earn loyalty points"}
            </p>
          </div>

          {loading && (
              <div className="text-center text-muted-foreground py-8">
                {language === "ar" ? "جاري تحميل الطلبات..." : "Loading orders..."}
              </div>
          )}

          {error && !loading && (
              <div className="text-center text-red-500 py-4">{error}</div>
          )}

          {!loading && !error && (
              <div className={`${role === 'user' ? 'grid lg:grid-cols-3 gap-8' : '' } `}>
                {/* Loyalty Card Sidebar */}
                {
                  role === 'user' && (
                        <div className="lg:col-span-1">
                          <LoyaltyCard />
                        </div>
                    )
                }

                {/* Orders List */}
                <div className="lg:col-span-2 space-y-6">
                  {purchases.length === 0 && (
                      <Card className="p-6 text-center text-muted-foreground">
                        {language === "ar"
                            ? "لا توجد طلبات حتى الآن."
                            : "You have no orders yet."}
                      </Card>
                  )}

                  {purchases.map((purchase) => (
                      <Card key={purchase.id} className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-primary" />
                              <h3 className="text-xl font-semibold">
                                {purchase.id}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(purchase.date).toLocaleDateString(
                                  language === "ar" ? "ar-EG" : "en-GB"
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {purchase.isConfirmed && purchase.pointsEarned > 0 && role === 'user' && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  +{purchase.pointsEarned} pts
                                </Badge>
                            )}
                            <Badge
                                variant={
                                  purchase.status === "delivered" ? "default" : "secondary"
                                }
                            >
                              {statusLabel(purchase.status, language)}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                          <OrderProgressBar
                              status={purchase.status}
                              isConfirmed={purchase.isConfirmed}
                              orderId={purchase.id}
                              onConfirmReceived={() =>
                                  handleConfirmReceived(purchase.id)
                              }
                          />
                        </div>

                        {/* Potential Points Display */}
                        {!purchase.isConfirmed && purchase.status === "shipped" && role === 'user' && (
                            <div className="mb-4 flex items-center gap-2 text-sm bg-primary/10 rounded-lg p-3">
                              <Gift className="h-4 w-4 text-primary" />
                              <span>
                                {language === "ar"
                                    ? `ستحصل على ${calculatePotentialPoints(
                                        purchase.total
                                    )} نقطة عند تأكيد الاستلام`
                                    : `You'll earn ${calculatePotentialPoints(
                                        purchase.total
                                    )} points when you confirm delivery`}
                              </span>
                            </div>
                        )}

                        {/* Items table (fallback name/price if not stored) */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>
                                {language === "ar" ? "المنتج" : "Item"}
                              </TableHead>
                              <TableHead>
                                {language === "ar" ? "الكمية" : "Quantity"}
                              </TableHead>
                              <TableHead>
                                {language === "ar" ? "السعر" : "Price"}
                              </TableHead>
                              <TableHead>
                                {language === "ar" ? "المجموع" : "Subtotal"}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {purchase.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium" dir={language === 'ar' ? 'ltr' : ''}>
                                    {item.name}
                                  </TableCell>
                                  <TableCell dir={language === 'ar' ? 'ltr' : ''}>{item.quantity}</TableCell>
                                  <TableCell dir={language === 'ar' ? 'ltr' : ''}>
                                    {item.price > 0
                                        ? `${item.price.toFixed(2)} ₪`
                                        : "—"}
                                  </TableCell>
                                  <TableCell dir={language === 'ar' ? 'ltr' : ''}>
                                    {item.price > 0
                                        ? `${(item.price * item.quantity).toFixed(
                                            2
                                        )} ₪`
                                        : "—"}
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-sm">
                              {language === "ar" ? "مدفوع" : "Paid"}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {language === "ar" ? "الإجمالي بدون توصيل" : "Total Without Delivery"}
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {purchase.total.toFixed(2)} ₪
                            </p>
                          </div>
                        </div>
                      </Card>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default PurchaseHistory;
