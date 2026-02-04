import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Use your real type here if you have it
// import type { ApiProduct } from "@/types";
type FavoriteProduct = any;

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  addFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: FavoriteProduct) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
    undefined
);

const STORAGE_KEY = "favorites";

const getId = (productOrId: FavoriteProduct | string): string | undefined => {
  if (!productOrId) return undefined;
  if (typeof productOrId === "string") return productOrId;
  return (productOrId as any)._id || (productOrId as any).id;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                             children,
                                                                           }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);

      // Old: ["id1", "id2", ...] – we can just ignore/migrate later
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return [];
      }

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [favorites]);

  const addFavorite = useCallback((product: FavoriteProduct) => {
    const productId = getId(product);
    if (!productId) return;

    setFavorites((prev) => {
      const exists = prev.some((p) => getId(p) === productId);
      if (exists) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((p) => getId(p) !== productId));
  }, []);

  const toggleFavorite = useCallback((product: FavoriteProduct) => {
    const productId = getId(product);
    if (!productId) return;

    setFavorites((prev) => {
      const exists = prev.some((p) => getId(p) === productId);
      if (exists) {
        return prev.filter((p) => getId(p) !== productId);
      }
      return [...prev, product];
    });
  }, []);

  const isFavorite = useCallback(
      (productId: string) => {
        if (!productId) return false;
        return favorites.some((p) => getId(p) === productId);
      },
      [favorites]
  );

  return (
      <FavoritesContext.Provider
          value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}
      >
        {children}
      </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
};
