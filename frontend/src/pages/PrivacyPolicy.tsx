import {useLanguage} from "@/contexts/LanguageContext.tsx";
import {Navbar} from "@/components/Navbar.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";


const PrivacyPolicy = () => {
    const { t,language } = useLanguage();
    const isAr = language === "ar";
    return(
        <div className="min-h-screen bg-background">
            <Navbar cartCount={0} />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold">
                            {t("privacy.header")}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t("privacy.header.desc")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.infoCollect")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.infoCollect.desc")}
                                </p>
                            </div>
                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <ul className="text-start list-disc px-5 space-y-1">
                                    <li>
                                        {t("privacy.infoCollect.fullName")}
                                    </li>
                                    <li>
                                        {t("privacy.infoCollect.phoneNum")}
                                    </li>
                                    <li>
                                        {t("privacy.infoCollect.address")}
                                    </li>
                                    <li>
                                        {t("privacy.infoCollect.orderDetails")}
                                    </li>
                                </ul>
                            </div>
                        </Card>
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.howUseInfo")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.howUseInfo.desc")}
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <div>
                                    <ul className="text-start list-disc px-5 space-y-1">
                                        <li>{t("privacy.howUseInfo.orderProcess")}</li>
                                        <li>{t("privacy.howUseInfo.contact")}</li>
                                        <li>{t("privacy.howUseInfo.ux")}</li>
                                        <li>{t("privacy.howUseInfo.sendNotification")}</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.electronicPayment")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.electronicPayment.desc")}
                                </p>
                            </div>
                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <div>
                                    <ul className="text-start list-disc px-5 space-y-1">
                                        <li>{t("privacy.electronicPayment.weDontStoreCardInfo")}</li>
                                        <li>{t("privacy.electronicPayment.paymentDoneEncryption")}</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>


                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.dataProtection")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.dataProtection.desc")}
                                </p>
                            </div>
                             <div className="space-y-4 text-sm text-muted-foreground text-right">
                                 <div>
                                     <ul className="text-start list-disc px-5 space-y-1">
                                         <li>{t("privacy.dataProtection.unauthorized")}</li>
                                         <li>{t("privacy.dataProtection.edit")}</li>
                                         <li>{t("privacy.dataProtection.illegal")}</li>
                                     </ul>
                                 </div>
                             </div>
                        </Card>


                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.dataShare")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.dataShare.desc")}
                                </p>
                            </div>
                             <div className="space-y-4 text-sm text-muted-foreground text-right">
                                 <div>
                                     <ul className="text-start list-disc px-5 space-y-1">
                                         <li>{t("privacy.dataShare.shippingCompanies")}</li>
                                         <li>{t("privacy.dataShare.serviceProviders")}</li>
                                     </ul>
                                 </div>
                             </div>
                        </Card>


                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.cookies")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.cookies.desc")}
                                </p>
                            </div>
                            <div className="space-y-4 text-sm text-muted-foreground text-right" >
                                <div>
                                    <ul className="text-start list-disc px-5 space-y-1">
                                        <li>{t("privacy.cookies.savePreferences")}</li>
                                        <li>{t("privacy.cookies.analysis")}</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.userRights")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.userRights.desc")}
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-muted-foreground text-right">
                                <div>
                                    <ul className="text-start list-disc px-5 space-y-1">
                                        <li>{t("privacy.userRights.requireEdit")}</li>
                                        <li>{t("privacy.userRights.requireDelete")}</li>
                                        <li>{t("privacy.userRights.requireQuestion")}</li>
                                    </ul>
                                </div>
                                <p className="text-start text-muted-foreground">
                                    {t("privacy.userRights.youCanContact")}
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.EditPolicies")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.EditPolicies.desc")}
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 rounded-2xl">
                            <div className="flex flex-col gap-2 mb-3">
                                <h1 className="text-2xl font-bold">
                                    {t("privacy.contactUs")}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t("privacy.contactUs.desc")}
                                </p>
                            </div>

                            <div
                                className={`space-y-4 text-sm text-muted-foreground ${
                                    isAr ? "text-right" : ""
                                }`}
                                dir={isAr ? "rtl" : "ltr"}
                            >
                                <div>
                                    <ul className={`list-disc ${isAr ? "pr-5" : "pl-5"} space-y-1`}>
                                        <li>
                                            {t("privacy.contactUs.email")} kewi.group1@gmail.com
                                        </li>
                                        <li>
                                            {t("privacy.contactUs.phone")} +972599128813
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        <p className="text-muted-foreground">
                            {t("privacy.lastUpdate")}
                        </p>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy;