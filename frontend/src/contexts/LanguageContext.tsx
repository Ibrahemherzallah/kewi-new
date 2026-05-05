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

  // Privacy Policy
  'privacy.header': { en: 'Privacy Policy', ar: 'سياسة الخصوصية'},
  'privacy.header.desc': { en: 'At Kewi Store, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information when you use our website.', ar: 'نحن في متجر Kewi نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقعنا.'},
  'privacy.infoCollect': { en: '1. The information we collect', ar: '1. المعلومات التي نجمعها'},
  'privacy.infoCollect.desc': { en: 'When you use our website or make a purchase, we may collect the following information:', ar: 'عند استخدامك لموقعنا أو إجراء عملية شراء، قد نقوم بجمع المعلومات التالية:'},
  'privacy.infoCollect.fullName': { en: 'full name', ar: 'الاسم الكامل'},
  'privacy.infoCollect.phoneNum': { en: 'phone number', ar: 'رقم الهاتف'},
  'privacy.infoCollect.address': { en: 'Address (City and Region)', ar: 'العنوان (المدينة والمنطقة)'},
  'privacy.infoCollect.orderDetails': { en: 'Order details (products, quantity, price)', ar: 'تفاصيل الطلب (المنتجات، الكمية، السعر)'},
  'privacy.howUseInfo': { en: '2. How to use the information', ar: '2. كيفية استخدام المعلومات'},
  'privacy.howUseInfo.desc': { en: 'We use the information we collect for the following purposes:', ar: 'نستخدم المعلومات التي نجمعها للأغراض التالية:'},
  'privacy.howUseInfo.orderProcess': { en: 'Order processing and purchase execution', ar: 'معالجة الطلبات وتنفيذ عمليات الشراء'},
  'privacy.howUseInfo.contact': { en: 'Contacting you regarding your request', ar: 'التواصل معك بخصوص طلبك'},
  'privacy.howUseInfo.ux': { en: 'Improving the user experience within the site', ar: 'تحسين تجربة المستخدم داخل الموقع'},
  'privacy.howUseInfo.sendNotification': { en: 'Sending order-related notifications (such as order confirmation)', ar: 'إرسال إشعارات متعلقة بالطلب (مثل تأكيد الطلب)'},
  'privacy.electronicPayment': { en: '3. Electronic payment', ar: '3. الدفع الإلكتروني'},
  'privacy.electronicPayment.desc': { en: 'Electronic payment transactions are carried out through a secure payment gateway provided by the Bank of Palestine (Lahza).', ar: 'يتم تنفيذ عمليات الدفع الإلكتروني عبر بوابة دفع آمنة مقدمة من بنك فلسطين (Lahza).'},
  'privacy.electronicPayment.weDontStoreCardInfo': { en: 'We do not store or process bank card data directly.', ar: 'نحن لا نقوم بتخزين أو معالجة بيانات البطاقة البنكية مباشرة'},
  'privacy.electronicPayment.paymentDoneEncryption': { en: 'All payments are processed through secure and encrypted systems belonging to the service provider.', ar: 'جميع عمليات الدفع تتم عبر أنظمة آمنة ومشفرة تابعة لمزود الخدمة'},
  'privacy.dataProtection': { en: '4. Data Protection', ar: '4. حماية البيانات'},
  'privacy.dataProtection.desc': { en: 'We are committed to taking appropriate measures to protect your data from:', ar: 'نلتزم باتخاذ الإجراءات المناسبة لحماية بياناتك من:'},
  'privacy.dataProtection.unauthorized': { en: 'Unauthorized access', ar: 'الوصول غير المصرح به'},
  'privacy.dataProtection.edit': { en: 'Unlawful modification or disclosure', ar: 'التعديل أو الإفشاء غير القانوني'},
  'privacy.dataProtection.illegal': { en: 'illegal use', ar: 'الاستخدام غير المشروع'},
  'privacy.dataShare': { en: '5. Sharing information', ar: '5. مشاركة المعلومات'},
  'privacy.dataShare.desc': { en: 'We do not sell or share your personal data with any third party, except:', ar: 'نحن لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أي طرف ثالث، باستثناء:'},
  'privacy.dataShare.shippingCompanies': { en: 'Shipping companies to deliver the order', ar: 'شركات الشحن لتوصيل الطلب'},
  'privacy.dataShare.serviceProviders': { en: 'Payment service providers to complete financial transactions', ar: 'مزودي خدمات الدفع لإتمام العمليات المالية'},
  'privacy.cookies': { en: '6. Cookies', ar: '6. ملفات تعريف الارتباط (Cookies)'},
  'privacy.cookies.desc': { en: 'Our website may use cookies to improve user experience, such as:', ar: 'قد يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربة المستخدم، مثل:'},
  'privacy.cookies.savePreferences': { en: 'Save user preferences', ar: 'حفظ تفضيلات المستخدم'},
  'privacy.cookies.analysis': { en: 'Site usage analysis', ar: 'تحليل استخدام الموقع'},
  'privacy.userRights': { en: '7. User rights', ar: '7. حقوق المستخدم'},
  'privacy.userRights.desc': { en: 'You have the right to:', ar: 'لديك الحق في:'},
  'privacy.userRights.requireEdit': { en: 'Request to modify your data', ar: 'طلب تعديل بياناتك'},
  'privacy.userRights.requireDelete': { en: 'Request to delete your data', ar: 'طلب حذف بياناتك'},
  'privacy.userRights.requireQuestion': { en: 'Inquire about how your data is used', ar: 'الاستفسار عن كيفية استخدام بياناتك'},
  'privacy.userRights.youCanContact': { en: 'You can contact us at any time for this purpose.', ar: ' يمكنك التواصل معنا في أي وقت لهذا الغرض.'},
  'privacy.EditPolicies': { en: '8. Policy Amendments', ar: '8. التعديلات على السياسة'},
  'privacy.EditPolicies.desc': { en: 'We may update this privacy policy from time to time. Any updates will be posted on this page.', ar: 'قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تحديث على هذه الصفحة.'},
  'privacy.contactUs': { en: '9. Contact us', ar: '9. التواصل معنا'},
  'privacy.contactUs.desc': { en: 'If you have any questions regarding our privacy policy, you can contact us via:', ar: 'إذا كان لديك أي استفسار بخصوص سياسة الخصوصية، يمكنك التواصل معنا عبر:'},
  'privacy.contactUs.email': { en: '📧 Email: ', ar: '📧 البريد الإلكتروني:'},
  'privacy.contactUs.phone': { en: '📞 Phone:', ar: '📞 الهاتف:'},
  'privacy.lastUpdate': { en: 'Last updated: 5/5/2026', ar: 'آخر تحديث: 5/5/2026'},


  // Return Policy
  'return.header': { en: 'Return & Exchange Policy', ar: 'سياسة الإرجاع والاستبدال' },
  'return.header.desc': {en: 'At Kewi Store, we aim to ensure customer satisfaction. You can request a return or exchange under the following conditions:', ar: 'في متجر Kewi نحرص على رضا عملائنا، ويمكنك طلب الإرجاع أو الاستبدال وفق الشروط التالية:'},
  'return.duration': { en: '1. Return Period', ar: '1. مدة طلب الإرجاع' },
  'return.duration.desc': {en: 'You can request a return or exchange within 24 hours of receiving your order.', ar: 'يمكن طلب الإرجاع أو الاستبدال خلال 24 ساعة من تاريخ الاستلام.'},
  'return.conditions': { en: '2. Return Conditions', ar: '2. شروط قبول الإرجاع' },
  'return.conditions.desc': {en: 'To accept a return request, the following conditions must be met:', ar: 'للموافقة على طلب الإرجاع يجب توفر الشروط التالية:'},
  'return.conditions.original': { en: 'Product must be unused and in original condition', ar: 'أن يكون المنتج بحالته الأصلية دون استخدام' },
  'return.conditions.packaging': { en: 'Product must include original packaging and accessories', ar: 'أن يكون مرفقًا بالتغليف الأصلي وكافة الملحقات' },
  'return.conditions.sale': { en: 'Discounted or clearance items cannot be returned unless defective', ar: 'ألا يكون المنتج من ضمن العروض أو التصفيات (إلا في حال وجود عيب)' },
  'return.fees': { en: '3. Return Fees', ar: '3. رسوم الإرجاع' },
  'return.fees.desc': {en: 'Return shipping fees depend on the reason:', ar: 'تعتمد رسوم الإرجاع على سبب الطلب:'},
  'return.fees.customer': {en: 'Customer pays shipping if the return is not due to store error', ar: 'يتحمل العميل رسوم الشحن إذا لم يكن السبب خطأ من المتجر'},
  'return.fees.store': {en: 'Store covers shipping in case of defect or wrong item', ar: 'يتحمل المتجر رسوم الشحن في حال وجود عيب أو خطأ في الطلب'},
  'return.refund': { en: '4. Refund Process', ar: '4. آلية استرداد المبلغ' },
  'return.refund.desc': {en: 'After receiving and inspecting the product, the refund will be processed using the original payment method.', ar: 'بعد استلام المنتج وفحصه، يتم استرداد المبلغ حسب وسيلة الدفع المستخدمة.'},
  'return.reject': { en: '5. Rejection of Request', ar: '5. رفض الطلب' },
  'return.reject.desc': {en: 'The store reserves the right to رفض return requests that do not meet the above conditions.', ar: 'يحتفظ المتجر بحقه في رفض طلب الإرجاع في حال عدم استيفاء الشروط المذكورة.'},
  'return.contact': { en: '6. Contact Us', ar: '6. التواصل معنا' },
  'return.contact.desc': {en: 'For any return or exchange request, please contact us via:', ar: 'لطلب الإرجاع أو الاستبدال، يرجى التواصل معنا عبر:'},
  'return.lastUpdate': { en: 'Last updated: 5/5/2026', ar: 'آخر تحديث: 5/5/2026' },



  // Delivery Terms
  'delivery.header': { en: 'Delivery Terms', ar: 'شروط التوصيل' },
  'delivery.header.desc': { en: 'Kéwi Store Management is committed to providing a reliable and secure shipping service, while striving to adhere to the announced delivery dates as much as possible.', ar: 'تلتزم إدارة متجر Kéwi بتقديم خدمة شحن موثوقة وآمنة، مع الحرص على الالتزام بالمواعيد المعلنة قدر الإمكان.' },
  'delivery.timing': { en: 'Timing', ar: 'المدة' },
  'delivery.timing.normal': { en: 'Standard delivery usually takes 3–5 business days.', ar: 'التوصيل العادي عادةً خلال 3–5 أيام عمل.' },
  'delivery.timing.express': { en: 'Express delivery usually takes 1–2 business days.', ar: 'التوصيل المستعجل عادةً خلال 1–2 يوم عمل.' },
  'delivery.timing.note': { en: 'The duration may change depending on pressure, holidays, or security/road conditions.', ar: 'قد تتغير المدة حسب الضغط، الأعياد، أو الظروف الأمنية/الطرق.' },
  'delivery.fees': { en: 'Delivery Fees', ar: 'رسوم الشحن' },
  'delivery.fees.standard': { en: 'Standard Delivery', ar: 'التوصيل العادي' },
  'delivery.fees.express': { en: 'Express Delivery', ar: 'التوصيل المستعجل' },
  'delivery.fees.wb10': { en: 'West Bank: 10₪', ar: 'الضفة الغربية: 10 شيكل' },
  'delivery.fees.jerusalem20': { en: 'Jerusalem: 20₪', ar: 'القدس: 20 شيكل' },
  'delivery.fees.inside45': { en: 'Inside: 50₪', ar: 'الداخل: 50 شيكل' },
  'delivery.fees.wb20': { en: 'West Bank: 20₪', ar: 'الضفةالغربية: 20 شيكل' },
  'delivery.fees.jerusalem30': { en: 'Jerusalem: 30₪', ar: 'القدس: 30 شيكل' },
  'delivery.fees.inside70': { en: 'Inside: 70₪', ar: 'الداخل: 70 شيكل' },
  'delivery.fees.note1': { en: 'Shipping fees are automatically calculated based on region and service type before payment is completed.', ar: 'يتم احتساب رسوم الشحن تلقائيًا حسب المنطقة ونوع الخدمة قبل إتمام عملية الدفع.' },
  'delivery.fees.note2': { en: 'In some special cases (remote areas or difficult access), fees may be adjusted after prior communication with the customer.', ar: 'في بعض الحالات الخاصة (المناطق البعيدة أو صعوبة الوصول) قد يتم تعديل الرسوم بعد التواصل المسبق مع العميل.' },
  'delivery.address': { en: 'Address & Receiving', ar: 'العنوان والاستلام' },
  'delivery.address.phone': { en: 'Please ensure you enter a correct phone number and a clear and detailed address to guarantee fast delivery.', ar: 'رجى التأكد من إدخال رقم هاتف صحيح وعنوان واضح ومفصل لضمان سرعة التوصيل.' },
  'delivery.address.fail': { en: 'If delivery is not possible due to an incorrect address or lack of response, delivery may be rescheduled at an additional charge.', ar: 'في حال تعذّر الوصول بسبب عنوان غير صحيح أو عدم الرد، قد يتم إعادة جدولة التوصيل برسوم إضافية.' },
  'delivery.address.check': { en: 'We recommend checking the order immediately upon receipt, and if there are any comments, please contact us within 24 hours of delivery time.', ar: 'نوصي بفحص الطلب فور الاستلام، وفي حال وجود أي ملاحظة يرجى التواصل معنا خلال 24 ساعة من وقت التسليم.' },
  'delivery.policies': { en: 'Policies & Support', ar: 'السياسات والخدمة' },
  'delivery.damage.title': { en: 'Damage or shipping error cases', ar: 'حالات التلف أو الخطأ في الشحن' },
  'delivery.damage.desc': { en: 'If you receive a product damaged as a result of shipping:', ar: 'في حال استلام منتج متضرر نتيجة الشحن:' },
  'delivery.damage.step1': { en: 'Please photograph the product and outer packaging clearly.', ar: 'يرجى تصوير المنتج والتغليف الخارجي بشكل واضح.' },
  'delivery.damage.step2': { en: 'Send photos within 24 hours of receipt.', ar: 'إرسال الصور خلال 24 ساعة من الاستلام.' },
  'delivery.damage.result': { en: 'The situation will be reviewed and an appropriate solution (replacement or compensation) will be provided in accordance with the store\'s policy.', ar: 'سيتم مراجعة الحالة وتقديم الحل المناسب (استبدال أو تعويض) وفقًا لسياسة المتجر.' },
  'delivery.return.title': { en: 'Return and exchange policy', ar: 'سياسة الإرجاع والاستبدال' },
  'delivery.return.desc': { en: 'In order to ensure our customers satisfaction, we offer the possibility of return or exchange according to the following conditions:', ar: 'حرصًا على رضا عملائنا، نوفر إمكانية الإرجاع أو الاستبدال وفق الشروط التالية:' },
  'delivery.return.period': { en: 'Return request period', ar: 'مدة طلب الإرجاع' },
  'delivery.return.period.desc': { en: 'Returns or exchanges can be requested within 24 hours of receipt.', ar: 'يمكن طلب الإرجاع أو الاستبدال خلال 24 ساعة من تاريخ الاستلام.' },
  'delivery.return.conditions': { en: 'Return acceptance conditions', ar: 'شروط قبول الإرجاع' },
  'delivery.return.c1': { en: 'The product must be in its original condition and unused.', ar: 'أن يكون المنتج بحالته الأصلية دون استخدام.' },
  'delivery.return.c2': { en: 'It must be accompanied by the original packaging and all accessories.', ar: 'أن يكون مرفقًا بالتغليف الأصلي وكافة الملحقات.' },
  'delivery.return.c3': { en: 'The product must not be part of special offers or clearance sales (unless it has a manufacturing defect).', ar: 'ألا يكون المنتج من ضمن العروض الخاصة أو التصفيات (ما لم يكن به عيب مصنعي).' },
  'delivery.return.fees': { en: 'Return fees', ar: 'رسوم الإرجاع' },
  'delivery.return.f1': { en: 'If the reason for the return is not related to an error on the part of the store, the customer bears the round-trip shipping fees.', ar: 'في حال كان سبب الإرجاع لا يتعلق بخطأ من المتجر، يتحمل العميل رسوم الشحن ذهابًا وإيابًا.' },
  'delivery.return.f2': { en: 'In case of a manufacturing defect or an error in the order, the store will bear the full shipping costs.', ar: 'في حال وجود عيب مصنعي أو خطأ في الطلب، يتحمل المتجر كامل رسوم الشحن.' },
  'delivery.return.refund': { en: 'refund mechanism', ar: 'آلية استرداد المبلغ' },
  'delivery.return.r1': { en: 'The product is inspected upon receipt.', ar: 'يتم فحص المنتج بعد استلامه.' },
  'delivery.return.r2': { en: 'If the return is approved, the amount will be refunded within a period that will be communicated to the customer according to the payment method used.', ar: 'في حال الموافقة على الإرجاع، يتم استرداد المبلغ خلال مدة يتم إبلاغ العميل بها حسب وسيلة الدفع المستخدمة.' },
  'delivery.return.note': { en: 'The store reserves the right to refuse a return request if the above conditions are not met.', ar: 'يحتفظ المتجر بحقه في رفض طلب الإرجاع في حال عدم استيفاء الشروط المذكورة أعلاه.' },
  'delivery.support.title': { en: 'Customer Support', ar: 'خدمة العملاء' },
  'delivery.support.desc': { en: 'Our team is ready to assist you and answer all your inquiries via WhatsApp during official working hours. Your satisfaction and trust are always our priority.', ar: 'فريقنا جاهز لخدمتكم والإجابة عن جميع استفساراتكم عبر الواتساب خلال أوقات العمل الرسمية. رضاكم وثقتكم هما أولويتنا دائمًا.' },
  'delivery.contact': { en: 'Contact', ar: 'التواصل' },
  'delivery.contact.desc': { en: 'If you have any questions about delivery, contact us via WhatsApp.', ar: 'إذا كان لديك أي سؤال حول التوصيل، تواصل معنا عبر الواتساب.' },


  // Toasts
  'toast.addedToCart': { en: 'Added to cart', ar: 'تمت الإضافة للسلة' },
  'toast.addedDesc': { en: 'has been added to your cart', ar: 'تمت إضافته إلى سلتك' },
  'toast.orderPlaced': { en: 'Order placed successfully', ar: 'تم إرسال الطلب بنجاح' },
  'toast.orderDesc': { en: 'We will contact you soon', ar: 'سنتواصل معك قريباً' },
  'toast.captchaValue.title': { en: 'Verification required', ar: 'التحقق مطلوبً' },
  'toast.captchaValue.desc': { en: 'Please confirm you are not a robot', ar: 'يرجى التأكيد على أنك لست روبوتًاً' },
  'toast.acceptedPolicies.title': { en: 'Approval required', ar: 'مطلوب الموافقة' },
  'toast.acceptedPolicies.desc': { en: 'Policies must be agreed upon to complete the application.', ar: 'يجب الموافقة على السياسات لإتمام الطلبً' },
  // 'toast.orderDesc': { en: 'We will contact you soon', ar: 'سنتواصل معك قريباً' },
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
