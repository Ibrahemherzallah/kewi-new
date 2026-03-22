// src/contexts/LoyaltyContext.tsx
import React, {createContext, useContext, useState, useEffect, useCallback,} from "react";

const API_BASE = "https://kewi.ps"; // same as you use elsewhere

interface LoyaltyContextType {
    points: number;
    // now addPoints takes EARNED POINTS (from backend), not amount
    addPoints: (earnedPoints: number) => void;
    spendPoints: (pointsToSpend: number) => void; // 👈 NEW
    getDiscount: () => {
        percentage: number;
        type: "discount" | "free_product" | "none";
    };
    redeemFreeProduct: () => void;
    getNextMilestone: () => { pointsNeeded: number; reward: string } | null;
    canRedeemFreeProduct: boolean;
}

// Points calc helper (still used for UI potential)
const calculatePointsFromPurchase = (amount: number): number =>
    Math.floor(amount / 50) * 2;

const calculateDiscount = (points: number): { percentage: number; type: "discount" | "free_product" | "none" } => {
    if (points >= 100) {
        return { percentage: 100, type: "free_product" };
    }
    if (points >= 30) {
        const extraPoints = points - 30;
        return {percentage: 30, type: "discount"}
    }
    if (points >= 25) {
        const extraPoints = points - 25;
        return {percentage: 25, type: "discount"}
    }
    if (points >= 20) {
        const extraPoints = points - 20;
        return {percentage: 20, type: "discount"}
    }
    return { percentage: 0, type: "none" };
}


const LoyaltyContext = createContext<LoyaltyContextType | undefined>(
    undefined
);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({children,}) => {
    const [points, setPoints] = useState<number>(0);
    const spendPoints = useCallback((pointsToSpend: number) => {
        if (!pointsToSpend || pointsToSpend <= 0) return;
        setPoints((prev) => Math.max(0, prev - pointsToSpend));
    }, []);
    // 🔹 Fetch points from backend when app loads
    useEffect(() => {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const fetchMe = async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/api/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                setPoints(data.loyaltyPoints ?? 0);
            } catch (err) {
                console.error("Failed to load user info", err);
            }
        };

        fetchMe();
    }, []);

    // 🔹 addPoints just applies what backend says we earned
    const addPoints = useCallback((earnedPoints: number) => {
        if (!earnedPoints || earnedPoints <= 0) return;
        setPoints((prev) => prev + earnedPoints);
    }, []);

    const getDiscount = useCallback(() => calculateDiscount(points), [points]);

    const redeemFreeProduct = useCallback(() => {
        if (points >= 100) {
            setPoints((prev) => prev - 100);
            // (optional) also call backend to persist redemption
        }
    }, [points]);

    const getNextMilestone = useCallback(() => {
        // Already at or above free product threshold
        if (points >= 100) {
            return null;
        }

        // Below first discount
        if (points < 20) {
            return { pointsNeeded: 20 - points, reward: "20% discount" };
        }

        // Between 20 and 24 → next is 25% at 25 points
        if (points < 25) {
            return { pointsNeeded: 25 - points, reward: "25% discount" };
        }

        // Between 25 and 29 → next is 30% at 30 points
        if (points < 30) {
            return { pointsNeeded: 30 - points, reward: "30% discount" };
        }

        // Between 30 and 99 → next is free product at 100 points
        return { pointsNeeded: 100 - points, reward: "Free product" };
    }, [points]);

    return (
        <LoyaltyContext.Provider
            value={{
                points,
                addPoints,
                spendPoints,
                getDiscount,
                redeemFreeProduct,
                getNextMilestone,
                canRedeemFreeProduct: points >= 100,
            }}
        >
            {children}
        </LoyaltyContext.Provider>
    );
};

export const useLoyalty = () => {
    const ctx = useContext(LoyaltyContext);
    if (!ctx) {
        throw new Error("useLoyalty must be used within LoyaltyProvider");
    }
    return ctx;
};

// Still useful for “you will earn X points” messages
export const calculatePotentialPoints = (amount: number): number =>
    calculatePointsFromPurchase(amount);
