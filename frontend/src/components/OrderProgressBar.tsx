import { Check, Package, Truck, Home, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

type UIStatus = "ordered" | "confirmed" | "shipped" | "delivered";

interface OrderProgressBarProps {
  status: UIStatus;
  onConfirmReceived?: () => void;
  isConfirmed: boolean;
  orderId: string;
}

export const OrderProgressBar = ({status, onConfirmReceived, isConfirmed, orderId,}: OrderProgressBarProps) => {
  const { language } = useLanguage();
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  const steps: { key: UIStatus; label: string; icon: any }[] = [
    {
      key: "ordered",
      label: language === "ar" ? "تم الطلب" : "Ordered",
      icon: Package,
    },
    {
      key: "confirmed",
      label: language === "ar" ? "تم التأكيد" : "Confirmed",
      icon: CheckCircle2,
    },
    {
      key: "shipped",
      label: language === "ar" ? "تم الشحن" : "Shipped",
      icon: Truck,
    },
    {
      key: "delivered",
      label: language === "ar" ? "تم الاستلام" : "Delivered",
      icon: Home,
    },
  ];

  const stepOrder: UIStatus[] = [
    "ordered",
    "confirmed",
    "shipped",
    "delivered",
  ];

  // 0 = ordered, 1 = confirmed, 2 = shipped, 3 = delivered
  let progressIndex = stepOrder.indexOf(status);

  // If the user has confirmed receipt or backend says delivered,
  // treat progress as fully completed.
  if (isConfirmed || status === "delivered") {
    progressIndex = steps.length - 1; // 3
  }

  if (progressIndex < 0) progressIndex = 0; // safety fallback

  const progressPercent =
      progressIndex === 0
          ? 0
          : (progressIndex / (steps.length - 1)) * 100;

  const getStepStatus = (stepKey: UIStatus) => {
    const index = stepOrder.indexOf(stepKey);
    // ✅ Everything up to current progressIndex is treated as completed
    if (index <= progressIndex) return "completed";
    return "pending";
  };

  return (
      <div className="w-full">
        {/* Background + progress bar */}
        <div className="relative w-full mb-4">
          {/* Full background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          {/* Filled progress line */}
          <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
          />

          {/* Steps */}
          <div className="relative flex items-center justify-between">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.key);
              const Icon = step.icon;

              return (
                  <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                  >
                    {/* Circle */}
                    <div
                        className={cn(
                            "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                            stepStatus === "completed" &&
                            "bg-primary border-primary text-primary-foreground",
                            stepStatus === "pending" &&
                            "bg-muted border-muted-foreground/30 text-muted-foreground"
                        )}
                    >
                      {stepStatus === "completed" ? (
                          <Check className="h-5 w-5" />
                      ) : (
                          <Icon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                        className={cn(
                            "mt-2 text-sm font-medium text-center",
                            stepStatus === "completed" && "text-primary",
                            stepStatus === "pending" && "text-muted-foreground"
                        )}
                    >
                  {step.label}
                </span>

                    {/* Confirm checkbox – only when shipped and not yet confirmed */}
                    {step.key === "delivered" &&
                        status === "shipped" &&
                        !isConfirmed && (
                            <div className="mt-2 flex items-center gap-2">
                              <Checkbox
                                  id={`confirm-${orderId}`}
                                  onCheckedChange={(checked) => {
                                    if (checked && onConfirmReceived) {
                                      onConfirmReceived();
                                    }
                                  }}
                              />
                              <label
                                  htmlFor={`confirm-${orderId}`}
                                  className="text-xs text-muted-foreground cursor-pointer"
                              >
                                {language === "ar"
                                    ? "تأكيد الاستلام"
                                    : "Confirm received"}
                              </label>
                            </div>
                        )}
                  </div>
              );
            })}
          </div>
        </div>

        {/* Warning about points */}
        {status === "shipped" && !isConfirmed && role === 'user' && (
            <div className="bg-secondary/50 border border-secondary rounded-lg p-3 mt-2">
              <p className="text-sm text-secondary-foreground text-center">
                {language === "ar"
                    ? "لن تحصل على نقاط الولاء حتى تؤكد استلام الطلب"
                    : "You will not receive loyalty points until you confirm you received the order."}
              </p>
            </div>
        )}
      </div>
  );
};
