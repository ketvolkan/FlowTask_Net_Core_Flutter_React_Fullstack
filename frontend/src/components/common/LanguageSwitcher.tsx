import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
  className = '',
}) => {
  const { language, setLanguage, t } = useLanguage();

  if (compact) {
    return (
      <div
        className={`flex flex-col items-center gap-1 rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-2xs ${className}`}
      >
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`flex items-center justify-center gap-1 w-11 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'tr'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
          title="Türkçe"
        >
          <span className="text-xs">🇹🇷</span>
          <span className="text-[10px] font-extrabold tracking-wider">TR</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center justify-center gap-1 w-11 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-500/20'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
          title="English"
        >
          <span className="text-xs">🇬🇧</span>
          <span className="text-[10px] font-extrabold tracking-wider">EN</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-slate-50 p-2 border border-slate-200/80 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2 pl-1.5 text-xs font-semibold text-slate-600 truncate min-w-0">
        <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
        <span className="truncate">{t('lang.switch', 'Dil / Language')}</span>
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-0.5 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
            language === 'tr'
              ? 'bg-white text-indigo-700 shadow-xs'
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
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="English"
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    </div>
  );
};

