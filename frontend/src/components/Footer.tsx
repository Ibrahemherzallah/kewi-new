import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import visa from "../assets/visa.png";
import masterCard from "../assets/masterCard.png";


export const Footer = () => {
  const { t, language } = useLanguage();

  const footerLinks = {
    shop: [
      { name: { en: 'Handbags', ar: 'حقائب اليد', he: 'תיקי יד' }, path: '/category/67fd7361d3d9f99f95edff41' },
      { name: { en: 'Travel Bags', ar: 'حقائب السفر', he: 'תיקי נסיעות' }, path: '/category/680fd54f4dde5779298c2701' },
      { name: { en: 'Perfumes', ar: 'العطور' , he: 'תַמרוּקִים'}, path: '/category/6803f9c535efe305218f99f2' },
      { name: { en: 'Accessories', ar: 'الإكسسوارات', he: 'אביזרים' }, path: '/category/67ff75611520f910df910f88' },
    ],
    company: [
      { name: { en: 'About Us', ar: 'من نحن', he: 'אודותינו' }, path: '/about' },
      { name: { en: 'Delivery Terms', ar: 'شروط التوصيل', he: 'תנאי משלוח' }, path: '/delivery-terms' },
      { name: { en: 'Privacy Policy', ar: 'سياسة الخصوصية', he: 'מדיניות הפרטיות' }, path: '/privacy-policy' },
      { name: { en: 'Return Policy', ar: 'سياسة الإرجاع', he: 'מדיניות החזרה' }, path: '/return-policy' },
      { name: { en: 'Contact', ar: 'اتصل بنا', he: 'צרו קשר' }, path: 'https://wa.me/972599128813' },
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
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/kewi.jenin" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/kewi.jenin" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@kewi.ps" className="text-muted-foreground hover:text-primary transition-colors">
                <SiTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.shop')}
            </h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span>kewi.group1@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>+972599128813</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{t('footer.pal')}</span>
              </li>
              <div className="flex gap-3 mt-6">
                <img src={visa} className="h-6" />
                <img src={masterCard} className="h-6" />
              </div>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>
            {language === 'en'
              ? `© ${new Date().getFullYear()} Kewi. All rights reserved.`
              : language === 'ar' ? `© ${new Date().getFullYear()} Kewi. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Kewi. כֹּל הַזְכוּיוֹת שְׁמוּרוֹת.`
            }
          </p>
        </div>
      </div>
    </footer>
  );
};
