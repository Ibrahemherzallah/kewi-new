import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Calendar, CreditCard, Star, Gift } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { LoyaltyCard } from "@/components/LoyaltyCard";
import { useLoyalty, calculatePotentialPoints } from "@/contexts/LoyaltyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Purchase {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'placed' | 'shipped' | 'delivered';
  isConfirmed: boolean;
  pointsEarned: number;
}

const mockPurchases: Purchase[] = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    items: [
      { name: "Luxury Leather Handbag", quantity: 1, price: 129.99 },
      { name: "Designer Sunglasses", quantity: 1, price: 49.99 },
    ],
    total: 179.98,
    status: "delivered",
    isConfirmed: false,
    pointsEarned: 0
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    items: [
      { name: "Travel Duffle Bag", quantity: 1, price: 89.99 },
    ],
    total: 89.99,
    status: "shipped",
    isConfirmed: false,
    pointsEarned: 0
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    items: [
      { name: "Modern Backpack", quantity: 2, price: 69.99 },
      { name: "Leather Wallet", quantity: 1, price: 34.99 },
    ],
    total: 174.97,
    status: "delivered",
    isConfirmed: true,
    pointsEarned: 6
  },
];

const PurchaseHistory = () => {
  const { language } = useLanguage();
  const { addPoints } = useLoyalty();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);

  const handleConfirmReceived = (orderId: string) => {
    setPurchases(prev => prev.map(purchase => {
      if (purchase.id === orderId) {
        const pointsEarned = calculatePotentialPoints(purchase.total);
        addPoints(purchase.total);
        
        toast({
          title: language === 'ar' ? 'تم تأكيد الاستلام!' : 'Order Confirmed!',
          description: language === 'ar' 
            ? `حصلت على ${pointsEarned} نقطة ولاء`
            : `You earned ${pointsEarned} loyalty points!`,
        });
        
        return { 
          ...purchase, 
          isConfirmed: true, 
          pointsEarned 
        };
      }
      return purchase;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {language === 'ar' ? 'سجل المشتريات' : 'Purchase History'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'تتبع طلباتك واكسب نقاط الولاء'
              : 'Track your orders and earn loyalty points'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Loyalty Card Sidebar */}
          <div className="lg:col-span-1">
            <LoyaltyCard />
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2 space-y-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{purchase.id}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(purchase.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {purchase.isConfirmed && purchase.pointsEarned > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        +{purchase.pointsEarned} pts
                      </Badge>
                    )}
                    <Badge variant={purchase.isConfirmed ? "default" : "secondary"}>
                      {purchase.isConfirmed 
                        ? (language === 'ar' ? 'مكتمل' : 'Completed')
                        : (language === 'ar' ? 'قيد التتبع' : 'In Progress')
                      }
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <OrderProgressBar
                    status={purchase.status}
                    isConfirmed={purchase.isConfirmed}
                    orderId={purchase.id}
                    onConfirmReceived={() => handleConfirmReceived(purchase.id)}
                  />
                </div>

                {/* Potential Points Display */}
                {!purchase.isConfirmed && purchase.status === 'delivered' && (
                  <div className="mb-4 flex items-center gap-2 text-sm bg-primary/10 rounded-lg p-3">
                    <Gift className="h-4 w-4 text-primary" />
                    <span>
                      {language === 'ar'
                        ? `ستحصل على ${calculatePotentialPoints(purchase.total)} نقطة عند تأكيد الاستلام`
                        : `You'll earn ${calculatePotentialPoints(purchase.total)} points when you confirm delivery`
                      }
                    </span>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ar' ? 'المنتج' : 'Item'}</TableHead>
                      <TableHead>{language === 'ar' ? 'الكمية' : 'Quantity'}</TableHead>
                      <TableHead>{language === 'ar' ? 'السعر' : 'Price'}</TableHead>
                      <TableHead>{language === 'ar' ? 'المجموع' : 'Subtotal'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchase.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">{language === 'ar' ? 'مدفوع' : 'Paid'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الإجمالي' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-primary">${purchase.total.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
