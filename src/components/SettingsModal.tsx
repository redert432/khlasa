import React, { useState } from 'react';
import { X, Globe, Moon, Sun, Monitor, Check } from 'lucide-react';
import { useI18n } from './LanguageContext';
import { Language, translations } from '../lib/i18n';
import { getSettings, saveSettings } from '../lib/storage';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { language, setLanguage, theme, setTheme, t } = useI18n();
  const [tempLang, setTempLang] = useState<Language>(language);
  const [tempTheme, setTempTheme] = useState(theme);

  const handleSave = () => {
    setLanguage(tempLang);
    setTheme(tempTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-theme-surface-lg w-full max-w-md rounded-3xl shadow-2xl border border-theme-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-theme-border flex justify-between items-center bg-theme-surface-sm">
          <h2 className="text-xl font-bold text-theme-text-primary flex items-center gap-2">
            {t.settings}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-theme-border rounded-full transition-colors">
            <X className="w-5 h-5 text-theme-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Language Selection */}
          <section>
            <label className="block text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-4 px-1">
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(translations) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTempLang(lang)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    tempLang === lang 
                      ? 'bg-theme-accent/10 border-theme-accent text-theme-accent shadow-sm' 
                      : 'bg-theme-surface-sm border-theme-border text-theme-text-secondary hover:border-theme-text-secondary/30'
                  }`}
                >
                  <span className="font-medium">{translations[lang].name}</span>
                  {tempLang === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <label className="block text-xs font-bold text-theme-text-secondary uppercase tracking-wider mb-4 px-1">
              {t.theme}
            </label>
            <div className="flex bg-theme-surface-sm p-1 rounded-2xl border border-theme-border">
              {[
                { id: 'light', icon: Sun, label: t.light },
                { id: 'dark', icon: Moon, label: t.dark },
                { id: 'system', icon: Monitor, label: t.system }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTempTheme(item.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                    tempTheme === item.id 
                      ? 'bg-theme-surface-lg text-theme-accent shadow-sm border border-theme-border' 
                      : 'text-theme-text-secondary hover:bg-theme-surface-lg/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-theme-surface-sm border-t border-theme-border flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-theme-text-secondary hover:bg-theme-border transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-theme-accent text-theme-bg shadow-sm shadow-theme-accent/20 hover:bg-theme-accent-dark transition-colors"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
