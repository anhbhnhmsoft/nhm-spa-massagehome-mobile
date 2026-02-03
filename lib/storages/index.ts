import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { _StorageKey } from '@/lib/storages/key';

export const SecureStorage = {
  async getItem<T>(key: _StorageKey, options?: SecureStore.SecureStoreOptions): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key, options);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },
  async setItem<T>(key: _StorageKey, value: T, options?: SecureStore.SecureStoreOptions): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      const finalOptions = {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        ...options
      };
      await SecureStore.setItemAsync(key, jsonValue, finalOptions);
      return true;
    } catch {
      return false;
    }
  },
  async removeItem(key: _StorageKey, options?: SecureStore.SecureStoreOptions): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key, options);
      return true;
    } catch {
      return false;
    }
  },
};

export const Storage = {
  async getItem<T>(key: _StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },
  async setItem<T>(key: _StorageKey, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch {
      return false;
    }
  },
  async removeItem(key: _StorageKey): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
