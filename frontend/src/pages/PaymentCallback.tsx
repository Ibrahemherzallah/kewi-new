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
                    "https://kewi.ps/user/api/payments/lahza/verify",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            reference,
                            purchaseBody,
                        }),
                    }
                );
                console.log("res is: " , res);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Verification failed");
                }

                // ✅ SUCCESS FLOW
                toast({
                    title: language === "ar" ? "تمت عملية الدفع بنجاح." : "Payment successful",
                    description:
                        language === "ar"
                            ? "تم تقديم طلبك بنجاح."
                            : "Your order has been placed successfully.",
                });
                // mark success
                localStorage.setItem("paymentSuccess", "true");

                localStorage.removeItem("pendingOrder");

                navigate("/cart");
            } catch (err) {
                console.error(err);

                toast({
                    title: language === "ar" ? "فشل الدفع" : "Payment failed",
                    description:
                        language === "ar"
                            ? "لم تكتمل عملية الدفع."
                            : "Payment was not completed.",
                    variant: "destructive",
                });

                navigate("/cart");
            }
        };

        verifyPayment();
    }, [navigate]);

    return <div>Verifying payment...</div>;
};

export default PaymentCallback;