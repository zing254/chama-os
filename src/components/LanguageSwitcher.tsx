import { useI18n } from '../data/i18n-context';
import { cn } from '../utils/cn';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'icon';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'toggle', className }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useI18n();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-semibold text-sm',
          className
        )}
        title={language === 'en' ? 'Switch to Swahili' : 'Switch to English'}
      >
        {language === 'en' ? 'SW' : 'EN'}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
        className={cn(
          'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500',
          className
        )}
      >
        <option value="en">🇬🇧 English</option>
        <option value="sw">🇰🇪 Kiswahili</option>
      </select>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm font-semibold',
        'border border-gray-200 hover:border-gray-300 hover:shadow-sm',
        className
      )}
    >
      <span className="text-lg">{language === 'en' ? '🇰🇪' : '🇬🇧'}</span>
      <span className="text-gray-700">{language === 'en' ? 'SW' : 'EN'}</span>
      <span className="text-gray-400 text-xs">↔</span>
    </button>
  );
}