import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const { t, language } = useLanguage();

  const footerLinks = {
    shop: [
      { name: { en: 'Handbags', ar: 'حقائب اليد' }, path: '/products' },
      { name: { en: 'Backpacks', ar: 'حقائب الظهر' }, path: '/products' },
      { name: { en: 'Travel Bags', ar: 'حقائب السفر' }, path: '/products' },
      { name: { en: 'Perfumes', ar: 'العطور' }, path: '/products' },
      { name: { en: 'Accessories', ar: 'الإكسسوارات' }, path: '/products' },
    ],
    company: [
      { name: { en: 'About Us', ar: 'من نحن' }, path: '/about' },
      { name: { en: 'Contact', ar: 'اتصل بنا' }, path: '/contact' },
      { name: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' }, path: '/privacy' },
      { name: { en: 'Terms of Service', ar: 'شروط الخدمة' }, path: '/terms' },
    ],
  };

  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Kewi
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'en' 
                ? 'Your trusted destination for premium handbags, travel bags, and accessories.'
                : 'وجهتك الموثوقة للحقائب الفاخرة وحقائب السفر والإكسسوارات.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'en' ? 'Shop' : 'تسوق'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'en' ? 'Company' : 'الشركة'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">
              {language === 'en' ? 'Contact Us' : 'اتصل بنا'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span>info@kewi.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>+972 123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{language === 'en' ? 'Palestine' : 'فلسطين'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            {language === 'en' 
              ? `© ${new Date().getFullYear()} Kewi. All rights reserved.`
              : `© ${new Date().getFullYear()} Kewi. جميع الحقوق محفوظة.`}
          </p>
        </div>
      </div>
    </footer>
  );
};
