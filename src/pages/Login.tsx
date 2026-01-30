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
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend only - simple demo authentication
    if (!formData.email || !formData.password) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill in all fields',
        variant: "destructive",
      });
      return;
    }

    // Demo: Check for admin or wholesaler
    if (formData.email.includes('admin')) {
      localStorage.setItem('userRole', 'admin');
      toast({
        title: language === 'ar' ? 'مرحباً بك' : 'Welcome',
        description: language === 'ar' ? 'تم تسجيل الدخول كمسؤول' : 'Logged in as Admin',
      });
      navigate('/admin');
    } else if (formData.email.includes('wholesaler')) {
      localStorage.setItem('userRole', 'wholesaler');
      toast({
        title: language === 'ar' ? 'مرحباً بك' : 'Welcome',
        description: language === 'ar' ? 'تم تسجيل الدخول كتاجر جملة' : 'Logged in as Wholesaler',
      });
      navigate('/products');
    } else {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Invalid email or password',
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
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'ar' 
                  ? 'استخدم "admin@example.com" للمسؤول أو "wholesaler@example.com" لتاجر الجملة' 
                  : 'Use "admin@example.com" for Admin or "wholesaler@example.com" for Wholesaler'}
              </p>
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
            <Link to="/" className="text-sm text-primary hover:underline">
              {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">{language === 'ar' ? 'حسابات تجريبية:' : 'Demo Accounts:'}</p>
          <p>Admin: admin@example.com</p>
          <p>Wholesaler: wholesaler@example.com</p>
          <p className="mt-2 text-xs">{language === 'ar' ? '(أي كلمة مرور)' : '(any password)'}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;