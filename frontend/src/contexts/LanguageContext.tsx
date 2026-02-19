import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.products': { en: 'Products', ar: 'المنتجات' },
  'nav.about': { en: 'About', ar: 'من نحن' },
  'nav.contact': { en: 'Contact', ar: 'اتصل بنا' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة' },
  'nav.cart': { en: 'Cart', ar: 'السلة' },
  
  // Home page
  'home.hero.title': { en: 'Premium Bags & Accessories', ar: 'حقائب وإكسسوارات فاخرة' },
  'home.hero.subtitle': { en: 'Discover luxury handbags, travel bags, backpacks, perfumes and accessories', ar: 'اكتشف حقائب اليد الفاخرة، حقائب السفر، حقائب الظهر، العطور والإكسسوارات' },
  'home.shopNow': { en: 'Shop Now', ar: 'تسوق الآن' },
  'home.learnMore': { en: 'Learn More', ar: 'اعرف المزيد' },
  'home.featured': { en: 'Featured Products', ar: 'منتجات مميزة' },
  'home.featuredDesc': { en: 'Handpicked favorites from our collection', ar: 'مختارات مميزة من مجموعتنا' },
  'home.viewAll': { en: 'View All Products', ar: 'عرض كل المنتجات' },
  
  // Categories
  'category.handbags': { en: 'Handbags', ar: 'حقائب اليد' },
  'category.backpacks': { en: 'Backpacks', ar: 'حقائب الظهر' },
  'category.travel': { en: 'Travel Bags', ar: 'حقائب السفر' },
  'category.perfumes': { en: 'Perfumes', ar: 'العطور' },
  'category.accessories': { en: 'Accessories', ar: 'الإكسسوارات' },
  
  // Product
  'product.addToCart': { en: 'Add to Cart', ar: 'أضف للسلة' },
  'product.price': { en: 'Price', ar: 'السعر' },
  'product.description': { en: 'Description', ar: 'الوصف' },
  'product.sku': { en: 'SKU', ar: 'رمز المنتج' },
  'product.barcode': { en: 'Barcode', ar: 'الباركود' },
  
  // Cart
  'cart.title': { en: 'Shopping Cart', ar: 'سلة التسوق' },
  'cart.empty': { en: 'Your cart is empty', ar: 'سلة التسوق فارغة' },
  'cart.continueShopping': { en: 'Continue Shopping', ar: 'متابعة التسوق' },
  'cart.quantity': { en: 'Quantity', ar: 'الكمية' },
  'cart.remove': { en: 'Remove', ar: 'حذف' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'cart.total': { en: 'Total', ar: 'الإجمالي' },
  'cart.checkout': { en: 'Checkout', ar: 'إتمام الشراء' },
  
  // Checkout
  'checkout.title': { en: 'Checkout', ar: 'إتمام الطلب' },
  'checkout.name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'checkout.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'checkout.address': { en: 'Address', ar: 'العنوان' },
  'checkout.city': { en: 'City', ar: 'المدينة' },
  'checkout.notes': { en: 'Order Notes', ar: 'ملاحظات الطلب' },
  'checkout.submit': { en: 'Place Order', ar: 'إرسال الطلب' },
  'checkout.cancel': { en: 'Cancel', ar: 'إلغاء' },
  
  // Toasts
  'toast.addedToCart': { en: 'Added to cart', ar: 'تمت الإضافة للسلة' },
  'toast.addedDesc': { en: 'has been added to your cart', ar: 'تمت إضافته إلى سلتك' },
  'toast.orderPlaced': { en: 'Order placed successfully', ar: 'تم إرسال الطلب بنجاح' },
  'toast.orderDesc': { en: 'We will contact you soon', ar: 'سنتواصل معك قريباً' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
