import { Gift, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLoyalty } from "@/contexts/LoyaltyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export const LoyaltyCard = () => {
  const { points, getDiscount, getNextMilestone, canRedeemFreeProduct } = useLoyalty();
  const { language } = useLanguage();
  const discount = getDiscount();
  const nextMilestone = getNextMilestone();

  const getProgressToNext = () => {
    if (points >= 100) return 100;
    if (points < 20) return (points / 20) * 100;
    
    // Calculate progress within current 5-point bracket
    const pointsAbove20 = points - 20;
    const currentBracket = Math.floor(pointsAbove20 / 5) * 5;
    const nextBracket = currentBracket + 5;
    const progressInBracket = pointsAbove20 - currentBracket;
    return (progressInBracket / 5) * 100;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-primary">{points}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'النقاط المتوفرة' : 'Available Points'}
            </p>
          </div>
        {canRedeemFreeProduct && (
          <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Gift className="h-3 w-3 mr-1" />
            {language === 'ar' ? 'منتج مجاني!' : 'Free Product!'}
          </Badge>
        )}
      </div>

        {/* Current reward status */}
        {discount.type !== 'none' && (
          <div className="bg-background/60 rounded-lg p-3">
            <p className="text-sm font-medium">
              {language === 'ar' ? 'خصمك الحالي:' : 'Your current discount:'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {discount.type === 'free_product' 
                ? (language === 'ar' ? 'منتج مجاني!' : 'Free Product!')
                : `${discount.percentage}%`
              }
            </p>
          </div>
        )}

        {/* Next milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                {language === 'ar' ? 'المكافأة القادمة' : 'Next Reward'}
              </span>
              <span className="font-medium">{nextMilestone.reward}</span>
            </div>
            <Progress value={getProgressToNext()} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {language === 'ar' 
                ? `تحتاج ${nextMilestone.pointsNeeded} نقطة للحصول على ${nextMilestone.reward}`
                : `${nextMilestone.pointsNeeded} points to unlock ${nextMilestone.reward}`
              }
            </p>
          </div>
        )}

        {/* Points earning info */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 text-center">
          {language === 'ar' 
            ? 'اكسب 2 نقطة لكل 50 شيكل تنفقها'
            : 'Earn 2 points for every 50 shekels spent'
          }
        </div>
      </CardContent>
    </Card>
  );
};
