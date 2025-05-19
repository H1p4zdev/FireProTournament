import { mockTranslations } from '../translations/mock';

export function useLanguage() {
  // Simple translation function using mock translations
  const t = (key: string): string => {
    try {
      // Split the key by dots to access nested properties
      const keyParts = key.split('.');
      let translation: any = mockTranslations;
      
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

  return {
    language: 'en',
    setLanguage: () => {},
    t
  };
}