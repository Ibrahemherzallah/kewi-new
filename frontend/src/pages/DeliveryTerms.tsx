import {Navbar} from "@/components/Navbar.tsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const DeliveryTerms = () => {
    const { language } = useLanguage();
    const isAr = language === "ar";

    return (
        <div className="min-h-screen bg-background">
            <Navbar cartCount={0} />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold">
                            {isAr ? "شروط التوصيل" : "Delivery Terms"}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isAr
                                ? "تلتزم إدارة متجر Kéwi بتقديم خدمة شحن موثوقة وآمنة، مع الحرص على الالتزام بالمواعيد المعلنة قدر الإمكان."
                                : "Kéwi Store Management is committed to providing a reliable and secure shipping service, while striving to adhere to the announced delivery dates as much as possible."}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "المدة" : "Timing"}
                                </Badge>
                            </div>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>
                                    {isAr
                                        ? "التوصيل العادي عادةً خلال 3–5 أيام عمل."
                                        : "Standard delivery usually takes 3–5 business days."}
                                </li>
                                <li>
                                    {isAr
                                        ? "التوصيل المستعجل عادةً خلال 1–2 يوم عمل."
                                        : "Express delivery usually takes 1–2 business days."}
                                </li>
                                <li>
                                    {isAr
                                        ? "قد تتغير المدة حسب الضغط، الأعياد، أو الظروف الأمنية/الطرق."
                                        : "Timing may change due to peak seasons, holidays, or road/security conditions."}
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "رسوم الشحن" : "Delivery Fees"}
                                </Badge>
                            </div>

                            {isAr ? (
                                <div className="space-y-4 text-sm text-muted-foreground text-right" dir="rtl">
                                    {/* التوصيل العادي */}
                                    <div>
                                        <p className="font-semibold mb-1">التوصيل العادي</p>
                                        <ul className="list-disc pr-5 space-y-1">
                                            <li>الضفة الغربية: 10 شيكل</li>
                                            <li>القدس: 20 شيكل</li>
                                            <li>الداخل: 45 شيكل</li>
                                        </ul>
                                    </div>

                                    {/* التوصيل المستعجل */}
                                    <div>
                                        <p className="font-semibold mb-1">التوصيل المستعجل</p>
                                        <ul className="list-disc pr-5 space-y-1">
                                            <li>الضفة الغربية: 20 شيكل</li>
                                            <li>القدس: 30 شيكل</li>
                                            <li>الداخل: 70 شيكل</li>
                                        </ul>
                                    </div>

                                    {/* ملاحظات عامة */}
                                    <div className="pt-2 space-y-1 text-xs leading-relaxed">
                                        <p>
                                            يتم احتساب رسوم الشحن تلقائيًا حسب المنطقة ونوع الخدمة قبل إتمام عملية الدفع.
                                        </p>
                                        <p>
                                            في بعض الحالات الخاصة (المناطق البعيدة أو صعوبة الوصول) قد يتم تعديل الرسوم بعد
                                            التواصل المسبق مع العميل.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    {/* Standard Delivery */}
                                    <div>
                                        <p className="font-semibold mb-1">Standard Delivery</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>West Bank: 10 NIS</li>
                                            <li>Jerusalem: 20 NIS</li>
                                            <li>’48 areas (inside): 45 NIS</li>
                                        </ul>
                                    </div>

                                    {/* Express Delivery */}
                                    <div>
                                        <p className="font-semibold mb-1">Express Delivery</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>West Bank: 20 NIS</li>
                                            <li>Jerusalem: 30 NIS</li>
                                            <li>’48 areas (inside): 70 NIS</li>
                                        </ul>
                                    </div>

                                    {/* Notes */}
                                    <div className="pt-2 space-y-1 text-xs leading-relaxed">
                                        <p>
                                            Delivery fees are calculated automatically based on your region and selected service type
                                            before you complete payment.
                                        </p>
                                        <p>
                                            In some special cases (remote or hard-to-reach areas), fees may be adjusted after
                                            contacting you first.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "العنوان والاستلام" : "Address & Receiving"}
                                </Badge>
                            </div>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>
                                    {isAr
                                        ? "يرجى التأكد من إدخال رقم هاتف صحيح وعنوان واضح ومفصل لضمان سرعة التوصيل."
                                        : "Please make sure to enter a valid phone number and a clear, detailed address to ensure fast delivery."}
                                </li>
                                <li>
                                    {isAr
                                        ? "في حال تعذّر الوصول بسبب عنوان غير صحيح أو عدم الرد، قد يتم إعادة جدولة التوصيل برسوم إضافية."
                                        : "If delivery fails due to incorrect address or no response, delivery may be rescheduled with an additional fee."}
                                </li>
                                <li>
                                    {isAr
                                        ? "نوصي بفحص الطلب فور الاستلام، وفي حال وجود أي ملاحظة يرجى التواصل معنا خلال 24 ساعة من وقت التسليم."
                                        : "We recommend inspecting the order immediately upon receipt, and if there are any issues, please contact us within 24 hours of delivery."}
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "السياسات والخدمة" : "Policies & Support"}
                                </Badge>
                            </div>

                            {isAr ? (
                                <div className="space-y-6 text-sm text-muted-foreground text-right" dir="rtl">
                                    {/* حالات التلف أو الخطأ في الشحن */}
                                    <section>
                                        <p className="font-semibold mb-1">حالات التلف أو الخطأ في الشحن</p>
                                        <p className="mb-2">
                                            في حال استلام منتج متضرر نتيجة الشحن:
                                        </p>
                                        <ol className="list-decimal pr-5 space-y-1">
                                            <li>يرجى تصوير المنتج والتغليف الخارجي بشكل واضح.</li>
                                            <li>إرسال الصور خلال 24 ساعة من الاستلام.</li>
                                        </ol>
                                        <p className="mt-2 text-xs leading-relaxed">
                                            سيتم مراجعة الحالة وتقديم الحل المناسب (استبدال أو تعويض) وفقًا لسياسة المتجر.
                                        </p>
                                    </section>

                                    <hr className="border-border" />

                                    {/* سياسة الإرجاع والاستبدال */}
                                    <section className="space-y-3">
                                        <p className="font-semibold">سياسة الإرجاع والاستبدال</p>
                                        <p className="text-xs leading-relaxed">
                                            حرصًا على رضا عملائنا، نوفر إمكانية الإرجاع أو الاستبدال وفق الشروط التالية:
                                        </p>

                                        {/* مدة طلب الإرجاع */}
                                        <div>
                                            <p className="font-medium mb-1">مدة طلب الإرجاع</p>
                                            <p className="text-xs leading-relaxed">
                                                يمكن طلب الإرجاع أو الاستبدال خلال 24 ساعة من تاريخ الاستلام.
                                            </p>
                                        </div>

                                        {/* شروط قبول الإرجاع */}
                                        <div>
                                            <p className="font-medium mb-1">شروط قبول الإرجاع</p>
                                            <ul className="list-disc pr-5 space-y-1">
                                                <li>أن يكون المنتج بحالته الأصلية دون استخدام.</li>
                                                <li>أن يكون مرفقًا بالتغليف الأصلي وكافة الملحقات.</li>
                                                <li>
                                                    ألا يكون المنتج من ضمن العروض الخاصة أو التصفيات (ما لم يكن به عيب مصنعي).
                                                </li>
                                            </ul>
                                        </div>

                                        {/* رسوم الإرجاع */}
                                        <div>
                                            <p className="font-medium mb-1">رسوم الإرجاع</p>
                                            <ul className="list-disc pr-5 space-y-1">
                                                <li>
                                                    في حال كان سبب الإرجاع لا يتعلق بخطأ من المتجر، يتحمل العميل رسوم الشحن ذهابًا
                                                    وإيابًا.
                                                </li>
                                                <li>
                                                    في حال وجود عيب مصنعي أو خطأ في الطلب، يتحمل المتجر كامل رسوم الشحن.
                                                </li>
                                            </ul>
                                        </div>

                                        {/* آلية استرداد المبلغ */}
                                        <div>
                                            <p className="font-medium mb-1">آلية استرداد المبلغ</p>
                                            <ul className="list-disc pr-5 space-y-1">
                                                <li>يتم فحص المنتج بعد استلامه.</li>
                                                <li>
                                                    في حال الموافقة على الإرجاع، يتم استرداد المبلغ خلال مدة يتم إبلاغ العميل بها حسب
                                                    وسيلة الدفع المستخدمة.
                                                </li>
                                            </ul>
                                        </div>

                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            يحتفظ المتجر بحقه في رفض طلب الإرجاع في حال عدم استيفاء الشروط المذكورة أعلاه.
                                        </p>
                                    </section>

                                    <hr className="border-border" />

                                    {/* خدمة العملاء */}
                                    <section>
                                        <p className="font-semibold mb-1">خدمة العملاء</p>
                                        <p className="text-xs leading-relaxed">
                                            فريقنا جاهز لخدمتكم والإجابة عن جميع استفساراتكم عبر الواتساب خلال أوقات العمل
                                            الرسمية. رضاكم وثقتكم هما أولويتنا دائمًا.
                                        </p>
                                    </section>
                                </div>
                            ) : (
                                <div className="space-y-6 text-sm text-muted-foreground">
                                    {/* Damage or Shipping Error Cases */}
                                    <section>
                                        <p className="font-semibold mb-1">Damage or Shipping Errors</p>
                                        <p className="mb-2">
                                            If you receive a damaged product due to shipping:
                                        </p>
                                        <ol className="list-decimal pl-5 space-y-1">
                                            <li>Please take clear photos of the product and outer packaging.</li>
                                            <li>Send the photos within 24 hours from receiving the order.</li>
                                        </ol>
                                        <p className="mt-2 text-xs leading-relaxed">
                                            We will review your case and provide an appropriate solution (replacement or
                                            compensation) according to our store policy.
                                        </p>
                                    </section>

                                    <hr className="border-border" />

                                    {/* Return & Exchange Policy */}
                                    <section className="space-y-3">
                                        <p className="font-semibold">Return & Exchange Policy</p>
                                        <p className="text-xs leading-relaxed">
                                            To ensure your satisfaction, we offer returns and exchanges under the following conditions:
                                        </p>

                                        <div>
                                            <p className="font-medium mb-1">Return Request Period</p>
                                            <p className="text-xs leading-relaxed">
                                                You can request a return or exchange within 24 hours from the date of receiving the order.
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-medium mb-1">Return Conditions</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>The product must be in its original, unused condition.</li>
                                                <li>Original packaging and all accessories must be included.</li>
                                                <li>
                                                    The product must not be from special offers or clearance, unless it has a manufacturing defect.
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="font-medium mb-1">Return Fees</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>
                                                    If the reason for return is not related to a store error, the customer bears the shipping costs both ways.
                                                </li>
                                                <li>
                                                    If there is a manufacturing defect or an error in the order, the store bears all shipping costs.
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="font-medium mb-1">Refund Process</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>The product is inspected after it is received.</li>
                                                <li>
                                                    If the return is approved, the refund is processed within a period that will be communicated to you,
                                                    depending on the payment method used.
                                                </li>
                                            </ul>
                                        </div>

                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            The store reserves the right to reject any return request that does not meet the conditions above.
                                        </p>
                                    </section>

                                    <hr className="border-border" />

                                    {/* Customer Service */}
                                    <section>
                                        <p className="font-semibold mb-1">Customer Service</p>
                                        <p className="text-xs leading-relaxed">
                                            Our team is available to assist you and answer your questions via WhatsApp during official working hours.
                                            Your satisfaction and trust are always our top priority.
                                        </p>
                                    </section>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "التواصل" : "Contact"}
                                </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {isAr
                                    ? "إذا كان لديك أي سؤال حول التوصيل، تواصل معنا عبر الواتساب."
                                    : "If you have any questions about delivery, contact us via the WhatsApp."}
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryTerms;