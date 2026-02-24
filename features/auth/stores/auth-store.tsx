import { AuthData, User } from '@/features/auth/utils';
import { create } from 'zustand';
import { SecureStorage, Storage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import { _AuthStatus } from '@/features/auth/utils';

export interface IAuthStore {
  status: _AuthStatus;
  token: string | null;
  user: User | null;

  login: (data: AuthData) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setStatus: (status: _AuthStatus) => void;
}

export const useAuthStore = create<IAuthStore>((set) => ({
  status: _AuthStatus.INIT,
  token: null,
  user: null,

  login: async (data) => {
    await SecureStorage.setItem(_StorageKey.SECURE_AUTH_TOKEN, data.token);
    await Storage.setItem(_StorageKey.USER_LOGIN, data.user);
    set({ user: data.user, token: data.token, status: _AuthStatus.AUTHORIZED });
  },
  logout: async () => {
    await SecureStorage.removeItem(_StorageKey.SECURE_AUTH_TOKEN);
    await Storage.removeItem(_StorageKey.USER_LOGIN);
    set({ user: null, token: null, status: _AuthStatus.UNAUTHORIZED });
  },
  hydrate: async () => {
    try {
      const token = await SecureStorage.getItem<string>(_StorageKey.SECURE_AUTH_TOKEN);
      const user = await Storage.getItem<User>(_StorageKey.USER_LOGIN);
      if (user && token) {
        set({
          status: _AuthStatus.HYDRATED,
          user: user,
          token: token,
        });
      } else {
        set({
          status: _AuthStatus.UNAUTHORIZED,
          user: null,
          token: null,
        });
      }
    } catch (error) {
      set({
        status: _AuthStatus.UNAUTHORIZED,
        user: null,
        token: null,
      });
    }
  },
  setUser: async (user: User | null) => {
    await Storage.setItem(_StorageKey.USER_LOGIN, user);
    set({ user });
  },
  setStatus: (status: _AuthStatus) => {
    set({ status });
  },
}));

