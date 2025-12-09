import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { _LanguageCode } from '@/lib/const';
import { SecureStorage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import { IDeviceInfo } from '@/lib/types';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 } from 'uuid';
import 'react-native-get-random-values'; // Cần cho uuid


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uuid() {
  return v4();
}


export const formatBalance = (balance: string | number) => {
  return Number(balance).toLocaleString('en-US');
};

export const checkLanguage = (lang: string) => {
  return [_LanguageCode.EN, _LanguageCode.VI, _LanguageCode.CN].includes(lang as _LanguageCode);
};

// Hàm chuyển đổi độ sang radian
const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * Tính khoảng cách giữa 2 tọa độ theo công thức Haversine
 * @param lat1 Vĩ độ người dùng
 * @param lon1 Kinh độ người dùng
 * @param lat2 Vĩ độ Provider
 * @param lon2 Kinh độ Provider
 * @returns Khoảng cách (km)
 */
export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Bán kính trái đất (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   // Khoảng cách theo km
  return R * c;
};

// Hàm helper để format hiển thị (VD: 1.5 km, 500 m)
export const formatDistance = (distanceInKm: number) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

export const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value));
};


export async function getInfoDevice(): Promise<IDeviceInfo> {
  const deviceName = Device.modelName || '';
  // chỉ lấy ios và android
  const platform: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';
  const deviceId: string = await getPersistentDeviceId();

  return {
    platform,
    deviceId,
    deviceName,
  };
}

export async function getPersistentDeviceId(): Promise<string> {
  // 1) Kiểm tra xem có id đã lưu trước đó hay không
  const saved = await SecureStorage.getItem<string>(_StorageKey.SECURE_DEVICE_ID);
  if (saved) return saved;

  // 2) Nếu không có id đã lưu, kiểm tra xem có id hệ thống hay không
  let id: string | null;
  if (Platform.OS === 'android') {
    id = Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    const iosId = await Application.getIosIdForVendorAsync();
    id = iosId ?? null;
  } else {
    id = null;
  }

  // 3) Nếu không có id hệ thống, tạo 1 UUID
  const finalId = id ?? uuid();
  await SecureStorage.setItem(_StorageKey.SECURE_DEVICE_ID, finalId, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });

  return finalId;
}
