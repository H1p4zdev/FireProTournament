import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { translations, LanguageKey } from "@/lib/locale";

interface LanguageContextType {
  currentLanguage: LanguageKey;
  toggleLanguage: () => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element {
  // Default to English, but try to read from localStorage
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as LanguageKey | null;
      return saved === "bn" ? "bn" : "en"; // Default to English if not set or invalid
    }
    return "en";
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", currentLanguage);
    }
  }, [currentLanguage]);

  // Toggle between available languages
  const toggleLanguage = () => {
    setCurrentLanguage(currentLanguage === "en" ? "bn" : "en");
  };

  // Translate a key
  const t = (key: string, variables?: Record<string, string>) => {
    // Use type assertion to avoid the indexing issue
    const translationObj = translations[currentLanguage];
    const translation = key in translationObj ? 
      (translationObj as any)[key] : key;
    
    if (variables) {
      return Object.entries(variables).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, "g"), value),
        translation
      );
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
