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
                                ? "يرجى قراءة الشروط التالية قبل إتمام الطلب."
                                : "Please read the following terms before placing an order."}
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
                                    {isAr ? "رسوم التوصيل" : "Delivery Fees"}
                                </Badge>
                            </div>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>
                                    {isAr
                                        ? "تُحسب رسوم التوصيل حسب المنطقة ونوع التوصيل (عادي/مستعجل) وتظهر قبل تأكيد الطلب."
                                        : "Delivery fees depend on region and delivery type (Standard/Express) and are shown before order confirmation."}
                                </li>
                                <li>
                                    {isAr
                                        ? "قد يتم تعديل الرسوم في حالات خاصة (مناطق بعيدة) بعد التواصل مع العميل."
                                        : "Fees may be adjusted for special cases (remote areas) after contacting the customer."}
                                </li>
                            </ul>
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
                                        ? "يرجى التأكد من إدخال رقم هاتف صحيح وعنوان واضح لتجنب التأخير."
                                        : "Please provide a valid phone number and a clear address to avoid delays."}
                                </li>
                                <li>
                                    {isAr
                                        ? "في حال تعذّر الوصول بسبب عنوان غير صحيح أو عدم الرد، قد يتم إعادة جدولة التوصيل برسوم إضافية."
                                        : "If delivery fails due to incorrect address or no response, delivery may be rescheduled with an additional fee."}
                                </li>
                                <li>
                                    {isAr
                                        ? "يُفضّل فحص الطلب عند الاستلام، وفي حال وجود مشكلة تواصل معنا خلال 24 ساعة."
                                        : "Please check the order upon receiving it. If there’s an issue, contact us within 24 hours."}
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">
                                    {isAr ? "الإرجاع/الاستبدال بسبب التوصيل" : "Returns due to Delivery"}
                                </Badge>
                            </div>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>
                                    {isAr
                                        ? "إذا وصل المنتج تالفاً بسبب الشحن، يرجى تصوير المنتج والعلبة وإرسال الصور لنا."
                                        : "If an item arrives damaged due to shipping, please take photos of the item and packaging and send them to us."}
                                </li>
                                <li>
                                    {isAr
                                        ? "سيتم تقييم الحالة وتقديم حل مناسب (استبدال/تعويض) حسب السياسة."
                                        : "We will review the case and provide a suitable solution (replacement/refund) based on policy."}
                                </li>
                            </ul>
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