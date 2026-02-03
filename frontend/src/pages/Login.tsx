import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
            language === "ar"
                ? "الرجاء ملء جميع الحقول"
                : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: language === "ar" ? "مرحباً بك" : "Welcome",
        description:
            language === "ar"
                ? "تم تسجيل الدخول بنجاح"
                : "Logged in successfully",
      });

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        // user or wholesaler
        navigate("/");
      }
    } catch (err: any) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
            err.message ||
            (language === "ar"
                ? "بريد إلكتروني أو كلمة مرور غير صحيحة"
                : "Invalid email or password"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-2">
            <Package className="h-8 w-8" />
            <span>{language === 'ar' ? 'المتجر' : 'Store'}</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'للمسؤولين وتجار الجملة' : 'For Admin & Wholesalers'}
          </p>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'ar' ? 'الرقم' : 'Phone'}
              </label>
              <Input
                // type="email"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل رقمك' : 'Enter your phone number'}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-primary hover:underline block mb-2">
              {language === "ar" ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
            </Link>
            <span className="text-sm text-muted-foreground">
              {language === "ar" ? "لا تمتلك حساباً؟" : "Don't have an account?"}{" "}
                        <Link to="/signup" className="text-primary hover:underline">
                {language === "ar" ? "إنشاء حساب" : "Sign Up"}
              </Link>
            </span>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;