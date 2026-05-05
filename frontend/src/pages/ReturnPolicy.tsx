import { useLanguage } from "@/contexts/LanguageContext.tsx";
import { Navbar } from "@/components/Navbar.tsx";
import { Card } from "@/components/ui/card.tsx";

const ReturnPolicy = () => {
    const { t, language } = useLanguage();
    const isAr = language === "ar";

    return (
        <div className="min-h-screen bg-background">
            <Navbar cartCount={0} />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold">
                            {t("return.header")}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t("return.header.desc")}
                        </p>
                    </div>

                    <div className="space-y-4">

                        {/* Return Duration */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.duration")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.duration.desc")}
                                </p>
                            </div>
                        </Card>

                        {/* Conditions */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.conditions")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.conditions.desc")}
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <ul className="text-start list-disc px-5 space-y-1">
                                    <li>{t("return.conditions.original")}</li>
                                    <li>{t("return.conditions.packaging")}</li>
                                    <li>{t("return.conditions.sale")}</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Fees */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.fees")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.fees.desc")}
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <ul className="text-start list-disc px-5 space-y-1">
                                    <li>{t("return.fees.customer")}</li>
                                    <li>{t("return.fees.store")}</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Refund */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.refund")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.refund.desc")}
                                </p>
                            </div>
                        </Card>

                        {/* Reject */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.reject")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.reject.desc")}
                                </p>
                            </div>
                        </Card>

                        {/* Contact */}
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("return.contact")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("return.contact.desc")}
                                </p>
                            </div>

                            <div
                                className={`space-y-4 text-sm text-muted-foreground ${
                                    isAr ? "text-right" : ""
                                }`}
                                dir={isAr ? "rtl" : "ltr"}
                            >
                                <ul className={`list-disc ${isAr ? "pr-5" : "pl-5"} space-y-1`}>
                                    <li>📧 kewi.group1@gmail.com</li>
                                    <li>📞 +972599128813</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Last Update */}
                        <p className="text-muted-foreground">
                            {t("return.lastUpdate")}
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicy;