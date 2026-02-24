import { useEffect, useState } from 'react';
import useApplicationStore from '@/lib/store';
import { _LanguageCode } from '@/lib/const';
import { _StorageKey } from '@/lib/storages/key';
import { getLocales } from 'expo-localization';
import { checkLanguage } from '@/lib/utils';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '@/i18n/vi.json';
import en from '@/i18n/en.json';
import cn from '@/i18n/cn.json';
import { Storage } from '@/lib/storages';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  cn: { translation: cn },
};

/**
 * Hook để khởi tạo i18n và set language mặc định
 */
export const useI18n = () => {

  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      const setLanguage = useApplicationStore.getState().setLanguage;

      let savedLanguage = await Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);

      const deviceLang = getLocales()[0]?.languageCode as _LanguageCode | null;

      if (!savedLanguage || !checkLanguage(savedLanguage)) {
        switch (deviceLang) {
          case _LanguageCode.EN:
          case _LanguageCode.VI:
          case _LanguageCode.CN:
            savedLanguage = deviceLang;
            break;
          default:
            savedLanguage = _LanguageCode.VI;
        }
      }

      await i18n.use(initReactI18next).init({
        compatibilityJSON: 'v4',
        resources,
        lng: savedLanguage,
        fallbackLng: _LanguageCode.VI,
        interpolation: { escapeValue: false },
      });

      await setLanguage(savedLanguage);
      setI18nReady(true);
    };

    initI18n();
  }, []);

  return i18nReady;
};

