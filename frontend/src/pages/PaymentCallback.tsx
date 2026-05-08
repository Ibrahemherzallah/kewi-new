import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {useLanguage} from "@/contexts/LanguageContext.tsx";
const PaymentCallback = ({updateCart, setCheckoutOpen, setFreeProductId, setApplyDiscount, setFormData, setSelectedRegion, setSelectedType, setDeliveryPrice}) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { toast } = useToast();
    useEffect(() => {
        const reference = new URLSearchParams(window.location.search).get("reference");

        if (!reference) {
            navigate("/cart");
            return;
        }

        const verifyPayment = async () => {
            try {
                const pendingOrder = localStorage.getItem("pendingOrder");

                if (!pendingOrder) {
                    throw new Error("Order data missing");
                }

                const purchaseBody = JSON.parse(pendingOrder);

                const res = await fetch(
                    `${import.meta.env.VITE_ENV}/user/api/payments/lahza/verify`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            reference,
                            purchaseBody,
                        }),
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Verification failed");
                }

                // ✅ SUCCESS FLOW
                toast({
                    title: t('toast.suc.paymentSuccess'),
                    description: t('toast.suc.paymentSuccess')
                });
                // mark success
                localStorage.setItem("paymentSuccess", "true");

                localStorage.removeItem("pendingOrder");

                navigate("/cart");
            } catch (err) {
                console.error(err);

                toast({
                    title: t('toast.err.paymentErr'),
                    description: t('toast.err.paymentErr.desc'),
                    variant: "destructive",
                });

                navigate("/cart");
            }
        };

        verifyPayment();
    }, [navigate]);

    return <div>{t('payment.verifying')}</div>;
};

export default PaymentCallback;