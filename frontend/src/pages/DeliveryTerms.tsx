import { Navbar } from "@/components/Navbar.tsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const DeliveryTerms = () => {
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
                            {t("delivery.header")}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t("delivery.header.desc")}
                        </p>
                    </div>

                    <div className="space-y-4">

                        {/* Timing */}
                        <Card className="p-6 rounded-2xl">
                            <Badge variant="secondary">
                                {t("delivery.timing")}
                            </Badge>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mt-3">
                                <li>{t("delivery.timing.normal")}</li>
                                <li>{t("delivery.timing.express")}</li>
                                <li>{t("delivery.timing.note")}</li>
                            </ul>
                        </Card>

                        {/* Fees */}
                        <Card className="p-6 rounded-2xl">
                            <Badge variant="secondary">
                                {t("delivery.fees")}
                            </Badge>

                            <div className="space-y-4 text-sm text-muted-foreground text-start mt-3">

                                <div>
                                    <p className="font-semibold mb-1">{t("delivery.fees.standard")}</p>
                                    <ul className="list-disc px-5 space-y-1 pl-5">
                                        <li>{t("delivery.fees.wb10")}</li>
                                        <li>{t("delivery.fees.jerusalem20")}</li>
                                        <li>{t("delivery.fees.inside45")}</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-semibold mb-1">{t("delivery.fees.express")}</p>
                                    <ul className="list-disc px-5 space-y-1 pl-5">
                                        <li>{t("delivery.fees.wb20")}</li>
                                        <li>{t("delivery.fees.jerusalem30")}</li>
                                        <li>{t("delivery.fees.inside70")}</li>
                                    </ul>
                                </div>

                                <div className="text-xs space-y-1">
                                    <p>{t("delivery.fees.note1")}</p>
                                    <p>{t("delivery.fees.note2")}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Address */}
                        <Card className="p-6 rounded-2xl">
                            <Badge variant="secondary">
                                {t("delivery.address")}
                            </Badge>

                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mt-3">
                                <li>{t("delivery.address.phone")}</li>
                                <li>{t("delivery.address.fail")}</li>
                                <li>{t("delivery.address.check")}</li>
                            </ul>
                        </Card>

                        {/* Policies */}
                        <Card className="p-6 rounded-2xl">
                            <Badge variant="secondary">
                                {t("delivery.policies")}
                            </Badge>

                            <div className="space-y-6 text-sm text-muted-foreground mt-3">

                                {/* Damage */}
                                <div>
                                    <p className="font-semibold">{t("delivery.damage.title")}</p>
                                    <p className={'my-2'}>{t("delivery.damage.desc")}</p>

                                    <ol className="list-disc px-5 space-y-2 pl-5">
                                        <li>{t("delivery.damage.step1")}</li>
                                        <li>{t("delivery.damage.step2")}</li>
                                    </ol>

                                    <p className="text-xs mt-2">
                                        {t("delivery.damage.result")}
                                    </p>
                                </div>

                                <hr />

                                {/* Return */}
                                <div>
                                    <p className="font-semibold">{t("delivery.return.title")}</p>
                                    <p className={'text-xs my-2'}>{t("delivery.return.desc")}</p>

                                    <p className="font-medium mt-2">{t("delivery.return.period")}</p>
                                    <p className={'text-xs my-2'}>{t("delivery.return.period.desc")}</p>

                                    <p className="font-medium my-2">{t("delivery.return.conditions")}</p>
                                    <ul className="list-disc pl-5 space-y-2 px-5">
                                        <li>{t("delivery.return.c1")}</li>
                                        <li>{t("delivery.return.c2")}</li>
                                        <li>{t("delivery.return.c3")}</li>
                                    </ul>

                                    <p className="font-medium my-2">{t("delivery.return.fees")}</p>
                                    <ul className="list-disc pl-5 space-y-2 px-5">
                                        <li>{t("delivery.return.f1")}</li>
                                        <li>{t("delivery.return.f2")}</li>
                                    </ul>

                                    <p className="font-medium my-2">{t("delivery.return.refund")}</p>
                                    <ul className="list-disc pl-5 space-y-2 px-5">
                                        <li>{t("delivery.return.r1")}</li>
                                        <li>{t("delivery.return.r2")}</li>
                                    </ul>

                                    <p className="text-xs mt-2">
                                        {t("delivery.return.note")}
                                    </p>
                                </div>

                                <hr />

                                {/* Support */}
                                <div>
                                    <p className="font-semibold">{t("delivery.support.title")}</p>
                                    <p className="text-xs">{t("delivery.support.desc")}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Contact */}
                        <Card className="p-6 rounded-2xl">
                            <Badge variant="secondary">
                                {t("delivery.contact")}
                            </Badge>

                            <p className="text-sm text-muted-foreground mt-3">
                                {t("delivery.contact.desc")}
                            </p>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryTerms;