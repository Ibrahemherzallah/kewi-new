import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LoyaltyContextType {
  points: number;
  addPoints: (purchaseAmount: number) => void;
  getDiscount: () => { percentage: number; type: 'discount' | 'free_product' | 'none' };
  redeemFreeProduct: () => void;
  getNextMilestone: () => { pointsNeeded: number; reward: string } | null;
  canRedeemFreeProduct: boolean;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

// Points calculation: For every 50 shekels, earn 2 points
const calculatePointsFromPurchase = (amount: number): number => {
  return Math.floor(amount / 50) * 2;
};

// Discount calculation based on points
const calculateDiscount = (points: number): { percentage: number; type: 'discount' | 'free_product' | 'none' } => {
  if (points >= 100) {
    return { percentage: 100, type: 'free_product' };
  }
  if (points >= 20) {
    // Base 20% + 5% for every 5 points above 20
    const extraPoints = points - 20;
    const extraDiscount = Math.floor(extraPoints / 5) * 5;
    return { percentage: Math.min(20 + extraDiscount, 95), type: 'discount' };
  }
  return { percentage: 0, type: 'none' };
};

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('loyaltyPoints');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('loyaltyPoints', points.toString());
  }, [points]);

  const addPoints = useCallback((purchaseAmount: number) => {
    const earnedPoints = calculatePointsFromPurchase(purchaseAmount);
    setPoints(prev => prev + earnedPoints);
    return earnedPoints;
  }, []);

  const getDiscount = useCallback(() => {
    return calculateDiscount(points);
  }, [points]);

  const redeemFreeProduct = useCallback(() => {
    if (points >= 100) {
      setPoints(prev => prev - 100);
    }
  }, [points]);

  const getNextMilestone = useCallback((): { pointsNeeded: number; reward: string } | null => {
    if (points >= 100) {
      return null; // Already at max
    }
    if (points < 20) {
      return { pointsNeeded: 20 - points, reward: '20% discount' };
    }
    // Calculate next 5-point milestone
    const nextMilestone = Math.ceil((points - 20) / 5) * 5 + 20 + 5;
    if (nextMilestone >= 100) {
      return { pointsNeeded: 100 - points, reward: 'Free product' };
    }
    const currentDiscount = 20 + Math.floor((points - 20) / 5) * 5;
    return { pointsNeeded: nextMilestone - points, reward: `${currentDiscount + 5}% discount` };
  }, [points]);

  return (
    <LoyaltyContext.Provider value={{
      points,
      addPoints,
      getDiscount,
      redeemFreeProduct,
      getNextMilestone,
      canRedeemFreeProduct: points >= 100
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within LoyaltyProvider');
  }
  return context;
};

// Helper to calculate points from order (for display purposes)
export const calculatePotentialPoints = (amount: number): number => {
  return calculatePointsFromPurchase(amount);
};
