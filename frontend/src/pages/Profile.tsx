import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, LogOut, ShoppingBag, User } from "lucide-react";

interface UserData {
    id: string;
    username: string;
    phone: string;
    role: "admin" | "user" | "wholesaler" | string;
    address?: string;
    dob?: string;
}

const Profile = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("user");
        console.log("raw is , "  , raw)

        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setUser(parsed);
            } catch {
                // invalid JSON, ignore
            }
        }
    }, []);
    console.log("user is , "  , user)
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleOrdersClick = () => {
        navigate("/purchase-history");
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-10 max-w-2xl">
                {/* Header */}
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

                {/* Profile Card */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {language === "ar" ? "الملف الشخصي" : "Profile"}
                            </h1>
                            {user && (
                                <p className="text-muted-foreground">
                                    {language === "ar" ? "مرحباً" : "Welcome"},{" "}
                                    <span className="font-semibold">{user.username}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {user ? (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === "ar" ? "اسم المستخدم" : "Username"}
                </span>
                                <span className="font-medium">{user.username}</span>
                            </div>

                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === "ar" ? "رقم الهاتف" : "Phone"}
                </span>
                                <span className="font-medium">{user.phone}</span>
                            </div>

                            <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === "ar" ? "نوع الحساب" : "Account Type"}
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

                            {user.address && (
                                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "العنوان" : "Address"}
                  </span>
                                    <span className="font-medium text-right max-w-xs">
                    {user.address}
                  </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            {language === "ar"
                                ? "لا توجد بيانات مستخدم. يرجى تسجيل الدخول مرة أخرى."
                                : "No user data found. Please log in again."}
                        </p>
                    )}
                </Card>

                {/* Quick actions */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleOrdersClick}
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            {language === "ar" ? "عرض الطلبات" : "View Orders"}
                        </Button>
                        {/* You can add more actions here later (edit profile, etc.) */}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
