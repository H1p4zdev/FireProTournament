import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  defaultLanguage = 'en' 
}: { 
  children: ReactNode; 
  defaultLanguage?: Language 
}) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language | null;
      return saved === 'en' || saved === 'bn' ? saved : defaultLanguage;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Simple translation function
  const t = (key: string): string => {
    try {
      // Split the key by dots to access nested properties
      const keyParts = key.split('.');
      let translation: any = translations[language];
      
      for (const part of keyParts) {
        if (translation && translation[part]) {
          translation = translation[part];
        } else {
          return key; // Key not found
        }
      }
      
      return translation || key;
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}