import { _StorageKey } from '@/lib/storages/key';
import { create } from 'zustand';
import { _LanguageCode } from '@/lib/const';
import { Storage } from '@/lib/storages';
import { LocationObject } from 'expo-location';
import i18n from 'i18next';
import { devtools } from 'zustand/middleware';


export type LocationApp = {
  location: LocationObject;
  address: string;
};

export interface IApplicationStore {
  language: _LanguageCode;
  loading: boolean;

  location: LocationApp | null;

  // functions
  setLanguage: (lang: _LanguageCode) => Promise<void>;
  hydrateLanguage: () => Promise<void>;

  setLoading: (state: boolean) => void;
  setLocation: (location: LocationApp | null) => void;
}

const useApplicationStore = create<IApplicationStore>()(
  devtools(
    (set) => ({
      language: _LanguageCode.VI,
      loading: false,

      location: null,
      location_permission: null,

      // functions
      setLanguage: async (lang) => {
        try {
          await Storage.setItem(_StorageKey.LANGUAGE, lang);
          await i18n.changeLanguage(lang);

          set({ language: lang }, false, 'app/setLanguage');
        } catch {
          // do nothing
        }
      },

      hydrateLanguage: async () => {
        try {
          let lang = await Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);
          if (lang !== _LanguageCode.EN && lang !== _LanguageCode.VI) {
            lang = _LanguageCode.VI;
          }
          await i18n.changeLanguage(lang);
          set({ language: lang }, false, 'app/hydrateLanguage');
        } catch {
          // do nothing
        }
      },

      setLoading: (state: boolean) => {
        set({ loading: state }, false, 'app/setLoading');
      },

      setLocation: (location: LocationApp | null) => {
        set({ location }, false, 'app/setLocation');
      },
    }),
    {
      name: 'ApplicationStore', // Tên hiển thị trong Redux DevTools
      enabled: true, // Chỉ bật khi dev
    }
  )
);

export default useApplicationStore;
