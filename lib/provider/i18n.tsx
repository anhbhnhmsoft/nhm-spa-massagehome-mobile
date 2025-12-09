import vi from '@/i18n/vi.json';
import en from '@/i18n/en.json';
import cn from '@/i18n/cn.json';
import { getLocales } from 'expo-localization';
import useApplicationStore from '@/lib/store';
import { _LanguageCode } from '@/lib/const';
import { _StorageKey } from '@/lib/storages/key';
import { Storage } from '@/lib/storages';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next'
import { checkLanguage } from '@/lib/utils';


const resources = {
  "vi": { translation: vi },
  "en": { translation: en },
  "cn": { translation: cn },
};


const initI18n = async () => {
  const setLanguage = useApplicationStore.getState().setLanguage;
  // Lấy language lưu trong storage
  let savedLanguage = await Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);
  // Lấy language từ device nếu chưa lưu
  const deviceLang = getLocales()[0].languageCode as _LanguageCode | null;

  // Nếu language chưa lưu hoặc không hợp lệ -> set mặc định
  if (!savedLanguage || !checkLanguage(savedLanguage)) {
    switch (deviceLang){
      case _LanguageCode.EN:
      case _LanguageCode.VI:
      case _LanguageCode.CN:
        savedLanguage = deviceLang;
        break;
      default:
        savedLanguage = _LanguageCode.VI;
        break;
    }
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: _LanguageCode.VI,
    interpolation: { escapeValue: false },
  });
  // Set vào store
  await setLanguage(savedLanguage);
};

export default initI18n;
