import React, { createContext, useContext, useState, useEffect } from 'react';
import { tr } from '../locales/tr';
import { en } from '../locales/en';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  isTurkish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  tr,
  en,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('flowtask_lang') as Language;
    if (saved === 'tr' || saved === 'en') return saved;
    return 'tr'; // Default to Turkish
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('flowtask_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    const currentDict = translations[language];
    if (currentDict && key in currentDict) {
      return currentDict[key];
    }
    // Fallback to Turkish dictionary, then English, then defaultText or key
    if (translations.tr[key]) return translations.tr[key];
    if (translations.en[key]) return translations.en[key];
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTurkish: language === 'tr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
