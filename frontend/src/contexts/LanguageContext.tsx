import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'he';

type TranslationVariables = Record<string, string | number>;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: TranslationVariables) => string;
};

const translations: Record<string, Record<Language, string>> = {

  // Navigation
  'nav.home': { en: 'Home', ar: 'الرئيسية', he: 'דף הבית' },
  'nav.products': { en: 'Products', ar: 'المنتجات', he: 'מוצרים' },
  'nav.about': { en: 'About', ar: 'من نحن', he: 'אוֹדוֹת' },
  'nav.contact': { en: 'Contact', ar: 'اتصل بنا', he: 'צרו קשר' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة', he: 'מנהל' },
  'nav.cart': { en: 'Cart', ar: 'السلة', he: 'עֲגָלָה' },
  'nav.orders': { en: 'Orders', ar: 'الطلبات', he: 'הזמנות' },
  'nav.favorite': { en: 'Favorites', ar: 'المفضلة', he: 'מועדפים' },

  // Payment
  'payment.verifying': { en: 'Verifying payment...', ar: 'جار التحقق من عملية الدفع...', he: 'מאמת תשלום...'},

  // Not Found
  'notFound.desc': { en: 'Oops! Page not found', ar: 'عذراً! الصفحة غير موجودة', he: 'אופס! הדף לא נמצא'},
  'notFound.returnHome': { en: 'Return to Home', ar: 'العودة إلى الصفحة الرئيسية', he: 'חזרה לבית'},

  // Login
  'login.header': {en: 'Login', ar: 'تسجيل الدخول', he: 'כְּנִיסָה לַמַעֲרֶכֶת'},
  'login.desc': {en: 'For Admin, Wholesalers & Users', ar: 'للإدارة والموزعين والمستخدمين', he: 'עבור מנהלים, סיטונאים ומשתמשים'},
  'login.field.phone': {en: 'Phone', ar: 'رقم الهاتف', he: 'מספר טלפון'},
  'login.field.phone.placeholder': {en: 'Enter your phone number', ar: 'أدخل رقمك', he: 'הזן את מספר הטלפון שלך'},
  'login.field.password': {en: 'Password', ar: 'كلمة المرور', he: 'סִיסמָה'},
  'login.field.password.placeholder': {en: 'Enter your password', ar: 'أدخل كلمة المرور', he: 'הזן את הסיסמה שלך'},
  'login.btnLogin': {en: 'Login', ar: 'تسجيل الدخول', he: 'כְּנִיסָה לַמַעֲרֶכֶת'},
  'login.back': {en: 'Back to Home', ar: 'العودة إلى الصفحة الرئيسية', he: 'חזרה לדף הבית'},
  'login.dontHaveAccount': {en: 'Don\'t have an account?', ar: 'لا تمتلك حساباً؟', he: 'אין לך חשבון?'},
  'login.signUp': {en: 'Sign Up', ar: 'إنشاء حساب', he: 'הירשם'},

  // signUp
  'signup.header': {en: 'Sign Up', ar: 'إنشاء حساب', he: 'הירשם'},
  'signup.desc': {en: 'Create a new account', ar: 'إنشاء حساب جديد', he: 'צור חשבון חדש'},
  'signup.field.username': {en: 'Username', ar: 'اسم المستخدم', he: 'שם משתמש'},
  'signup.field.username.placeholder': {en: 'Enter your username', ar: 'أدخل اسم المستخدم', he: 'הזן את שם המשתמש שלך'},
  'signup.field.phone': {en: 'Phone', ar: 'رقم الهاتف', he: 'מספר טלפון'},
  'signup.field.phone.placeholder': {en: 'Enter your phone number', ar: 'أدخل رقمك', he: 'הזן את מספר הטלפון שלך'},
  'signup.field.dob': {en: 'Date of Birth', ar: 'تاريخ الميلاد', he: 'תַאֲרִיך לֵידָה'},
  'signup.field.address': {en: 'Address', ar: 'العنوان', he: 'כְּתוֹבֶת'},
  'signup.field.address.placeholder': {en: 'Enter your address', ar: 'أدخل عنوانك', he: 'הזן את הכתובת שלך'},
  'signup.field.password': {en: 'Password', ar: 'كلمة المرور', he: 'סִיסמָה'},
  'signup.field.password.placeholder': {en: 'Enter your password', ar: 'أدخل كلمة المرور', he: 'הזן את הסיסמה שלך'},
  'signup.btnSignup': {en: 'Sign Up', ar: 'إنشاء حساب', he: 'הירשם'},
  'signup.haveAccount': {en: 'Already have an account?', ar: 'لديك حساب بالفعل؟', he: 'כבר יש לך חשבון?'},
  'signup.login': {en: 'Login', ar: 'تسجيل الدخول', he: 'כְּנִיסָה לַמַעֲרֶכֶת'},

  // Home page
  'home.hero.title': { en: 'Premium Bags & Accessories', ar: 'حقائب وإكسسوارات فاخرة' , he: 'תיקים ואביזרים פרימיום'},
  'home.hero.subtitle': { en: 'Discover luxury handbags, travel bags, backpacks, perfumes and accessories', ar: 'اكتشف حقائب اليد الفاخرة، حقائب السفر، حقائب الظهر، العطور والإكسسوارات' , he: 'גלו תיקי יד יוקרתיים, תיקי נסיעות, תרמילים, בשמים ואביזרים'},
  'home.shopNow': { en: 'Shop Now', ar: 'تسوق الآن' , he: 'קנה עכשיו'},
  'home.learnMore': { en: 'Learn More', ar: 'اعرف المزيد' , he: 'למידע נוסף'},
  'home.featured': { en: 'Featured Products', ar: 'منتجات مميزة' , he: 'מוצרים נבחרים'},
  'home.featuredDesc': { en: 'Handpicked favorites from our collection', ar: 'مختارات مميزة من مجموعتنا' , he: 'פריטים אהובים שנבחרו בקפידה מהאוסף שלנו'},
  'home.viewAll': { en: 'View All Products', ar: 'عرض كل المنتجات' , he: 'הצג את כל המוצרים'},
  'home.noCat': { en: 'No ratings are currently available.', ar: 'لا توجد تصنيفات متاحة حالياً', he: 'אין דירוגים זמינים כרגע.' },
  'home.noFeatured': { en: 'There are no featured products at the moment.', ar: 'لا توجد منتجات مميزة حالياًً' , he: 'אין מוצרים מומלצים כרגע.'},
  'home.birthDay': { en: 'Happy Birthday! 🎉', ar: 'كل عام وأنت بخير! 🎉', he: 'יום הולדת שמח! 🎉' },
  'home.birthDay.desc': { en: 'We’ve got a special gift for you today 🎁 Browse products to see your birthday price.', ar: 'لدينا هدية خاصة لك اليوم 🎁 تصفّح المنتجات وشاهد سعر عيد الميلاد.', he: 'יש לנו מתנה מיוחדת בשבילכם היום 🎁 עיינו במוצרים כדי לראות את מחיר יום ההולדת שלכם.' },
  'home.birthDay.note': { en: 'Note: This message shows only once today.', ar: 'ملاحظة: تظهر هذه الرسالة مرة واحدة فقط اليوم.', he: 'הערה: הודעה זו מוצגת רק פעם אחת היום.' },


  // Products
  'products.whatYouSearch': { en: 'What are you shopping for today?', ar: 'ما الذي تبحث عنه اليوم؟', he: 'מה אתם קונים היום?' },
  'products.searchPlaceholder': { en: 'Search products...', ar: 'ابحث في المنتجات...', he: 'חיפוש מוצרים...' },
  'products.sortProducts': { en: 'Sort products', ar: 'ترتيب المنتجات', he: 'מיין מוצרים' },
  'products.random': { en: 'Random', ar: 'عشوائي' , he: 'מִקרִי'},
  'products.latest': { en: 'Newest', ar: 'الأحدث' , he: 'החדש ביותר'},
  'products.oldest': { en: 'Oldest', ar: 'الأقدم' , he: 'הכי ותיק'},
  'products.loading': { en: 'Loading products...', ar: 'جاري تحميل المنتجات...', he: 'טוען מוצרים...' },
  'products.noProducts': { en: 'No products found', ar: 'لم يتم العثور على منتجات' , he: 'לא נמצאו מוצרים'},

  // Product Details
  'productDetails.backProducts': { en: 'Back to Products', ar: 'العودة للمنتجات', he: 'חזרה למוצרים' },
  'productDetails.noImage': { en: 'No image', ar: 'لا توجد صورة', he: 'אין תמונה' },
  'productDetails.unavailable': { en: 'Unavailable', ar: 'غير متوفر' , he: 'לא זמין'},
  'productDetails.availableColors': { en: 'Available Colors', ar: 'الألوان المتوفرة', he: 'צבעים זמינים' },
  'productDetails.price': { en: 'Price', ar: 'السعر' , he: 'מְחִיר'},
  'productDetails.brand': { en: 'Brand', ar: 'الماركة' , he: 'מותג'},
  'productDetails.category': { en: 'Category', ar: 'التصنيف' , he: 'קָטֵגוֹרִיָה'},
  'productDetails.internalID': { en: 'Internal ID', ar: 'المعرف الداخلي', he: 'מזהה פנימי' },
  'productDetails.productStatus': { en: 'Product Status', ar: 'حالة المنتج' , he: 'סטטוס המוצר'},
  'productDetails.properties': { en: 'Properties', ar: 'الخصائص' , he: 'נכסים'},
  'productDetails.addToCart': { en: 'Add to Cart', ar: 'أضف إلى السلة' , he: 'הוסף לעגלה'},
  'productDetails.relatedProducts': { en: 'Related Products', ar: 'منتجات ذات صلة', he: 'מוצרים קשורים' },
  'productDetails.backToProducts': { en: 'Back to Products', ar: 'العودة للمنتجات' , he: 'חזרה למוצרים'},
  'productDetails.productNotExist': { en: 'Product not found', ar: 'المنتج غير موجود' , he: 'המוצר לא נמצא'},
  'productDetails.productLoading': { en: 'Loading product...', ar: 'جاري تحميل المنتج...' , he: 'טוען מוצר...'},
  'productDetails.priceLabelWholesalePrice': { en: 'Wholesale price', ar: 'سعر الجملة' , he: 'מחיר סיטונאי'},
  'productDetails.priceLabelSalePrice': { en: 'Sale price', ar: 'سعر العرض' , he: 'מחיר המכירה'},

  // Favorites
  'favorites.header': { en: 'Favorites', ar: 'المفضلة' , he: 'מועדפים'},
  'favorites.desc': { en: 'Your favorite products are saved here', ar: 'منتجاتك المفضلة محفوظة هنا' , he: 'המוצרים המועדפים עליך נשמרים כאן'},
  'favorites.noFav': { en: 'No favorite products yet', ar: 'لا توجد منتجات مفضلة' , he: 'אין עדיין מוצרים מועדפים'},
  'favorites.browseProducts': { en: 'Browse Products', ar: 'تصفح المنتجات' , he: 'עיין במוצרים'},


  // Contact
  'contact.header': {en: 'Contact Us', ar: 'تواصل معنا', he: 'צרו קשר'},
  'contact.desc': {en: 'We\'re here to help and answer any questions you might have', ar: 'نحن هنا للمساعدة والإجابة على أي سؤال قد يكون لديك', he: 'אנחנו כאן כדי לעזור ולענות על כל שאלה שיש לכם'},
  'contact.contactInfo': {en: 'Get in Touch', ar: 'معلومات التواصل', he: 'לְהִתְקַשֵׁר'},
  'contact.contactInfo.desc': {en: 'Feel free to reach out to us through any of the following methods', ar: 'يمكنك التواصل معنا من خلال أي من الطرق التالية', he: 'אל תהססו לפנות אלינו בכל אחת מהדרכים הבאות'},
  'contact.contactInfo.email': {en: 'Email', ar: 'البريد الإلكتروني', he: 'כתובת דוא"ל'},
  'contact.contactInfo.phone': {en: 'Phone', ar: 'الهاتف', he: 'מספר טלפון'},
  'contact.contactInfo.address': {en: 'Address', ar: 'العنوان', he: 'כְּתוֹבֶת'},


  // Category Products
  'categoryProducts.discount.header': {en: 'Discounts', ar: 'العروض', he: 'הנחות'},
  'categoryProducts.showAllProducts': {en: 'Showing all products in this category', ar: 'عرض جميع المنتجات ضمن هذا التصنيف', he: 'מציג את כל המוצרים בקטגוריה זו'},
  'categoryProducts.search.placeholder': {en: 'Search in this category...', ar: 'ابحث في هذا التصنيف...', he: 'חפש בקטגוריה זו...'},
  'categoryProducts.dropdown.filterByBrand': {en: 'Filter by brand', ar: 'تصفية حسب الماركة', he: 'סנן לפי מותג'},
  'categoryProducts.dropdown.allBrands': {en: 'All brands', ar: 'كل الماركات', he: 'כל המותגים'},
  'categoryProducts.dropdown.filterByCat': {en: 'Filter by category', ar: 'تصفية حسب التصنيف', he: 'סנן לפי קטגוריה'},
  'categoryProducts.dropdown.allCat': {en: 'All categories', ar: 'كل التصنيفات', he: 'כל הקטגוריות'},
  'categoryProducts.dropdown.filterBySize': {en: 'Filter by size', ar: 'تصفية حسب المقاس', he: 'סנן לפי גודל'},
  'categoryProducts.dropdown.allSizes': {en: 'All sizes', ar: 'كل المقاسات', he: 'כל הגדלים'},
  'categoryProducts.dropdown.large': {en: 'Large', ar: 'كبير', he: 'גָדוֹל'},
  'categoryProducts.dropdown.med': {en: 'Medium', ar: 'وسط', he: 'בֵּינוֹנִי'},
  'categoryProducts.dropdown.small': {en: 'Small', ar: 'صغير', he: 'קָטָן'},
  'categoryProducts.dropdown.orderProducts': {en: 'Sort products', ar: 'ترتيب المنتجات', he: 'מיין מוצרים'},
  'categoryProducts.dropdown.newest': {en: 'Newest', ar: 'الأحدث', he: 'החדש ביותר'},
  'categoryProducts.dropdown.oldest': {en: 'Oldest', ar: 'الأقدم', he: 'הכי ותיק'},
  'categoryProducts.dropdown.random': {en: 'Random', ar: 'عشوائي', he: 'אַקרַאִי'},
  'categoryProducts.dropdown.loadingProducts': {en: 'Loading products...', ar: 'جاري تحميل المنتجات...', he: 'טוען מוצרים...'},
  'categoryProducts.dropdown.noProducts': {en: 'No products in this category', ar: 'لا توجد منتجات في هذا التصنيف', he: 'אין מוצרים בקטגוריה זו'},



  // About
  'about.title': { en: 'About Us', ar: 'من نحن' , he: 'אודותינו'},
  'about.desc': { en: 'We provide the finest quality products to our customers worldwide', ar: 'نحن نقدم أفضل المنتجات عالية الجودة لعملائنا حول العالم' , he: 'אנו מספקים את המוצרים האיכותיים ביותר ללקוחותינו ברחבי העולם'},
  'about.ourStory': { en: 'Our Story', ar: 'قصتنا' , he: 'הסיפור שלנו'},
  'about.ourStory.1': { en: 'We started our journey over 15 years ago with a mission to provide high-quality products to our customers. We believe every product tells a story, and we\'re here to help you find your perfect one.', ar: 'بدأنا رحلتنا منذ أكثر من 15 عامًا بهدف توفير منتجات عالية الجودة لعملائنا. نحن نؤمن بأن كل منتج يحكي قصة، ونحن هنا لمساعدتك في العثور على القصة المثالية لك.' , he: 'התחלנו את המסע שלנו לפני למעלה מ-15 שנה עם משימה לספק מוצרים איכותיים ללקוחותינו. אנו מאמינים שלכל מוצר יש סיפור משלו, ואנחנו כאן כדי לעזור לכם למצוא את המוצר המושלם עבורכם.'},
  'about.ourStory.2': { en: 'Our team is committed to delivering the best shopping experience possible, from product selection to after-sales service. We pride ourselves on our long-lasting relationships with our customers and partners.', ar: 'فريقنا ملتزم بتقديم أفضل تجربة تسوق ممكنة، من اختيار المنتجات إلى خدمة ما بعد البيع. نحن نفخر بعلاقاتنا طويلة الأمد مع عملائنا وشركائنا.' , he: 'הצוות שלנו מחויב לספק את חוויית הקנייה הטובה ביותר שאפשר, החל מבחירת המוצרים ועד לשירות לאחר המכירה. אנו גאים במערכות היחסים ארוכות הטווח שלנו עם לקוחותינו ושותפינו.'},

  // Footer
  'footer.desc': { en: 'Your trusted destination for premium handbags, travel bags, and accessories.', ar: 'وجهتك الموثوقة للحقائب الفاخرة وحقائب السفر والإكسسوارات.', he: 'היעד המהימן שלך לתיקים, תיקי נסיעות ואביזרים יוקרתיים.'},
  'footer.shop': { en: 'Shop', ar: 'تسوق' , he: 'חֲנוּת'},
  'footer.company': { en: 'Company', ar: 'الشركة' , he: 'חֶברָה'},
  'footer.contact': { en: 'Contact Us', ar: 'اتصل بنا' , he: 'צרו קשר'},
  'footer.pal': { en: 'Palestine', ar: 'فلسطين' , he: 'פַּלֶשְׂתִינָה'},

// Categories
  'category.handbags': { en: 'Handbags', ar: 'حقائب اليد', he: 'תיקי יד' },
  'category.backpacks': { en: 'Backpacks', ar: 'حقائب الظهر', he: 'תיקי גב' },
  'category.travel': { en: 'Travel Bags', ar: 'حقائب السفر', he: 'תיקי נסיעות' },
  'category.perfumes': { en: 'Perfumes', ar: 'العطور', he: 'בשמים' },
  'category.accessories': { en: 'Accessories', ar: 'الإكسسوارات', he: 'אביזרים' },

// Product
  'product.addToCart': { en: 'Add to Cart', ar: 'أضف للسلة', he: 'הוסף לעגלה' },
  'product.price': { en: 'Price', ar: 'السعر', he: 'מחיר' },
  'product.description': { en: 'Description', ar: 'الوصف', he: 'תיאור' },
  'product.sku': { en: 'SKU', ar: 'رمز المنتج', he: 'מק״ט' },
  'product.barcode': { en: 'Barcode', ar: 'الباركود', he: 'ברקוד' },

// ProductCard
  'productCard.sale': { en: 'Sale', ar: 'عرض', he: 'מבצע' },
  'productCard.soldOut': { en: 'Sold out', ar: 'نفذت الكمية', he: 'אזל מהמלאי' },
  'productCard.noImg': { en: 'No image', ar: 'لا توجد صورة', he: 'אין תמונה' },
  'productCard.unavailable': { en: 'Unavailable', ar: 'غير متوفر', he: 'לא זמין' },
  'productCard.birthdayOffer': { en: 'Birthday Offer 🎉', ar: 'خصم عيد الميلاد 🎉', he: 'מבצע יום הולדת 🎉' },
  'productCard.birthdayOffer.desc': { en: 'Birthday Gift 🎁', ar: 'هدية عيد الميلاد 🎁', he: 'מתנת יום הולדת 🎁' },
  'productCard.wholesalePrice': { en: 'Wholesale', ar: 'سعر الجملة', he: 'מחיר סיטונאי' },
  'productCard.salePrice': { en: 'Sale price', ar: 'سعر العرض', he: 'מחיר מבצע' },

// Cart
  'cart.title': { en: 'Shopping Cart', ar: 'سلة التسوق', he: 'עגלת קניות' },
  'cart.empty': { en: 'Your cart is empty', ar: 'سلة التسوق فارغة', he: 'העגלה שלך ריקה' },
  'cart.continueShopping': { en: 'Continue Shopping', ar: 'متابعة التسوق', he: 'המשך בקניות' },
  'cart.quantity': { en: 'Quantity', ar: 'الكمية', he: 'כמות' },
  'cart.remove': { en: 'Remove', ar: 'حذف', he: 'הסר' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي', he: 'סכום ביניים' },
  'cart.total': { en: 'Total', ar: 'الإجمالي', he: 'סה״כ' },
  'cart.checkout': { en: 'Checkout', ar: 'إتمام الشراء', he: 'לתשלום' },
  'cart.joinUs': { en: 'Sign up to unlock member benefits', ar: 'انضم إلينا لتحصل على مزايا الاشتراك', he: 'הירשם כדי לקבל הטבות לחברים' },
  'cart.joinUs.desc': {
    en: 'Create an account to earn points on every order, get exclusive discounts, and unlock free gifts.',
    ar: 'سجّل حساباً لتحصل على نقاط مع كل عملية شراء، خصومات حصرية وهدايا مجانية.',
    he: 'צור חשבון כדי לצבור נקודות על כל הזמנה, לקבל הנחות בלעדיות ומתנות חינם.'
  },
  'cart.joinUs.createAccount': { en: 'Create account', ar: 'إنشاء حساب', he: 'צור חשבון' },
  'cart.freeProduct': { en: 'FREE!', ar: 'مجاني!', he: 'חינם!' },
  'cart.loyaltyPoints': { en: 'Loyalty Points', ar: 'نقاط الولاء', he: 'נקודות נאמנות' },
  'cart.loyaltyPoints.createAccount': {
    en: 'Log in or create an account to start collecting points.',
    ar: 'سجّل دخولك أو أنشئ حساباً لبدء جمع النقاط.',
    he: 'התחבר או צור חשבון כדי להתחיל לצבור נקודות.'
  },
  'cart.loyaltyPoints.pickFreeProduct': {
    en: 'Choose a free product (100 pts).',
    ar: 'اختر منتج مجاني (100 نقطة)',
    he: 'בחר מוצר חינם (100 נקודות).'
  },
  'cart.loyaltyPoints.collectPointsToApplyDiscount': {
    en: 'Collect 20 points to get 20% off',
    ar: 'اجمع 20 نقطة للحصول على خصم 20%',
    he: 'צבור 20 נקודות כדי לקבל 20% הנחה'
  },
  'cart.loyaltyPoints.freeProduct': {
    en: 'Free product',
    ar: 'منتج مجاني',
    he: 'מוצר חינם'
  },
  'cart.loyaltyPoints.deliveryPrice': {
    en: 'Delivery',
    ar: 'سعر التوصيل',
    he: 'משלוח'
  },
  'cart.checkoutDialog.region': {
    en: 'Region',
    ar: 'المنطقة',
    he: 'אזור'
  },
  'cart.checkoutDialog.selectRegion': {
    en: 'Select region',
    ar: 'اختر المنطقة',
    he: 'בחר אזור'
  },
  'cart.checkoutDialog.deliveryType': {
    en: 'Delivery Type',
    ar: 'نوع التوصيل',
    he: 'סוג משלוח'
  },
  'cart.checkoutDialog.selectDeliveryType': {
    en: 'Select delivery type',
    ar: 'اختر نوع التوصيل',
    he: 'בחר סוג משלוח'
  },
  'cart.checkoutDialog.paymentMethod': {
    en: 'Payment Method',
    ar: 'طريقة الدفع',
    he: 'אמצעי תשלום'
  },
  'cart.checkoutDialog.payCash': {
    en: 'Cash on delivery',
    ar: 'الدفع نقداً عند الاستلام',
    he: 'תשלום במזומן בעת המסירה'
  },
  'cart.checkoutDialog.payVisa': {
    en: 'Pay with Visa',
    ar: 'ادفع باستخدام فيزا',
    he: 'תשלום עם ויזה'
  },
  'cart.checkoutDialog.navigateToPaymentGateway': {
    en: 'You will be redirected to Bank of Palestine\'s secure payment page to complete your payment.',
    ar: 'سيتم تحويلك إلى بوابة دفع آمنة لبنك فلسطين لإتمام العملية.',
    he: 'תועבר לדף התשלום המאובטח של בנק פלסטין להשלמת התשלום.'
  },
  'cart.points.confirmPointsUsage': {
    en: 'Confirm points usage',
    ar: 'تأكيد استخدام النقاط',
    he: 'אשר שימוש בנקודות'
  },

  'cart.loyaltyPoints.confirmDiscount': {
    en: 'Are you sure you want to use your points to apply a {{percentage}}% discount? The same number of points ({{percentage}}) will be deducted from your balance.',
    ar: 'هل أنت متأكد أنك تريد استخدام نقاطك لتطبيق خصم {{percentage}}%؟ سيتم خصم نفس عدد النقاط ({{percentage}} نقطة) من رصيدك.',
    he: 'האם אתה בטוח שברצונך להשתמש בנקודות שלך כדי לקבל {{percentage}}% הנחה? אותו מספר נקודות ({{percentage}}) ינוכה מהיתרה שלך.'
  },

  'cart.loyaltyPoints.confirmFreeProduct': {
    en: 'Are you sure you want to use {{points}} points to get this product for free?',
    ar: 'هل أنت متأكد أنك تريد استخدام {{points}} نقطة للحصول على المنتج مجاناً؟',
    he: 'האם אתה בטוח שברצונך להשתמש ב-{{points}} נקודות כדי לקבל את המוצר בחינם?'
  },

  'cart.loyaltyPoints.pointsDeducted': {
    en: '{{points}} points were deducted from your balance.',
    ar: 'تم خصم {{points}} نقطة من رصيدك',
    he: '{{points}} נקודות נוכו מהיתרה שלך.'
  },

  'cart.loyaltyPoints.needPointsForFreeProduct': {
    en: 'You need {{points}} points to get the free product.',
    ar: 'تحتاج {{points}} نقطة للحصول على المنتج المجاني',
    he: 'אתה צריך {{points}} נקודות כדי לקבל את המוצר בחינם.'
  },

  'cart.currentDiscount': {
    en: 'You have a {{percentage}}% discount on your cart',
    ar: 'لديك خصم {{percentage}}% على سلتك',
    he: 'יש לך {{percentage}}% הנחה על העגלה שלך'
  },

  'cart.noActiveDiscount': {
    en: 'No active discount currently',
    ar: 'لا يوجد خصم حالياً',
    he: 'אין כרגע הנחה פעילה'
  },


  'agreement.prefix': { en: 'I agree to the', ar: 'أوافق على', he: 'אני מסכים ל-' },
  'agreement.returnPolicy': { en: 'Return Policy', ar: 'سياسة الإرجاع', he: 'מדיניות החזרות' },
  'agreement.and': { en: 'and', ar: 'و', he: 'ו-' },
  'agreement.privacyPolicy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية', he: 'מדיניות פרטיות' },

// Checkout
  'checkout.title': { en: 'Checkout', ar: 'إتمام الطلب', he: 'סיום הזמנה' },
  'checkout.name': { en: 'Full Name', ar: 'الاسم الكامل', he: 'שם מלא' },
  'checkout.phone': { en: 'Phone Number', ar: 'رقم الهاتف', he: 'מספר טלפון' },
  'checkout.address': { en: 'Address', ar: 'العنوان', he: 'כתובת' },
  'checkout.city': { en: 'City', ar: 'المدينة', he: 'עיר' },
  'checkout.notes': { en: 'Order Notes', ar: 'ملاحظات الطلب', he: 'הערות להזמנה' },
  'checkout.submit': { en: 'Place Order', ar: 'إرسال الطلب', he: 'בצע הזמנה' },
  'checkout.cancel': { en: 'Cancel', ar: 'إلغاء', he: 'ביטול' },

// Privacy Policy
  'privacy.header': { en: 'Privacy Policy', ar: 'سياسة الخصوصية', he: 'מדיניות פרטיות' },

  'privacy.header.desc': {
    en: 'At Kewi Store, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you use our website.',
    ar: 'نحن في متجر Kewi نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا.',
    he: 'בחנות Kewi אנו מכבדים את פרטיותך ומתחייבים להגן על המידע האישי שלך. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלך בעת השימוש באתר.'
  },

  'privacy.infoCollect': {
    en: '1. The information we collect',
    ar: '1. المعلومات التي نجمعها',
    he: '1. המידע שאנו אוספים'
  },

  'privacy.infoCollect.desc': {
    en: 'When you use our website or make a purchase, we may collect the following information:',
    ar: 'عند استخدامك لموقعنا أو إجراء عملية شراء، قد نقوم بجمع المعلومات التالية:',
    he: 'כאשר אתה משתמש באתר שלנו או מבצע רכישה, אנו עשויים לאסוף את המידע הבא:'
  },

  'privacy.infoCollect.fullName': {
    en: 'full name',
    ar: 'الاسم الكامل',
    he: 'שם מלא'
  },

  'privacy.infoCollect.phoneNum': {
    en: 'phone number',
    ar: 'رقم الهاتف',
    he: 'מספר טלפון'
  },

  'privacy.infoCollect.address': {
    en: 'Address (City and Region)',
    ar: 'العنوان (المدينة والمنطقة)',
    he: 'כתובת (עיר ואזור)'
  },

  'privacy.infoCollect.orderDetails': {
    en: 'Order details (products, quantity, price)',
    ar: 'تفاصيل الطلب (المنتجات، الكمية، السعر)',
    he: 'פרטי ההזמנה (מוצרים, כמות, מחיר)'
  },

  'privacy.howUseInfo': {
    en: '2. How to use the information',
    ar: '2. كيفية استخدام المعلومات',
    he: '2. כיצד אנו משתמשים במידע'
  },

  'privacy.howUseInfo.desc': {
    en: 'We use the information we collect for the following purposes:',
    ar: 'نستخدم المعلومات التي نجمعها للأغراض التالية:',
    he: 'אנו משתמשים במידע שאנו אוספים למטרות הבאות:'
  },

  'privacy.howUseInfo.orderProcess': {
    en: 'Order processing and purchase execution',
    ar: 'معالجة الطلبات وتنفيذ عمليات الشراء',
    he: 'עיבוד הזמנות וביצוע רכישות'
  },

  'privacy.howUseInfo.contact': {
    en: 'Contacting you regarding your request',
    ar: 'التواصل معك بخصوص طلبك',
    he: 'יצירת קשר בנוגע להזמנה שלך'
  },

  'privacy.howUseInfo.ux': {
    en: 'Improving the user experience within the site',
    ar: 'تحسين تجربة المستخدم داخل الموقع',
    he: 'שיפור חוויית המשתמש באתר'
  },

  'privacy.howUseInfo.sendNotification': {
    en: 'Sending order-related notifications (such as order confirmation)',
    ar: 'إرسال إشعارات متعلقة بالطلب (مثل تأكيد الطلب)',
    he: 'שליחת התראות הקשורות להזמנה (כגון אישור הזמנה)'
  },

  'privacy.electronicPayment': {
    en: '3. Electronic payment',
    ar: '3. الدفع الإلكتروني',
    he: '3. תשלום אלקטרוני'
  },

  'privacy.electronicPayment.desc': {
    en: 'Electronic payment transactions are carried out through a secure payment gateway provided by the Bank of Palestine (Lahza).',
    ar: 'يتم تنفيذ عمليات الدفع الإلكتروني عبر بوابة دفع آمنة مقدمة من بنك فلسطين (Lahza).',
    he: 'עסקאות תשלום אלקטרוניות מתבצעות באמצעות שער תשלום מאובטח המסופק על ידי בנק פלסטין (Lahza).'
  },

  'privacy.electronicPayment.weDontStoreCardInfo': {
    en: 'We do not store or process bank card data directly.',
    ar: 'نحن لا نقوم بتخزين أو معالجة بيانات البطاقة البنكية مباشرة',
    he: 'איננו שומרים או מעבדים ישירות את פרטי כרטיס האשראי.'
  },

  'privacy.electronicPayment.paymentDoneEncryption': {
    en: 'All payments are processed through secure and encrypted systems belonging to the service provider.',
    ar: 'جميع عمليات الدفع تتم عبر أنظمة آمنة ومشفرة تابعة لمزود الخدمة',
    he: 'כל התשלומים מעובדים באמצעות מערכות מאובטחות ומוצפנות של ספק השירות.'
  },

  'privacy.dataProtection': {
    en: '4. Data Protection',
    ar: '4. حماية البيانات',
    he: '4. הגנת מידע'
  },

  'privacy.dataProtection.desc': {
    en: 'We are committed to taking appropriate measures to protect your data from:',
    ar: 'نلتزم باتخاذ الإجراءات المناسبة لحماية بياناتك من:',
    he: 'אנו מחויבים לנקוט באמצעים מתאימים כדי להגן על המידע שלך מפני:'
  },

  'privacy.dataProtection.unauthorized': {
    en: 'Unauthorized access',
    ar: 'الوصول غير المصرح به',
    he: 'גישה לא מורשית'
  },

  'privacy.dataProtection.edit': {
    en: 'Unlawful modification or disclosure',
    ar: 'التعديل أو الإفشاء غير القانوني',
    he: 'שינוי או חשיפה בלתי חוקיים'
  },

  'privacy.dataProtection.illegal': {
    en: 'illegal use',
    ar: 'الاستخدام غير المشروع',
    he: 'שימוש בלתי חוקי'
  },

  'privacy.dataShare': {
    en: '5. Sharing information',
    ar: '5. مشاركة المعلومات',
    he: '5. שיתוף מידע'
  },

  'privacy.dataShare.desc': {
    en: 'We do not sell or share your personal data with any third party, except:',
    ar: 'نحن لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي طرف ثالث، باستثناء:',
    he: 'איננו מוכרים או משתפים את המידע האישי שלך עם צד שלישי, למעט:'
  },

  'privacy.dataShare.shippingCompanies': {
    en: 'Shipping companies to deliver the order',
    ar: 'شركات الشحن لتوصيل الطلب',
    he: 'חברות משלוחים לצורך אספקת ההזמנה'
  },

  'privacy.dataShare.serviceProviders': {
    en: 'Payment service providers to complete financial transactions',
    ar: 'مزودي خدمات الدفع لإتمام العمليات المالية',
    he: 'ספקי שירותי תשלום לצורך השלמת העסקאות הכספיות'
  },

  'privacy.cookies': {
    en: '6. Cookies',
    ar: '6. ملفات تعريف الارتباط (Cookies)',
    he: '6. עוגיות (Cookies)'
  },

  'privacy.cookies.desc': {
    en: 'Our website may use cookies to improve user experience, such as:',
    ar: 'قد يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة المستخدم، مثل:',
    he: 'האתר שלנו עשוי להשתמש בעוגיות כדי לשפר את חוויית המשתמש, כגון:'
  },

  'privacy.cookies.savePreferences': {
    en: 'Save user preferences',
    ar: 'حفظ تفضيلات المستخدم',
    he: 'שמירת העדפות המשתמש'
  },

  'privacy.cookies.analysis': {
    en: 'Site usage analysis',
    ar: 'تحليل استخدام الموقع',
    he: 'ניתוח השימוש באתר'
  },

  'privacy.userRights': {
    en: '7. User rights',
    ar: '7. حقوق المستخدم',
    he: '7. זכויות המשתמש'
  },

  'privacy.userRights.desc': {
    en: 'You have the right to:',
    ar: 'لديك الحق في:',
    he: 'יש לך את הזכות:'
  },

  'privacy.userRights.requireEdit': {
    en: 'Request to modify your data',
    ar: 'طلب تعديل بياناتك',
    he: 'לבקש שינוי של המידע שלך'
  },

  'privacy.userRights.requireDelete': {
    en: 'Request to delete your data',
    ar: 'طلب حذف بياناتك',
    he: 'לבקש מחיקה של המידע שלך'
  },

  'privacy.userRights.requireQuestion': {
    en: 'Inquire about how your data is used',
    ar: 'الاستفسار عن كيفية استخدام بياناتك',
    he: 'לברר כיצד נעשה שימוש במידע שלך'
  },

  'privacy.userRights.youCanContact': {
    en: 'You can contact us at any time for this purpose.',
    ar: ' يمكنك التواصل معنا في أي وقت لهذا الغرض.',
    he: 'תוכל ליצור איתנו קשר בכל עת לצורך זה.'
  },

  'privacy.EditPolicies': {
    en: '8. Policy Amendments',
    ar: '8. التعديلات على السياسة',
    he: '8. עדכוני מדיניות'
  },

  'privacy.EditPolicies.desc': {
    en: 'We may update this privacy policy from time to time. Any updates will be posted on this page.',
    ar: 'قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تحديث على هذه الصفحة.',
    he: 'אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. כל עדכון יפורסם בעמוד זה.'
  },

  'privacy.contactUs': {
    en: '9. Contact us',
    ar: '9. التواصل معنا',
    he: '9. צור קשר'
  },

  'privacy.contactUs.desc': {
    en: 'If you have any questions regarding our privacy policy, you can contact us via:',
    ar: 'إذا كان لديك أي استفسار بخصوص سياسة الخصوصية، يمكنك التواصل معنا عبر:',
    he: 'אם יש לך שאלות בנוגע למדיניות הפרטיות שלנו, תוכל ליצור איתנו קשר באמצעות:'
  },

  'privacy.contactUs.email': {
    en: '📧 Email: ',
    ar: '📧 البريد الإلكتروني:',
    he: '📧 אימייל:'
  },

  'privacy.contactUs.phone': {
    en: '📞 Phone:',
    ar: '📞 الهاتف:',
    he: '📞 טלפון:'
  },

  'privacy.lastUpdate': {
    en: 'Last updated: 5/5/2026',
    ar: 'آخر تحديث: 5/5/2026',
    he: 'עודכן לאחרונה: 5/5/2026'
  },

// Profile
  'prof.logout': { en: 'Logout', ar: 'تسجيل الخروج', he: 'התנתק' },
  'prof.myAccount': { en: 'My Account', ar: 'حسابي', he: 'החשבון שלי' },
  'prof.loyaltyPoints': { en: 'Loyalty points', ar: 'نقاط الولاء', he: 'נקודות נאמנות' },
  'prof.myOrders': { en: 'My orders', ar: 'طلباتي', he: 'ההזמנות שלי' },
  'prof.personalInfo': { en: 'Personal info', ar: 'البيانات الشخصية', he: 'מידע אישי' },
  'prof.welcome': { en: 'Welcome', ar: 'مرحباً', he: 'ברוך הבא' },
  'prof.accountType': { en: 'Account type', ar: 'نوع الحساب', he: 'סוג חשבון' },
  'prof.availablePoints': { en: 'Available points', ar: 'النقاط المتاحة', he: 'נקודות זמינות' },
  'prof.totalPoints': { en: 'Total points', ar: 'إجمالي النقاط', he: 'סך כל הנקודות' },
  'prof.currentDiscount': { en: 'Current discount', ar: 'الخصم الحالي', he: 'הנחה נוכחית' },
  'prof.nextReward': { en: 'Next reward', ar: 'المكافأة القادمة', he: 'הפרס הבא' },
  'prof.backToStore': { en: 'Back to Store', ar: 'العودة إلى المتجر', he: 'חזרה לחנות' },
  'prof.goToOrders': { en: 'Go to orders', ar: 'انتقل إلى الطلبات', he: 'עבור להזמנות' },

  'prof.howPointsWork': {
    en: 'How do loyalty points work?',
    ar: 'كيف تعمل نقاط الولاء؟',
    he: 'איך פועלות נקודות הנאמנות?'
  },

  'prof.howPointsWork.desc': {
    en: 'Learn how to earn and use your points.',
    ar: 'تعرف على طريقة كسب النقاط واستخدامها.',
    he: 'למד כיצד לצבור ולהשתמש בנקודות שלך.'
  },

  'prof.earnPoints': {
    en: 'Earn points',
    ar: 'اكسب النقاط',
    he: 'צבור נקודות'
  },

  'prof.earnPoints.desc': {
    en: 'Earn 2 points for every 50₪ you spend in the store.',
    ar: 'احصل على نقطتين مقابل كل 50 شيكل تنفقه في المتجر.',
    he: 'צבור 2 נקודות על כל 50₪ שאתה מוציא בחנות.'
  },

  'prof.discount': {
    en: '20% discount',
    ar: 'خصم 20%"',
    he: '20% הנחה'
  },

  'prof.discount.desc': {
    en: 'When you reach 20 points, you get 20% off any product.',
    ar: 'عند الوصول إلى 20 نقطة، تحصل على خصم 20% على أي منتج.',
    he: 'כאשר אתה מגיע ל-20 נקודות, אתה מקבל 20% הנחה על כל מוצר.'
  },

  'prof.extraDiscount': {
    en: 'Extra discount',
    ar: 'خصم إضافي',
    he: 'הנחה נוספת'
  },

  'prof.extraDiscount.desc': {
    en: 'After 20 points, you earn an extra 5% discount for every additional 5 points.',
    ar: 'بعد 20 نقطة، تحصل على خصم إضافي 5% مقابل كل 5 نقاط جديدة.',
    he: 'לאחר 20 נקודות, תקבל 5% הנחה נוספת על כל 5 נקודות נוספות.'
  },

  'prof.freeProduct': {
    en: 'Free product!',
    ar: 'منتج مجاني!',
    he: 'מוצר חינם!'
  },

  'prof.freeProduct.desc': {
    en: 'When you reach 100 points, you can choose any product in your cart to be completely free.',
    ar: 'عند الوصول إلى 100 نقطة، يمكنك اختيار أي منتج ليكون مجانياً.',
    he: 'כאשר אתה מגיע ל-100 נקודות, תוכל לבחור כל מוצר בעגלה שלך בחינם.'
  },

  'prof.showYourOrder.desc': {
    en: 'You can view all your previous orders and track their status from here.',
    ar: 'يمكنك عرض جميع طلباتك السابقة وتتبع حالة الطلب من هنا.',
    he: 'תוכל לצפות בכל ההזמנות הקודמות שלך ולעקוב אחר הסטטוס שלהן מכאן.'
  },

  'prof.form.phone': {
    en: 'Phone',
    ar: 'رقم الهاتف',
    he: 'טלפון'
  },

  'prof.form.address': {
    en: 'Address',
    ar: 'العنوان',
    he: 'כתובת'
  },

// PurchaseHistory
  'purchaseHistory.header': {
    en: 'Purchase History',
    ar: 'سجل المشتريات',
    he: 'היסטוריית רכישות'
  },

  'purchaseHistory.desc': {
    en: 'Track your orders and earn loyalty points',
    ar: 'تتبع طلباتك واكسب نقاط الولاء',
    he: 'עקוב אחר ההזמנות שלך וצבור נקודות נאמנות'
  },

  'purchaseHistory.loading': {
    en: 'Loading orders...',
    ar: 'جاري تحميل الطلبات...',
    he: 'טוען הזמנות...'
  },

  'purchaseHistory.noOrdersYet': {
    en: 'You have no orders yet.',
    ar: 'لا توجد طلبات حتى الآن.',
    he: 'אין לך עדיין הזמנות.'
  },

  'purchaseHistory.earnPointsOnDelivery': {
    en: "You'll earn {{points}} points when you confirm delivery",
    ar: 'ستحصل على {{points}} نقطة عند تأكيد الاستلام',
    he: 'תקבל {{points}} נקודות כאשר תאשר את קבלת ההזמנה'
  },

  'purchaseHistory.item': {
    en: 'Item',
    ar: 'المنتج',
    he: 'מוצר'
  },

  'purchaseHistory.quantity': {
    en: 'Quantity',
    ar: 'الكمية',
    he: 'כמות'
  },

  'purchaseHistory.price': {
    en: 'Price',
    ar: 'السعر',
    he: 'מחיר'
  },

  'purchaseHistory.subtotal': {
    en: 'Subtotal',
    ar: 'المجموع',
    he: 'סכום ביניים'
  },

  'purchaseHistory.paid': {
    en: 'Paid',
    ar: 'مدفوع',
    he: 'שולם'
  },

  'purchaseHistory.total': {
    en: 'Total Without Delivery',
    ar: 'الإجمالي بدون توصيل',
    he: 'סה״כ ללא משלוח'
  },

  'purchaseHistory.loginFirst': {
    en: 'Please log in to view your orders',
    ar: 'الرجاء تسجيل الدخول لرؤية طلباتك',
    he: 'אנא התחבר כדי לצפות בהזמנות שלך'
  },

  'purchaseHistory.failedToFetchOrders': {
    en: 'Failed to fetch orders',
    ar: 'فشل في جلب الطلبات',
    he: 'נכשל בטעינת ההזמנות'
  },

  'order.loyaltyPointsEarned': {
    en: 'You earned {{points}} loyalty points!',
    ar: 'حصلت على {{points}} نقطة ولاء',
    he: 'הרווחת {{points}} נקודות נאמנות!'
  },

  'order.confirmed': {
    en: 'Order has been confirmed',
    ar: 'تم تأكيد الطلب',
    he: 'ההזמנה אושרה'
  },

// Save
  'btn.save': {
    en: 'Save changes',
    ar: 'حفظ التغييرات',
    he: 'שמור שינויים'
  },

  'btn.save.saving': {
    en: 'Saving...',
    ar: 'جارٍ الحفظ...',
    he: 'שומר...'
  },



  // ROLES
  'roles.admin': { en: 'Admin', ar: 'مسؤول', he: 'מנהל' },
  'roles.wholesaler': { en: 'Wholesaler', ar: 'تاجر جملة', he: 'סיטונאי' },
  'roles.user': { en: 'User', ar: 'مستخدم', he: 'משתמש' },

// LoyaltyCard
  'loyaltyCard.header': { en: 'Loyalty Points', ar: 'نقاط الولاء', he: 'נקודות נאמנות' },
  'loyaltyCard.availablePoints': { en: 'Available Points', ar: 'النقاط المتوفرة', he: 'נקודות זמינות' },
  'loyaltyCard.freeProduct': { en: 'Free Product!', ar: 'منتج مجاني!', he: 'מוצר חינם!' },
  'loyaltyCard.currentDiscount': { en: 'Your current discount:', ar: 'خصمك الحالي:', he: 'ההנחה הנוכחית שלך:' },
  'loyaltyCard.nextMilestone.nextReward': { en: 'Next Reward', ar: 'المكافأة القادمة', he: 'הפרס הבא' },

  'loyaltyCard.nextMilestone.nextReward.desc': {
    en: 'Earn 2 points for every 50 shekels spent',
    ar: 'اكسب 2 نقطة لكل 50 شيكل تنفقها',
    he: 'צבור 2 נקודות על כל 50 ש״ח שתוציא'
  },

  'loyalty.nextMilestone': {
    en: '{{points}} points to unlock {{reward}}',
    ar: 'تحتاج {{points}} نقطة للحصول على {{reward}}',
    he: '{{points}} נקודות כדי לפתוח את {{reward}}'
  },

// Return Policy
  'return.header': {
    en: 'Return & Exchange Policy',
    ar: 'سياسة الإرجاع والاستبدال',
    he: 'מדיניות החזרות והחלפות'
  },

  'return.header.desc': {
    en: 'At Kewi Store, we aim to ensure customer satisfaction. You can request a return or exchange under the following conditions:',
    ar: 'في متجر Kewi نحرص على رضا عملائنا، ويمكنك طلب الإرجاع أو الاستبدال وفق الشروط التالية:',
    he: 'בחנות Kewi אנו שואפים להבטיח את שביעות רצון הלקוחות. ניתן לבקש החזרה או החלפה בהתאם לתנאים הבאים:'
  },

  'return.duration': {
    en: '1. Return Period',
    ar: '1. مدة طلب الإرجاع',
    he: '1. תקופת ההחזרה'
  },

  'return.duration.desc': {
    en: 'You can request a return or exchange within 24 hours of receiving your order.',
    ar: 'يمكن طلب الإرجاع أو الاستبدال خلال 24 ساعة من تاريخ الاستلام.',
    he: 'ניתן לבקש החזרה או החלפה תוך 24 שעות מקבלת ההזמנה.'
  },

  'return.conditions': {
    en: '2. Return Conditions',
    ar: '2. شروط قبول الإرجاع',
    he: '2. תנאי החזרה'
  },

  'return.conditions.desc': {
    en: 'To accept a return request, the following conditions must be met:',
    ar: 'للموافقة على طلب الإرجاع يجب توفر الشروط التالية:',
    he: 'כדי לאשר בקשת החזרה, יש לעמוד בתנאים הבאים:'
  },

  'return.conditions.original': {
    en: 'Product must be unused and in original condition',
    ar: 'أن يكون المنتج بحالته الأصلية دون استخدام',
    he: 'המוצר חייב להיות ללא שימוש ובמצבו המקורי'
  },

  'return.conditions.packaging': {
    en: 'Product must include original packaging and accessories',
    ar: 'أن يكون مرفقًا بالتغليف الأصلي وكافة الملحقات',
    he: 'המוצר חייב לכלול את האריזה המקורית וכל האביזרים'
  },

  'return.conditions.sale': {
    en: 'Discounted or clearance items cannot be returned unless defective',
    ar: 'ألا يكون المنتج من ضمن العروض أو التصفيات (إلا في حال وجود عيب)',
    he: 'לא ניתן להחזיר מוצרים במבצע או חיסול אלא אם קיים פגם'
  },

  'return.fees': {
    en: '3. Return Fees',
    ar: '3. رسوم الإرجاع',
    he: '3. דמי החזרה'
  },

  'return.fees.desc': {
    en: 'Return shipping fees depend on the reason:',
    ar: 'تعتمد رسوم الإرجاع على سبب الطلب:',
    he: 'דמי המשלוח להחזרה תלויים בסיבת ההחזרה:'
  },

  'return.fees.customer': {
    en: 'Customer pays shipping if the return is not due to store error',
    ar: 'يتحمل العميل رسوم الشحن إذا لم يكن السبب خطأ من المتجر',
    he: 'הלקוח משלם על המשלוח אם ההחזרה אינה עקב טעות של החנות'
  },

  'return.fees.store': {
    en: 'Store covers shipping in case of defect or wrong item',
    ar: 'يتحمل المتجر رسوم الشحن في حال وجود عيب أو خطأ في الطلب',
    he: 'החנות תישא בעלויות המשלוח במקרה של פגם או טעות בהזמנה'
  },

  'return.refund': {
    en: '4. Refund Process',
    ar: '4. آلية استرداد المبلغ',
    he: '4. תהליך ההחזר הכספי'
  },

  'return.refund.desc': {
    en: 'After receiving and inspecting the product, the refund will be processed using the original payment method.',
    ar: 'بعد استلام المنتج وفحصه، يتم استرداد المبلغ حسب وسيلة الدفع المستخدمة.',
    he: 'לאחר קבלת המוצר ובדיקתו, ההחזר יתבצע באמצעות אמצעי התשלום המקורי.'
  },

  'return.reject': {
    en: '5. Rejection of Request',
    ar: '5. رفض الطلب',
    he: '5. דחיית הבקשה'
  },

  'return.reject.desc': {
    en: 'The store reserves the right to reject return requests that do not meet the above conditions.',
    ar: 'يحتفظ المتجر بحقه في رفض طلب الإرجاع في حال عدم استيفاء الشروط المذكورة.',
    he: 'החנות שומרת לעצמה את הזכות לדחות בקשות החזרה שאינן עומדות בתנאים לעיל.'
  },

  'return.contact': {
    en: '6. Contact Us',
    ar: '6. التواصل معنا',
    he: '6. צור קשר'
  },

  'return.contact.desc': {
    en: 'For any return or exchange request, please contact us via:',
    ar: 'لطلب الإرجاع أو الاستبدال، يرجى التواصل معنا عبر:',
    he: 'לכל בקשת החזרה או החלפה, אנא צור קשר באמצעות:'
  },

  'return.lastUpdate': {
    en: 'Last updated: 5/5/2026',
    ar: 'آخر تحديث: 5/5/2026',
    he: 'עודכן לאחרונה: 5/5/2026'
  },

// Delivery Terms
  'delivery.header': {
    en: 'Delivery Terms',
    ar: 'شروط التوصيل',
    he: 'תנאי משלוח'
  },

  'delivery.header.desc': {
    en: 'Kéwi Store Management is committed to providing a reliable and secure shipping service, while striving to adhere to the announced delivery dates as much as possible.',
    ar: 'تلتزم إدارة متجر Kéwi بتقديم خدمة شحن موثوقة وآمنة، مع الحرص على الالتزام بالمواعيد المعلنة قدر الإمكان.',
    he: 'הנהלת חנות Kéwi מחויבת לספק שירות משלוחים אמין ובטוח תוך הקפדה על זמני האספקה המפורסמים ככל האפשר.'
  },

  'delivery.timing': { en: 'Timing', ar: 'المدة', he: 'זמן אספקה' },

  'delivery.timing.normal': {
    en: 'Standard delivery usually takes 3–5 business days.',
    ar: 'التوصيل العادي عادةً خلال 3–5 أيام عمل.',
    he: 'משלוח רגיל נמשך בדרך כלל 3–5 ימי עסקים.'
  },

  'delivery.timing.express': {
    en: 'Express delivery usually takes 1–2 business days.',
    ar: 'التوصيل المستعجل عادةً خلال 1–2 يوم عمل.',
    he: 'משלוח אקספרס נמשך בדרך כלל 1–2 ימי עסקים.'
  },

  'delivery.timing.note': {
    en: 'The duration may change depending on pressure, holidays, or security/road conditions.',
    ar: 'قد تتغير المدة حسب الضغط، الأعياد، أو الظروف الأمنية/الطرق.',
    he: 'משך המשלוח עשוי להשתנות בהתאם לעומס, חגים או תנאי ביטחון ודרכים.'
  },

  'delivery.fees': { en: 'Delivery Fees', ar: 'رسوم الشحن', he: 'דמי משלוח' },
  'delivery.fees.standard': { en: 'Standard Delivery', ar: 'التوصيل العادي', he: 'משלוח רגיל' },
  'delivery.fees.express': { en: 'Express Delivery', ar: 'التوصيل المستعجل', he: 'משלוח אקספרס' },

  'delivery.fees.wb10': {
    en: 'West Bank: 10₪',
    ar: 'الضفة الغربية: 10 شيكل',
    he: 'הגדה המערבית: 10₪'
  },

  'delivery.fees.jerusalem20': {
    en: 'Jerusalem: 20₪',
    ar: 'القدس: 20 شيكل',
    he: 'ירושלים: 20₪'
  },

  'delivery.fees.inside45': {
    en: 'Inside: 50₪',
    ar: 'الداخل: 50 شيكل',
    he: 'בפנים: 50₪'
  },

  'delivery.fees.wb20': {
    en: 'West Bank: 20₪',
    ar: 'الضفةالغربية: 20 شيكل',
    he: 'הגדה המערבית: 20₪'
  },

  'delivery.fees.jerusalem30': {
    en: 'Jerusalem: 30₪',
    ar: 'القدس: 30 شيكل',
    he: 'ירושלים: 30₪'
  },

  'delivery.fees.inside70': {
    en: 'Inside: 70₪',
    ar: 'الداخل: 70 شيكل',
    he: 'בפנים: 70₪'
  },

  'delivery.fees.note1': {
    en: 'Shipping fees are automatically calculated based on region and service type before payment is completed.',
    ar: 'يتم احتساب رسوم الشحن تلقائيًا حسب المنطقة ونوع الخدمة قبل إتمام عملية الدفع.',
    he: 'דמי המשלוח מחושבים אוטומטית לפי האזור וסוג השירות לפני השלמת התשלום.'
  },

  'delivery.fees.note2': {
    en: 'In some special cases (remote areas or difficult access), fees may be adjusted after prior communication with the customer.',
    ar: 'في بعض الحالات الخاصة (المناطق البعيدة أو صعوبة الوصول) قد يتم تعديل الرسوم بعد التواصل المسبق مع العميل.',
    he: 'במקרים מיוחדים (אזורים מרוחקים או גישה קשה), ייתכן שדמי המשלוח יעודכנו לאחר תיאום עם הלקוח.'
  },

  'delivery.address': {
    en: 'Address & Receiving',
    ar: 'العنوان والاستلام',
    he: 'כתובת וקבלת המשלוח'
  },

  'delivery.address.phone': {
    en: 'Please ensure you enter a correct phone number and a clear and detailed address to guarantee fast delivery.',
    ar: 'رجى التأكد من إدخال رقم هاتف صحيح وعنوان واضح ومفصل لضمان سرعة التوصيل.',
    he: 'אנא ודא שהזנת מספר טלפון נכון וכתובת ברורה ומפורטת כדי להבטיח משלוח מהיר.'
  },

  'delivery.address.fail': {
    en: 'If delivery is not possible due to an incorrect address or lack of response, delivery may be rescheduled at an additional charge.',
    ar: 'في حال تعذّر الوصول بسبب عنوان غير صحيح أو عدم الرد، قد يتم إعادة جدولة التوصيل برسوم إضافية.',
    he: 'אם לא ניתן לבצע את המשלוח עקב כתובת שגויה או חוסר מענה, ייתכן שהמשלוח יתואם מחדש בתשלום נוסף.'
  },

  'delivery.address.check': {
    en: 'We recommend checking the order immediately upon receipt, and if there are any comments, please contact us within 24 hours of delivery time.',
    ar: 'نوصي بفحص الطلب فور الاستلام، وفي حال وجود أي ملاحظة يرجى التواصل معنا خلال 24 ساعة من وقت التسليم.',
    he: 'אנו ממליצים לבדוק את ההזמנה מיד עם קבלתה. במקרה של הערות כלשהן, אנא צור קשר תוך 24 שעות מזמן המסירה.'
  },

  'delivery.policies': {
    en: 'Policies & Support',
    ar: 'السياسات والخدمة',
    he: 'מדיניות ותמיכה'
  },

  'delivery.damage.title': {
    en: 'Damage or shipping error cases',
    ar: 'حالات التلف أو الخطأ في الشحن',
    he: 'מקרי נזק או טעות במשלוח'
  },

  'delivery.damage.desc': {
    en: 'If you receive a product damaged as a result of shipping:',
    ar: 'في حال استلام منتج متضرر نتيجة الشحن:',
    he: 'אם קיבלת מוצר שניזוק במהלך המשלוח:'
  },

  'delivery.damage.step1': {
    en: 'Please photograph the product and outer packaging clearly.',
    ar: 'يرجى تصوير المنتج والتغليف الخارجي بشكل واضح.',
    he: 'אנא צלם בבירור את המוצר ואת האריזה החיצונית.'
  },

  'delivery.damage.step2': {
    en: 'Send photos within 24 hours of receipt.',
    ar: 'إرسال الصور خلال 24 ساعة من الاستلام.',
    he: 'שלח את התמונות תוך 24 שעות מקבלת המשלוח.'
  },

  'delivery.damage.result': {
    en: 'The situation will be reviewed and an appropriate solution (replacement or compensation) will be provided in accordance with the store\'s policy.',
    ar: 'سيتم مراجعة الحالة وتقديم الحل المناسب (استبدال أو تعويض) وفقًا لسياسة المتجر.',
    he: 'המקרה ייבדק ויינתן פתרון מתאים (החלפה או פיצוי) בהתאם למדיניות החנות.'
  },

  'delivery.return.title': {
    en: 'Return and exchange policy',
    ar: 'سياسة الإرجاع والاستبدال',
    he: 'מדיניות החזרות והחלפות'
  },

  'delivery.return.desc': {
    en: 'In order to ensure our customers satisfaction, we offer the possibility of return or exchange according to the following conditions:',
    ar: 'حرصًا على رضا عملائنا، نوفر إمكانية الإرجاع أو الاستبدال وفق الشروط التالية:',
    he: 'כדי להבטיח את שביעות רצון לקוחותינו, אנו מאפשרים החזרה או החלפה בהתאם לתנאים הבאים:'
  },

  'delivery.return.period': {
    en: 'Return request period',
    ar: 'مدة طلب الإرجاع',
    he: 'תקופת בקשת החזרה'
  },

  'delivery.return.period.desc': {
    en: 'Returns or exchanges can be requested within 24 hours of receipt.',
    ar: 'يمكن طلب الإرجاع أو الاستبدال خلال 24 ساعة من تاريخ الاستلام.',
    he: 'ניתן לבקש החזרה או החלפה תוך 24 שעות מקבלת המשלוח.'
  },

  'delivery.return.conditions': {
    en: 'Return acceptance conditions',
    ar: 'شروط قبول الإرجاع',
    he: 'תנאי קבלת החזרה'
  },

  'delivery.return.c1': {
    en: 'The product must be in its original condition and unused.',
    ar: 'أن يكون المنتج بحالته الأصلية دون استخدام.',
    he: 'המוצר חייב להיות במצבו המקורי וללא שימוש.'
  },

  'delivery.return.c2': {
    en: 'It must be accompanied by the original packaging and all accessories.',
    ar: 'أن يكون مرفقًا بالتغليف الأصلي وكافة الملحقات.',
    he: 'יש לצרף את האריזה המקורית וכל האביזרים.'
  },

  'delivery.return.c3': {
    en: 'The product must not be part of special offers or clearance sales (unless it has a manufacturing defect).',
    ar: 'ألا يكون المنتج من ضمن العروض الخاصة أو التصفيات (ما لم يكن به عيب مصنعي).',
    he: 'המוצר לא יכול להיות חלק ממבצע או חיסול מלאי (אלא אם קיים פגם בייצור).'
  },

  'delivery.return.fees': {
    en: 'Return fees',
    ar: 'رسوم الإرجاع',
    he: 'דמי החזרה'
  },

  'delivery.return.f1': {
    en: 'If the reason for the return is not related to an error on the part of the store, the customer bears the round-trip shipping fees.',
    ar: 'في حال كان سبب الإرجاع لا يتعلق بخطأ من المتجر، يتحمل العميل رسوم الشحن ذهابًا وإيابًا.',
    he: 'אם סיבת ההחזרה אינה קשורה לטעות של החנות, הלקוח יישא בעלויות המשלוח הלוך וחזור.'
  },

  'delivery.return.f2': {
    en: 'In case of a manufacturing defect or an error in the order, the store will bear the full shipping costs.',
    ar: 'في حال وجود عيب مصنعي أو خطأ في الطلب، يتحمل المتجر كامل رسوم الشحن.',
    he: 'במקרה של פגם בייצור או טעות בהזמנה, החנות תישא בכל עלויות המשלוח.'
  },

  'delivery.return.refund': {
    en: 'refund mechanism',
    ar: 'آلية استرداد المبلغ',
    he: 'מנגנון החזר כספי'
  },

  'delivery.return.r1': {
    en: 'The product is inspected upon receipt.',
    ar: 'يتم فحص المنتج بعد استلامه.',
    he: 'המוצר נבדק לאחר קבלתו.'
  },

  'delivery.return.r2': {
    en: 'If the return is approved, the amount will be refunded within a period that will be communicated to the customer according to the payment method used.',
    ar: 'في حال الموافقة على الإرجاع، يتم استرداد المبلغ خلال مدة يتم إبلاغ العميل بها حسب وسيلة الدفع المستخدمة.',
    he: 'אם ההחזרה תאושר, הסכום יוחזר בתוך פרק זמן שיועבר ללקוח בהתאם לאמצעי התשלום שבו השתמש.'
  },

  'delivery.return.note': {
    en: 'The store reserves the right to refuse a return request if the above conditions are not met.',
    ar: 'يحتفظ المتجر بحقه في رفض طلب الإرجاع في حال عدم استيفاء الشروط المذكورة أعلاه.',
    he: 'החנות שומרת לעצמה את הזכות לסרב לבקשת החזרה אם התנאים לעיל אינם מתקיימים.'
  },

  'delivery.support.title': {
    en: 'Customer Support',
    ar: 'خدمة العملاء',
    he: 'שירות לקוחות'
  },

  'delivery.support.desc': {
    en: 'Our team is ready to assist you and answer all your inquiries via WhatsApp during official working hours. Your satisfaction and trust are always our priority.',
    ar: 'فريقنا جاهز لخدمتكم والإجابة عن جميع استفساراتكم عبر الواتساب خلال أوقات العمل الرسمية. رضاكم وثقتكم هما أولويتنا دائمًا.',
    he: 'הצוות שלנו מוכן לסייע לך ולענות על כל שאלותיך דרך וואטסאפ בשעות הפעילות הרשמיות. שביעות הרצון והאמון שלך הם תמיד בראש סדר העדיפויות שלנו.'
  },

  'delivery.contact': {
    en: 'Contact',
    ar: 'التواصل',
    he: 'צור קשר'
  },

  'delivery.contact.desc': {
    en: 'If you have any questions about delivery, contact us via WhatsApp.',
    ar: 'إذا كان لديك أي سؤال حول التوصيل، تواصل معنا عبر الواتساب.',
    he: 'אם יש לך שאלות לגבי המשלוח, צור קשר דרך וואטסאפ.'
  },

  // Toasts
  'toast.err': { en: 'Error', ar: 'خطأ', he: 'שגיאה' },

  'toast.handleSubmit.err': {
    en: 'Please fill in all fields',
    ar: 'الرجاء ملء جميع الحقول',
    he: 'אנא מלא את כל השדות'
  },

  'toast.createAccount.err': {
    en: 'Failed to create account',
    ar: 'فشل إنشاء الحساب',
    he: 'יצירת החשבון נכשלה'
  },

  'toast.addedToCart': {
    en: 'Added to cart',
    ar: 'تمت الإضافة للسلة',
    he: 'נוסף לעגלה'
  },

  'toast.addedDesc': {
    en: 'has been added to your cart',
    ar: 'تمت إضافته إلى سلتك',
    he: 'נוסף לעגלה שלך'
  },

  'toast.orderPlaced': {
    en: 'Order placed successfully',
    ar: 'تم إرسال الطلب بنجاح',
    he: 'ההזמנה בוצעה בהצלחה'
  },

  'toast.orderDesc': {
    en: 'We will contact you soon',
    ar: 'سنتواصل معك قريباً',
    he: 'ניצור איתך קשר בקרוב'
  },

  'toast.captchaValue.title': {
    en: 'Verification required',
    ar: 'التحقق مطلوبً',
    he: 'נדרש אימות'
  },

  'toast.captchaValue.desc': {
    en: 'Please confirm you are not a robot',
    ar: 'يرجى التأكيد على أنك لست روبوتًاً',
    he: 'אנא אשר שאינך רובוט'
  },

  'toast.acceptedPolicies.title': {
    en: 'Approval required',
    ar: 'مطلوب الموافقة',
    he: 'נדרש אישור'
  },

  'toast.acceptedPolicies.desc': {
    en: 'Policies must be agreed upon to complete the application.',
    ar: 'يجب الموافقة على السياسات لإتمام الطلبً',
    he: 'יש לאשר את המדיניות כדי להשלים את ההזמנה.'
  },

  'toast.welcome': {
    en: 'Welcome',
    ar: 'مرحباً بك',
    he: 'ברוך הבא'
  },

  'toast.welcome.login': {
    en: 'Logged in successfully',
    ar: 'تم تسجيل الدخول بنجاح',
    he: 'התחברת בהצלחה'
  },

  'toast.welcome.signup': {
    en: 'Account created successfully',
    ar: 'تم إنشاء الحساب بنجاح',
    he: 'החשבון נוצר בהצלחה'
  },

  'toast.suc.addedToCart': {
    en: 'Added to cart',
    ar: 'تمت الإضافة',
    he: 'נוסף לעגלה'
  },

  'toast.suc.addedToCart.desc': {
    en: 'added to your cart',
    ar: 'تمت إضافته إلى السلة',
    he: 'נוסף לעגלה שלך'
  },

  'toast.suc.paymentSuccess': {
    en: 'Payment successful',
    ar: 'تمت عملية الدفع بنجاح.',
    he: 'התשלום בוצע בהצלחה.'
  },

  'toast.suc.paymentSuccess.desc': {
    en: 'Your order has been placed successfully.',
    ar: 'تم تقديم طلبك بنجاح.',
    he: 'ההזמנה שלך בוצעה בהצלחה.'
  },

  'toast.suc.doneDiscount': {
    en: 'Discount applied',
    ar: 'تم تطبيق الخصم',
    he: 'ההנחה הוחלה'
  },

  'toast.suc.doneFreeProduct': {
    en: 'Free product applied',
    ar: 'تم تطبيق المنتج المجاني',
    he: 'המוצר החינמי הוחל'
  },

  'toast.err.email': {
    en: 'Invalid email or password',
    ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
    he: 'אימייל או סיסמה שגויים'
  },

  'toast.err.fieldApplyDiscount': {
    en: 'Failed to apply discount using points.',
    ar: 'فشل في تطبيق الخصم باستخدام النقاط',
    he: 'נכשל בהחלת ההנחה באמצעות נקודות.'
  },

  'toast.err.chooseColor': {
    en: 'Please choose a color before adding to cart',
    ar: 'الرجاء اختيار اللون قبل الإضافة إلى السلة',
    he: 'אנא בחר צבע לפני ההוספה לעגלה'
  },

  'toast.err.paymentErr': {
    en: 'Payment failed',
    ar: 'فشل الدفع',
    he: 'התשלום נכשל'
  },

  'toast.err.paymentErr.desc': {
    en: 'Payment was not completed.',
    ar: 'لم تكتمل عملية الدفع.',
    he: 'התשלום לא הושלם.'
  },

  'toast.err.notEnoughPoints': {
    en: 'Not enough points',
    ar: 'نقاط غير كافية',
    he: 'אין מספיק נקודות'
  },

  'toast.err.notEnoughPoints.desc': {
    en: 'You need at least {{points}} points to apply this discount.',
    ar: 'تحتاج على الأقل {{points}} نقطة لتطبيق هذا الخصم',
    he: 'אתה צריך לפחות {{points}} נקודות כדי להפעיל את ההנחה הזו.'
  },

  'toast.err.notLoggedIn': {
    en: 'Not logged in',
    ar: 'غير مسجل',
    he: 'לא מחובר'
  },

  'toast.err.notLoggedIn.desc.confirmOrder': {
    en: 'Please log in to confirm the order.',
    ar: 'الرجاء تسجيل الدخول لتأكيد الطلب',
    he: 'אנא התחבר כדי לאשר את ההזמנה.'
  },

  'toast.err.notLoggedIn.desc': {
    en: 'Please log in to use your loyalty points.',
    ar: 'الرجاء تسجيل الدخول لاستخدام نقاط الولاء',
    he: 'אנא התחבר כדי להשתמש בנקודות הנאמנות שלך.'
  },

  'toast.err.fieldUsePoints': {
    en: 'Failed to use loyalty point',
    ar: 'فشل في استخدام النقاط',
    he: 'נכשל בשימוש בנקודות הנאמנות'
  },

  'toast.err.paymentError': {
    en: 'Payment error',
    ar: 'خطأ في الدفع',
    he: 'שגיאת תשלום'
  },

  'toast.err.paymentError.desc': {
    en: 'Please select a valid payment method.',
    ar: 'يرجى اختيار طريقة دفع صحيحة',
    he: 'אנא בחר אמצעי תשלום תקין.'
  },

  'toast.err.phoneNotValid': {
    en: 'Invalid phone number',
    ar: 'رقم الهاتف غير صالح',
    he: 'מספר טלפון לא תקין'
  },

  'toast.err.phoneNotValid.desc': {
    en: 'The phone number must be at least 10 digits long.',
    ar: 'رقم الهاتف يجب أن لا يقل عن 10 أرقام',
    he: 'מספר הטלפון חייב להכיל לפחות 10 ספרות.'
  },

  'toast.err.insufficientStock': {
    en: 'Insufficient stock',
    ar: 'الكمية غير متاحة',
    he: 'אין מספיק מלאי'
  },

  'toast.err.insufficientStock.desc': {
    en: 'The requested quantity for "{{name}}" is greater than the available stock.',
    ar: 'الكمية المطلوبة من المنتج "{{name}}" أكبر من الكمية المتوفرة في المخزون.',
    he: 'הכמות המבוקשת עבור "{{name}}" גדולה מהמלאי הזמין.'
  },

  'toast.suc.updated': {
    en: 'Updated',
    ar: 'تم التحديثً',
    he: 'עודכן'
  },

  'toast.suc.updated.desc': {
    en: 'Your profile has been updated successfully.',
    ar: 'تم تحديث بيانات حسابك بنجاح',
    he: 'הפרופיל שלך עודכן בהצלחה.'
  },

  'toast.suc.orderConfirmed': {
    en: 'Order confirmed!',
    ar: 'تم تأكيد الاستلام!',
    he: 'ההזמנה אושרה!'
  },

  'toast.err.failedConfirmOrder': {
    en: 'Failed to confirm order delivery.',
    ar: 'فشل في تأكيد استلام الطلب',
    he: 'נכשל באישור קבלת ההזמנה.'
  },

// Common
  'common.cancel': {
    en: 'Cancel',
    ar: 'إلغاء',
    he: 'ביטול'
  },

  'common.confirm': {
    en: 'Confirm',
    ar: 'تأكيد',
    he: 'אישור'
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                            children,
                                                                          }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir =
        language === 'ar' || language === 'he'
            ? 'rtl'
            : 'ltr';
  }, [language]);

  const t = (
      key: string,
      vars?: TranslationVariables
  ): string => {
    let text =
        translations[key]?.[language] ||
        translations[key]?.en ||
        key;

    if (!vars) return text;

    Object.keys(vars).forEach((k) => {
      text = text.replace(`{{${k}}}`, String(vars[k]));
    });

    return text;
  };


  return (
      <LanguageContext.Provider value={{language, setLanguage, t,}}>
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