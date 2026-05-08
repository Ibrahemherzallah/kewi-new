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
import {Package, LogOut, ShoppingBag, User, Gift, Percent, Star, ArrowLeft,} from "lucide-react";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const PROFILE_API = `${API_BASE}/admin/api/me`;

interface UserData {
    id: string;
    username: string;
    phone: string;
    role: "admin" | "user" | "wholesaler" | string;
    address?: string;
}

const Profile = () => {
    const { t,language } = useLanguage();
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
                labelHe: `${needed} נקודות שנותרו כדי לקבל 20% הנחה `,
            };
        } else if (points < 100) {
            const needed = 100 - points;
            return {
                target: 100,
                needed,
                labelAr: `${needed} نقطة للحصول على منتج مجاني`,
                labelEn: `${needed} points left to get a free product`,
                labelHe: `${needed} נקודות שנותרו כדי לקבל מוצר חינם `,
            };
        } else {
            return {
                target: points || 100,
                needed: 0,
                labelAr: "لقد حصلت على كل المزايا الحالية 🎉",
                labelEn: "You’ve unlocked all current rewards 🎉",
                labelHe: "פתחת את כל הפרסים הנוכחיים 🎉",
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
            ? t("cart.currentDiscount", {
                percentage: discount.percentage,
            })
            : t("cart.noActiveDiscount");

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
                title: t('toast.suc.updated'),
                description: t('toast.suc.updated.desc'),
            });
        } catch (err: any) {
            toast({
                title: t('toast.err'),
                description: err.message || t('toast.err.cannotUpdate'),
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6 max-w-5xl">
                {/* Top header */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`flex-column gap-5`}>
                        <Link to="/" className={`flex mb-5`}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('prof.backToStore')}
                            </Button>
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl text-foreground">Kewi</span>
                    </div>
                    {/*<Link to="/" className="flex items-center gap-2">*/}

                    {/*</Link>*/}

                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-1" />
                        {t('prof.logout')}
                    </Button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-6">
                    {t('prof.myAccount')}
                </h1>

                <Tabs defaultValue={`${role === 'user' ? "loyalty" : "orders" }`} className="space-y-6">
                    <TabsList className={`${role === 'user' ?  "grid grid-cols-3 max-w-xl"  : "grid grid-cols-2 max-w-xl"}`}>
                        {
                            role === 'user' && (
                                <TabsTrigger value="loyalty">
                                    {t('prof.loyaltyPoints')}
                                </TabsTrigger>
                            )
                        }
                        <TabsTrigger value="orders">
                            {t('prof.myOrders')}
                        </TabsTrigger>
                        <TabsTrigger value="info">
                            {t('prof.personalInfo')}
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
                                              {t('prof.availablePoints')}
                                          </span>
                                        </div>
                                        <div className="text-3xl font-bold">{points}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('prof.totalPoints')}
                                        </p>
                                    </Card>

                                    {/* Current discount */}
                                    <Card className="p-5 bg-gradient-to-br from-emerald-900/40 to-emerald-700/20 border-emerald-500/40">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-semibold flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-emerald-300" />
                                              {t('prof.currentDiscount')}
                                          </span>
                                        </div>
                                        <p className="text-sm text-emerald-50">{currentDiscountText}</p>
                                    </Card>

                                    {/* Next reward */}
                                    <Card className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/40">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-semibold flex items-center gap-2">
                                            <Gift className="h-4 w-4 text-secondary-foreground" />
                                              {t('prof.nextReward')}
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
                                        {t('prof.howPointsWork')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {t('prof.howPointsWork.desc')}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {t('prof.earnPoints')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('prof.earnPoints.desc')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {t('prof.discount')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('prof.discount.desc')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 items-start bg-muted/40 rounded-lg p-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {t('prof.extraDiscount')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('prof.extraDiscount.desc')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-900/25 p-4 flex gap-3 items-start">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center text-xs font-bold">
                                                ★
                                            </div>
                                            <div>
                                                <p className="font-semibold text-emerald-200">
                                                    {t('prof.freeProduct')}
                                                </p>
                                                <p className="text-sm text-emerald-100/90">
                                                    {t('prof.freeProduct.desc')}
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
                                {t('prof.myOrders')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t('prof.showYourOrder.desc')}
                            </p>
                            <Button variant="outline" onClick={handleOrdersClick} className="mt-2">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                {t('prof.goToOrders')}
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
                                            {t('prof.personalInfo')}
                                        </h2>
                                        {user && (
                                            <p className="text-muted-foreground text-sm">
                                                {t('prof.welcome')},{" "}
                                                <span className="font-semibold">{user.username}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {user && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                              {t('prof.accountType')}
                                          </span>
                                            <span className="font-medium capitalize">
                                              {t(`roles.${user.role}`)}
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
                                            {t('prof.form.username')}
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
                                            {t('prof.form.phone')}
                                        </label>
                                        <Input type="tel" dir={language === "ar" ? "rtl" : "ltr"} value={editForm.phone} onChange={(e) =>
                                                setEditForm((f) => ({ ...f, phone: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">
                                            {t('prof.form.address')}
                                        </label>
                                        <Input value={editForm.address}
                                            onChange={(e) =>
                                                setEditForm((f) => ({ ...f, address: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={saving}>
                                        {saving
                                            ? t('btn.save.saving')
                                            : t('btn.save')
                                        }
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
