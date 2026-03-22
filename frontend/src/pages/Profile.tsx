// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useToast } from "@/hooks/use-toast";
import {Package, LogOut, ShoppingBag, User, Gift, Percent, Star,} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://kewi.ps";
const PROFILE_API = `${API_BASE}/admin/api/me`;

interface UserData {
    id: string;
    username: string;
    phone: string;
    role: "admin" | "user" | "wholesaler" | string;
    address?: string;
}

const Profile = () => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState({
        username: "",
        phone: "",
        address: "",
    });
    const [saving, setSaving] = useState(false);
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    console.log("user is :" , user)
    // loyalty
    const { points, getDiscount } = useLoyalty();
    const discount = getDiscount();

    // --------- load user from localStorage once ----------
    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (raw) {
            try {
                const parsed: UserData = JSON.parse(raw);
                setUser(parsed);
                setEditForm({
                    username: parsed.username || "",
                    phone: parsed.phone || "",
                    address: parsed.address || "",
                });
            } catch {
                // ignore
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleOrdersClick = () => {
        navigate("/purchase-history");
    };

    // --------- loyalty helpers (different layout) ----------
    const getNextRewardInfo = () => {
        if (points < 20) {
            const needed = 20 - points;
            return {
                target: 20,
                needed,
                labelAr: `${needed} نقطة للحصول على خصم 20%`,
                labelEn: `${needed} points left to get 20% off`,
            };
        } else if (points < 100) {
            const needed = 100 - points;
            return {
                target: 100,
                needed,
                labelAr: `${needed} نقطة للحصول على منتج مجاني`,
                labelEn: `${needed} points left to get a free product`,
            };
        } else {
            return {
                target: points || 100,
                needed: 0,
                labelAr: "لقد حصلت على كل المزايا الحالية 🎉",
                labelEn: "You’ve unlocked all current rewards 🎉",
            };
        }
    };

    const nextReward = getNextRewardInfo();
    const progress =
        nextReward.target > 0
            ? Math.min(100, Math.round((points / nextReward.target) * 100))
            : 0;

    const currentDiscountText =
        discount.type === "discount" && discount.percentage > 0
            ? language === "ar"
                ? `لديك خصم ${discount.percentage}% على سلتك`
                : `You have a ${discount.percentage}% discount on your cart`
            : language === "ar"
                ? "لا يوجد خصم حالياً"
                : "No active discount currently";

    // --------- save profile ----------
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            console.log("The token is: " , token);
            const res = await fetch(PROFILE_API, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    username: editForm.username,
                    phone: editForm.phone,
                    address: editForm.address,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || data.error || "Failed to update profile");
            }

            const updatedUser: UserData = data.user;
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast({
                title: language === "ar" ? "تم التحديث" : "Updated",
                description:
                    language === "ar"
                        ? "تم تحديث بيانات حسابك بنجاح"
                        : "Your profile has been updated successfully.",
            });
        } catch (err: any) {
            toast({
                title: language === "ar" ? "خطأ" : "Error",
                description:
                    err.message ||
                    (language === "ar"
                        ? "تعذر تحديث البيانات"
                        : "Could not update your profile."),
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10 max-w-5xl">
                {/* Top header */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl text-foreground">Kewi</span>
                    </Link>

                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-1" />
                        {language === "ar" ? "تسجيل الخروج" : "Logout"}
                    </Button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-6">
                    {language === "ar" ? "حسابي" : "My Account"}
                </h1>

                <Tabs defaultValue={`${role === 'user' ? "loyalty" : "orders" }`} className="space-y-6">
                    <TabsList className={`${role === 'user' ?  "grid grid-cols-3 max-w-xl"  : "grid grid-cols-2 max-w-xl"}`}>
                        {
                            role === 'user' && (
                                <TabsTrigger value="loyalty">
                                    {language === "ar" ? "نقاط الولاء" : "Loyalty points"}
                                </TabsTrigger>
                            )
                        }
                        <TabsTrigger value="orders">
                            {language === "ar" ? "طلباتي" : "My orders"}
                        </TabsTrigger>
                        <TabsTrigger value="info">
                            {language === "ar" ? "البيانات الشخصية" : "Personal info"}
                        </TabsTrigger>
                    </TabsList>

                    {/* LOYALTY TAB */}
                    {
                        role === 'user' && (
                            <TabsContent value="loyalty" className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Available points */}
                                    <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-background to-background/80 border-primary/20">
                                        <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold flex items-center gap-2">
                                    <Star className="h-4 w-4 text-primary" />
                                      {language === "ar" ? "النقاط المتاحة" : "Available points"}
                                  </span>
                                        </div>
                                        <div className="text-3xl font-bold">{points}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {language === "ar" ? "إجمالي النقاط" : "Total points"}
                                        </p>
                                    </Card>

                                    {/* Current discount */}
                                    <Card className="p-5 bg-gradient-to-br from-emerald-900/40 to-emerald-700/20 border-emerald-500/40">
                                        <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-emerald-300" />
                                      {language === "ar" ? "الخصم الحالي" : "Current discount"}
                                  </span>
                                        </div>
                                        <p className="text-sm text-emerald-50">{currentDiscountText}</p>
                                    </Card>

                                    {/* Next reward */}
                                    <Card className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/40">
                                        <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-secondary-foreground" />
                                      {language === "ar" ? "المكافأة القادمة" : "Next reward"}
                                  </span>
                                        </div>
                                        <Progress value={progress} className="h-2 mb-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {language === "ar" ? nextReward.labelAr : nextReward.labelEn}
                                        </p>
                                    </Card>
                                </div>

                                {/* How loyalty works */}
                                <Card className="p-6">
                                    <h2 className="text-lg md:text-xl font-bold mb-2">
                                        {language === "ar"
                                            ? "كيف تعمل نقاط الولاء؟"
                                            : "How do loyalty points work?"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {language === "ar"
                                            ? "تعرف على طريقة كسب النقاط واستخدامها."
                                            : "Learn how to earn and use your points."}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {language === "ar" ? "اكسب النقاط" : "Earn points"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {language === "ar"
                                                        ? "احصل على نقطتين مقابل كل 50 شيكل تنفقه في المتجر."
                                                        : "Earn 2 points for every 50₪ you spend in the store."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {language === "ar" ? "خصم 20%" : "20% discount"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {language === "ar"
                                                        ? "عند الوصول إلى 20 نقطة، تحصل على خصم 20% على أي منتج."
                                                        : "When you reach 20 points, you get 20% off any product."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {language === "ar" ? "خصم إضافي" : "Extra discount"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {language === "ar"
                                                        ? "بعد 20 نقطة، تحصل على خصم إضافي 5% مقابل كل 5 نقاط جديدة."
                                                        : "After 20 points, you earn an extra 5% discount for every additional 5 points."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-900/25 p-4 flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center text-xs font-bold">
                                                ★
                                            </div>
                                            <div>
                                                <p className="font-semibold text-emerald-200">
                                                    {language === "ar"
                                                        ? "منتج مجاني!"
                                                        : "Free product!"}
                                                </p>
                                                <p className="text-sm text-emerald-100/90">
                                                    {language === "ar"
                                                        ? "عند الوصول إلى 100 نقطة، يمكنك اختيار أي منتج ليكون مجانياً."
                                                        : "When you reach 100 points, you can choose any product in your cart to be completely free."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        )
                    }

                    {/* ORDERS TAB */}
                    <TabsContent value="orders">
                        <Card className="p-6 flex flex-col items-start gap-4">
                            <h2 className="text-xl font-bold">
                                {language === "ar" ? "طلباتي" : "My orders"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {language === "ar"
                                    ? "يمكنك عرض جميع طلباتك السابقة وتتبع حالة الطلب من هنا."
                                    : "You can view all your previous orders and track their status from here."}
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleOrdersClick}
                                className="mt-2"
                            >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                {language === "ar" ? "عرض الطلبات" : "Go to orders"}
                            </Button>
                        </Card>
                    </TabsContent>

                    {/* PERSONAL INFO TAB */}
                    <TabsContent value="info">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Quick profile summary */}
                            <Card className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {language === "ar"
                                                ? "البيانات الشخصية"
                                                : "Personal information"}
                                        </h2>
                                        {user && (
                                            <p className="text-muted-foreground text-sm">
                                                {language === "ar" ? "مرحباً" : "Welcome"},{" "}
                                                <span className="font-semibold">{user.username}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {user && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "نوع الحساب" : "Account type"}
                      </span>
                                            <span className="font-medium capitalize">
                        {user.role === "admin"
                            ? language === "ar"
                                ? "مسؤول"
                                : "Admin"
                            : user.role === "wholesaler"
                                ? language === "ar"
                                    ? "تاجر جملة"
                                    : "Wholesaler"
                                : language === "ar"
                                    ? "مستخدم"
                                    : "User"}
                      </span>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Editable form */}
                            <Card className="p-6">
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">
                                            {language === "ar" ? "اسم المستخدم" : "Username"}
                                        </label>
                                        <Input
                                            value={editForm.username}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, username: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">
                                            {language === "ar" ? "رقم الهاتف" : "Phone"}
                                        </label>
                                        <Input
                                            type="tel"
                                            dir={language === "ar" ? "rtl" : "ltr"}
                                            value={editForm.phone}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, phone: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">
                                            {language === "ar" ? "العنوان" : "Address"}
                                        </label>
                                        <Input
                                            value={editForm.address}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, address: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={saving}>
                                        {saving
                                            ? language === "ar"
                                                ? "جارٍ الحفظ..."
                                                : "Saving..."
                                            : language === "ar"
                                                ? "حفظ التغييرات"
                                                : "Save changes"}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
