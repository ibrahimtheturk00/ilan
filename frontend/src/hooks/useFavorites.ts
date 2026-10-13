"use client";

import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "kpi_favorite_jobs";
const FAVORITES_EVENT = "kpi_favorites_updated";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // LocalStorage'dan favorileri yükle
  const loadFavorites = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed.map(Number).filter((n) => !isNaN(n)));
        }
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.warn("Favoriler okunamadı:", e);
      setFavorites([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(FAVORITES_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(FAVORITES_EVENT, handleStorageChange);
    };
  }, [loadFavorites]);

  const saveFavorites = (newFavs: number[]) => {
    setFavorites(newFavs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
        window.dispatchEvent(new Event(FAVORITES_EVENT));
      } catch (e) {
        console.warn("Favoriler kaydedilemedi:", e);
      }
    }
  };

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id];
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event(FAVORITES_EVENT));
          } catch (e) {
            console.warn("Favori güncellenemedi:", e);
          }
        }
        return next;
      });
    },
    []
  );

  const addFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(FAVORITES_EVENT));
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.filter((item) => item !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(FAVORITES_EVENT));
      }
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, []);

  return {
    favorites,
    isLoaded,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
