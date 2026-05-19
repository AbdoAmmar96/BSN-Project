import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * Minimal Arabic/English bootstrap. Translations live inline for now — when
 * the surface grows, extract these into `public/locales/{lng}/common.json`
 * and switch to the http backend.
 *
 * Components opt in by calling `const { t } = useTranslation()`; legacy
 * Arabic-only screens keep working because everything still renders in
 * Arabic by default.
 */

const resources = {
  ar: {
    common: {
      nav: {
        home: 'الرئيسية',
        services: 'الخدمات',
        pricing: 'الأسعار',
        portfolio: 'أعمالنا',
        about: 'من نحن',
        contact: 'تواصل',
        login: 'تسجيل الدخول',
        startProject: 'ابدأ مشروعك',
        logout: 'تسجيل الخروج',
        dashboard: 'لوحة التحكم',
      },
      common: {
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        confirm: 'تأكيد',
        back: 'رجوع',
        search: 'بحث',
        language: 'اللغة',
      },
    },
  },
  en: {
    common: {
      nav: {
        home: 'Home',
        services: 'Services',
        pricing: 'Pricing',
        portfolio: 'Portfolio',
        about: 'About',
        contact: 'Contact',
        login: 'Login',
        startProject: 'Start project',
        logout: 'Logout',
        dashboard: 'Dashboard',
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
        back: 'Back',
        search: 'Search',
        language: 'Language',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common'],
    supportedLngs: ['ar', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bsn_lang',
    },
  });

// Sync <html> attributes whenever the language changes so RTL/LTR follows.
const applyDocumentLang = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};
applyDocumentLang(i18n.language || 'ar');
i18n.on('languageChanged', applyDocumentLang);

export default i18n;
