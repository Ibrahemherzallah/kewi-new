// src/hooks/useFavorites.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type ApiProduct = {
    _id: string;
    id?: string; // internal display ID
    name: string | { [key: string]: string };
    description?: string | { [key: string]: string };
    image?: string[] | string;
    categoryId?: any;
    brandId?: any;
    customerPrice?: number;
    wholesalerPrice?: number;
    salePrice?: number | null;
    stockNumber?: number;
    barcode?: string;
    properties?: Record<string, string>;
    isSoldOut?: boolean;
    isOnSale?: boolean;
    isSoon?: boolean;
    isMultiColor?: boolean;
    variants?: any;
};

type FavoriteProduct = ApiProduct;

interface FavoritesContextValue {
    favorites: FavoriteProduct[];
    toggleFavorite: (product: FavoriteProduct) => void;
    isFavorite: (productId: string) => boolean;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
    undefined
);

const STORAGE_KEY = "favorites";

function loadFavoritesFromStorage(): FavoriteProduct[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);

        // Legacy support: if old version stored only ids as strings
        if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "string") {
            // you can either ignore them or map them later from products list
            return [];
        }

        if (Array.isArray(parsed)) {
            return parsed;
        }

        return [];
    } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        return [];
    }
}

function saveFavoritesToStorage(favorites: FavoriteProduct[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error("Failed to save favorites", e);
    }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                               children,
                                                                           }) => {
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

    useEffect(() => {
        setFavorites(loadFavoritesFromStorage());
    }, []);

    const toggleFavorite = (product: FavoriteProduct) => {
        const productId = (product as any)._id || (product as any).id;
        if (!productId) return;

        setFavorites((prev) => {
            const exists = prev.some(
                (p) => (p as any)._id === productId || (p as any).id === productId
            );

            let next: FavoriteProduct[];

            if (exists) {
                next = prev.filter(
                    (p) => (p as any)._id !== productId && (p as any).id !== productId
                );
            } else {
                next = [...prev, product];
            }

            saveFavoritesToStorage(next);
            return next;
        });
    };

    const isFavorite = (productId: string) => {
        if (!productId) return false;
        return favorites.some(
            (p) => (p as any)._id === productId || (p as any).id === productId
        );
    };

    const clearFavorites = () => {
        setFavorites([]);
        saveFavoritesToStorage([]);
    };

    return (
        <FavoritesContext.Provider
            value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const ctx = useContext(FavoritesContext);
    if (!ctx) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return ctx;
};
