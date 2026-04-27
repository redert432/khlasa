import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../lib/i18n';
import { getSettings, saveSettings } from '../lib/storage';

interface LanguageContextType {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  t: typeof translations.en;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState(getSettings());
  
  useEffect(() => {
    // Initial application of settings
    const currentSettings = getSettings();
    setSettingsState(currentSettings);
  }, []);

  const setLanguage = (lang: Language) => {
    setSettingsState(prev => {
      const updated = { ...prev, appLanguage: lang };
      saveSettings(updated);
      return updated;
    });
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettingsState(prev => {
      const updated = { ...prev, theme };
      saveSettings(updated);
      return updated;
    });
  };

  const language = settings.appLanguage;
  const theme = settings.theme;
  const t = translations[language];
  const dir = t.dir as 'ltr' | 'rtl';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Apply theme
    const applyTheme = (t: string) => {
      const resolved = t === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : t;
      document.documentElement.setAttribute('data-theme', resolved);
    };
    applyTheme(theme);
  }, [dir, language, theme]);

  return (
    <LanguageContext.Provider value={{ language, theme, setLanguage, setTheme, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
