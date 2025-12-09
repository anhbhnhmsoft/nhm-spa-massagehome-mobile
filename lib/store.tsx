import { _StorageKey } from '@/lib/storages/key';
import { create } from 'zustand';
import { _LanguageCode } from '@/lib/const';
import { Storage } from '@/lib/storages';
import { LocationObject, PermissionStatus } from 'expo-location';

export type LocationPermission = PermissionStatus | 'skipped' | null;

export type LocationApp = {
  location: LocationObject;
  address: string;
}

export interface IApplicationStore {
  language: _LanguageCode;
  loading: boolean;

  location: LocationApp | null;
  location_permission: LocationPermission,


  // functions
  setLanguage: (lang: _LanguageCode) => Promise<void>;
  hydrateLanguage: () => Promise<void>;

  setLoading: (state: boolean) => void;
  setLocation: (location: LocationApp | null) => void;
  setLocationPermission: (permission: LocationPermission) => Promise<void>;
  hydrateLocationPermission: () => Promise<LocationPermission>;

}
const useApplicationStore = create<IApplicationStore>((set) => ({
  language: _LanguageCode.VI,
  loading: false,

  location: null,
  location_permission: null,


  // functions
  setLanguage: async (lang) => {
    try {
      await Storage.setItem(_StorageKey.LANGUAGE, lang);
      set({ language: lang });
    } catch (err) {
      console.error('Failed to save language', err);
    }
  },
  hydrateLanguage: async () => {
    try {
      let lang = await Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);
      if (lang !== _LanguageCode.EN && lang !== _LanguageCode.VI) {
        lang = _LanguageCode.VI;
      }
      set({ language: lang });
    } catch (err) {
      console.error('Failed to load language', err);
    }
  },
  setLoading: (state: boolean) => {
    set({ loading: state });
  },
  setLocation: (location: LocationApp | null) => {
    set({ location });
  },
  setLocationPermission: async (permission: PermissionStatus | 'skipped' | null) => {
    try {
      await Storage.setItem(_StorageKey.LOCATION_PERMISSION, permission);
    } catch (err) {
      console.error('Failed to save location permission', err);
    }
    set({ location_permission: permission });
  },
  hydrateLocationPermission: async () => {
    try {
      let permission = await Storage.getItem<LocationPermission>(_StorageKey.LOCATION_PERMISSION);
      set({ location_permission: permission });
      return permission;
    } catch (err) {
      console.error('Failed to load location permission', err);
      return null;
    }
  },
}));

export default useApplicationStore;
