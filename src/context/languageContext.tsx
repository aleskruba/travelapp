import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Language } from '../types'; // Import the Language type

// Define the shape of the context value
interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void; // Use Language type instead of string
}

// Create the context with a default undefined value
export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(localStorage.getItem('language') as Language || 'en'); // Type the initial value

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for consuming the context
export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
