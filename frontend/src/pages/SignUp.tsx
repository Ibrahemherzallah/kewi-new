import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package } from "lucide-react";

const SignUp = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { language } = useLanguage();

    const [formData, setFormData] = useState({
        username: "",
        phone: "",
        password: "",
        address: "",
        dob: "", // ✅ NEW
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_ENV}/auth/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address,
                    dob: formData.dob, // ✅ send dob as YYYY-MM-DD string
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }

            // Save token + role + user
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast({
                title: language === "ar" ? "مرحباً بك" : "Welcome",
                description:
                    language === "ar"
                        ? "تم إنشاء الحساب بنجاح"
                        : "Account created successfully",
            });

            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err: any) {
            toast({
                title: language === "ar" ? "خطأ" : "Error",
                description:
                    err.message ||
                    (language === "ar"
                        ? "فشل إنشاء الحساب"
                        : "Failed to create account"),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mt-4">
                        {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {language === "ar"
                            ? "إنشاء حساب جديد"
                            : "Create a new account"}
                    </p>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {language === "ar" ? "اسم المستخدم" : "Username"}
                            </label>
                            <Input
                                type="text"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                placeholder={
                                    language === "ar"
                                        ? "أدخل اسم المستخدم"
                                        : "Enter your username"
                                }
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {language === "ar" ? "رقم الهاتف" : "Phone"}
                            </label>
                            <Input
                                type="tel"
                                dir={language === "ar" ? "rtl" : "ltr"}
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder={
                                    language === "ar"
                                        ? "أدخل رقم هاتفك"
                                        : "Enter your phone number"
                                }
                                required
                            />
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
                            </label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) =>
                                    setFormData({ ...formData, dob: e.target.value })
                                }
                                required={false} // you can make it required later if you want
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {language === "ar" ? "العنوان" : "Address"}
                            </label>
                            <Input
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder={
                                    language === "ar"
                                        ? "أدخل عنوانك"
                                        : "Enter your address"
                                }
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {language === "ar" ? "كلمة المرور" : "Password"}
                            </label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder={
                                    language === "ar"
                                        ? "أدخل كلمة المرور"
                                        : "Enter your password"
                                }
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                        <Link to="/login" className="text-primary hover:underline">
                            {language === "ar" ? "تسجيل الدخول" : "Login"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
