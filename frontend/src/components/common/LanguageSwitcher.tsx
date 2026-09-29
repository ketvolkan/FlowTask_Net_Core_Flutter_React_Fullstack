import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
            language === 'tr'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Türkçe"
        >
          <span>🇹🇷</span>
          <span>TR</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="English"
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-200">
      <div className="flex items-center gap-2 pl-1 text-xs font-semibold text-slate-600">
        <Globe className="h-4 w-4 text-slate-400" />
        <span>Dil / Language</span>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-0.5">
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold transition-all ${
            language === 'tr'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🇹🇷</span>
          <span>TR</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold transition-all ${
            language === 'en'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    </div>
  );
};
