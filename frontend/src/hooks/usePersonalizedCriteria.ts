"use client";

import { useState, useEffect, useCallback } from "react";

export interface UserCareerCriteria {
  departments: string[]; // YOK_ATLAS_DEPARTMENTS ids (e.g. 'bilisim', 'muhendislik')
  cities: string[]; // Empty means all Turkey / no city restriction
  postTypes: string[]; // e.g. ['memur', 'sozlesmeli']
  educationLevel?: string; // 'lisans' | 'onlisans' | 'ortaogretim' | ''
  includeNoKpss: boolean;
  updatedAt?: string;
}

const CRITERIA_KEY = "kamu_user_career_criteria";
const CRITERIA_EVENT = "kamu_criteria_updated";

export function usePersonalizedCriteria() {
  const [criteria, setCriteria] = useState<UserCareerCriteria | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  const loadCriteria = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(CRITERIA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          typeof parsed === "object" &&
          (Array.isArray(parsed.departments) || Array.isArray(parsed.cities) || Array.isArray(parsed.postTypes))
        ) {
          setCriteria({
            departments: Array.isArray(parsed.departments) ? parsed.departments : [],
            cities: Array.isArray(parsed.cities) ? parsed.cities : [],
            postTypes: Array.isArray(parsed.postTypes) ? parsed.postTypes : [],
            educationLevel: parsed.educationLevel || "",
            includeNoKpss: parsed.includeNoKpss !== false,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
          });
        } else {
          setCriteria(null);
        }
      } else {
        setCriteria(null);
      }
    } catch (e) {
      console.warn("Kullanıcı kariyer kriterleri okunamadı:", e);
      setCriteria(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadCriteria();

    const handleStorageChange = () => {
      loadCriteria();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CRITERIA_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CRITERIA_EVENT, handleStorageChange);
    };
  }, [loadCriteria]);

  // Save criteria to LocalStorage
  const saveCriteria = useCallback((newCriteria: UserCareerCriteria) => {
    const dataWithTimestamp = {
      ...newCriteria,
      updatedAt: new Date().toISOString(),
    };
    setCriteria(dataWithTimestamp);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CRITERIA_KEY, JSON.stringify(dataWithTimestamp));
        window.dispatchEvent(new Event(CRITERIA_EVENT));
      } catch (e) {
        console.warn("Kriterler kaydedilemedi:", e);
      }
    }
  }, []);

  // Clear criteria from LocalStorage
  const clearCriteria = useCallback(() => {
    setCriteria(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(CRITERIA_KEY);
        window.dispatchEvent(new Event(CRITERIA_EVENT));
      } catch (e) {
        console.warn("Kriterler silinemedi:", e);
      }
    }
  }, []);

  // Set sample default profile for quick trial
  const setSampleCriteria = useCallback(() => {
    const sample: UserCareerCriteria = {
      departments: ["bilisim", "muhendislik"],
      cities: [], // Tüm Türkiye
      postTypes: ["memur", "sozlesmeli"],
      educationLevel: "lisans",
      includeNoKpss: true,
      updatedAt: new Date().toISOString(),
    };
    saveCriteria(sample);
  }, [saveCriteria]);

  // Check if criteria has actual meaningful filter selections
  const isConfigured = Boolean(
    criteria &&
      (criteria.departments.length > 0 ||
        criteria.cities.length > 0 ||
        criteria.postTypes.length > 0 ||
        Boolean(criteria.educationLevel))
  );

  return {
    criteria,
    isLoaded,
    isConfigured,
    saveCriteria,
    clearCriteria,
    setSampleCriteria,
    reloadCriteria: loadCriteria,
  };
}
