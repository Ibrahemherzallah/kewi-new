import { Check, Package, Truck, Home } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderProgressBarProps {
  status: 'placed' | 'shipped' | 'delivered';
  onConfirmReceived?: () => void;
  isConfirmed: boolean;
  orderId: string;
}

export const OrderProgressBar = ({ 
  status, 
  onConfirmReceived, 
  isConfirmed,
  orderId 
}: OrderProgressBarProps) => {
  const { language } = useLanguage();
  
  const steps = [
    { 
      key: 'placed', 
      label: language === 'ar' ? 'تم الطلب' : 'Order Placed', 
      icon: Package 
    },
    { 
      key: 'shipped', 
      label: language === 'ar' ? 'تم الشحن' : 'Order Shipped', 
      icon: Truck 
    },
    { 
      key: 'delivered', 
      label: language === 'ar' ? 'تم الاستلام' : 'Order Received', 
      icon: Home 
    },
  ];

  const getStepStatus = (stepKey: string) => {
    const stepOrder = ['placed', 'shipped', 'delivered'];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(stepKey);
    
    if (stepKey === 'delivered') {
      return isConfirmed ? 'completed' : (currentIndex >= stepIndex ? 'current' : 'pending');
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute top-5 h-0.5 w-full -translate-x-1/2",
                    stepStatus === 'completed' || getStepStatus(steps[index - 1].key) === 'completed'
                      ? "bg-primary" 
                      : "bg-muted"
                  )}
                  style={{ left: '-50%', right: '50%', width: '100%' }}
                />
              )}
              
              {/* Step circle */}
              <div
                className={cn(
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  stepStatus === 'completed' && "bg-primary border-primary text-primary-foreground",
                  stepStatus === 'current' && "bg-background border-primary text-primary",
                  stepStatus === 'pending' && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {stepStatus === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              
              {/* Step label */}
              <span className={cn(
                "mt-2 text-sm font-medium text-center",
                stepStatus === 'completed' && "text-primary",
                stepStatus === 'current' && "text-foreground",
                stepStatus === 'pending' && "text-muted-foreground"
              )}>
                {step.label}
              </span>
              
              {/* Confirm checkbox for delivered step */}
              {step.key === 'delivered' && status === 'delivered' && !isConfirmed && (
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
                    {language === 'ar' ? 'تأكيد الاستلام' : 'Confirm received'}
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Points warning message */}
      {status === 'delivered' && !isConfirmed && (
        <div className="bg-secondary/50 border border-secondary rounded-lg p-3 mt-4">
          <p className="text-sm text-secondary-foreground text-center">
            {language === 'ar' 
              ? 'لن تحصل على نقاط الولاء حتى تؤكد استلام الطلب'
              : 'You will not receive loyalty points until you confirm you received the order.'}
          </p>
        </div>
      )}
    </div>
  );
};
