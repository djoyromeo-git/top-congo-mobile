import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './resources/en';
import fr from './resources/fr';

export const supportedLanguages = ['fr', 'en'] as const;
export type AppLanguage = (typeof supportedLanguages)[number];
const lockedLanguageValue = process.env.EXPO_PUBLIC_I18N_LOCKED_LANGUAGE?.toLowerCase();

function isSupportedLanguage(language: string): language is AppLanguage {
  return supportedLanguages.includes(language as AppLanguage);
}

function getLockedLanguage(): AppLanguage | null {
  if (!lockedLanguageValue) {
    return null;
  }

  return isSupportedLanguage(lockedLanguageValue) ? lockedLanguageValue : null;
}

function getDeviceLanguage(): AppLanguage {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase() ?? 'fr';
  return isSupportedLanguage(languageCode) ? languageCode : 'fr';
}

const lockedLanguage = getLockedLanguage();
export const isLanguageLocked = lockedLanguage !== null;
const initialLanguage = lockedLanguage ?? getDeviceLanguage();

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: initialLanguage,
    supportedLngs: supportedLanguages,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });
}

export function changeLanguage(language: AppLanguage) {
  if (lockedLanguage) {
    return Promise.resolve(i18n.language);
  }

  return i18n.changeLanguage(language);
}

export default i18n;
