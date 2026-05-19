import { useTranslation } from 'react-i18next';

/**
 * Two-button language toggle. Placed in the navbar / footer / settings.
 * Active language is highlighted; clicking the other one persists it in
 * localStorage and flips the document direction via the listener in i18n.js.
 */
export default function LangSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'ar';

  const setLang = (lng) => {
    if (lng !== current) i18n.changeLanguage(lng);
  };

  return (
    <div className={`inline-flex items-center gap-1 text-sm font-bold ${className}`}>
      <button
        type="button"
        onClick={() => setLang('ar')}
        className={`px-2 py-1 rounded-md transition ${
          current === 'ar' ? 'bg-brand-ink text-white' : 'text-brand-ink hover:bg-brand-ink/10'
        }`}
        aria-pressed={current === 'ar'}
      >
        AR
      </button>
      <span aria-hidden="true" className="text-brand-ink/40">|</span>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-md transition ${
          current === 'en' ? 'bg-brand-ink text-white' : 'text-brand-ink hover:bg-brand-ink/10'
        }`}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
    </div>
  );
}
