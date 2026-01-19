import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { _BackendURL, _LanguageCode } from '@/lib/const';
import { SecureStorage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import ErrorAPIServer, { IDeviceInfo } from '@/lib/types';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Linking, Platform } from 'react-native';
import { v4 } from 'uuid';
import 'react-native-get-random-values';
import { TFunction } from 'i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

import { _KTVConfigSchedules } from '@/features/ktv/consts'; // Cần cho uuid
import * as WebBrowser from 'expo-web-browser';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uuid() {
  return v4();
}

// Hàm format tiền tệ
export const formatBalance = (balance: string | number) => {
  return Number(balance).toLocaleString('vi-VN');
};

// Kiểm tra ngôn ngữ có hợp lệ hay không
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

// Lấy thông tin tiền tệ
export const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value));
};

// Lấy thông tin thiết bị
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

// Lấy hoặc tạo deviceId duy nhất và lưu trữ trong keychain
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

/**
 * Tạo URL hình ảnh QR Code cho VietQR
 * @param config Tham số cấu hình QR Code
 * @returns URL hình ảnh QR Code
 */
export const generateQRCodeImageUrl = (config: {
  bin: string;
  numberCode: string;
  name: string;
  money: string;
  desc: string;
}) => {
  return `https://img.vietqr.io/image/${config.bin}-${config.numberCode}-qr_only.png?amount=${config.money}&addInfo=${config.desc}&accountName=${encodeURIComponent(config.name)}`;
};

/**
 * Lấy thông báo lỗi từ server
 * @param err Đối tượng lỗi
 * @param t Hàm dịch chuỗi
 * @returns Thông báo lỗi
 */
export const getMessageError = (err: Error | ErrorAPIServer | any, t: TFunction) => {
  if (err) {
    if (err instanceof ErrorAPIServer) {
      if (err.validateError) {
        const validationErrors = err.validateError;
        const firstKey = Object.keys(validationErrors)[0];
        const firstValue = validationErrors[firstKey];
        return firstValue[0];
      } else if (err.message) {
        return err.message;
      }
    } else {
      return t('common_error.unknown_error');
    }
  }
};
/**
 * Xử lý thay đổi giá trị số
 * @param value Giá trị nhập vào
 * @param onChange Hàm thay đổi giá trị
 */
export const handleSetChangeNumber = (value: string, onChange: (value: number) => void) => {
  if (value === '' || value.trim() === '') {
    onChange(0);
    return;
  }
  if (isNaN(Number(value))) {
    onChange(0);
    return;
  }
  onChange(Number(value));
};

export const openMap = async (lat: number, lng: number) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  await Linking.openURL(url);
};

// Lấy khóa ngày hiện tại trong cấu hình KTV
export const getCurrentDayKey = () => {
  const day = dayjs().day(); // 0 là Chủ nhật, 1 là Thứ 2
  if (day === 0) return _KTVConfigSchedules.SUNDAY; // 0 -> 8
  return day + 1; // 1 -> 2 (Thứ 2), 6 -> 7 (Thứ 7)
};

export const openAboutPage = async () => {
  await WebBrowser.openBrowserAsync(`${_BackendURL}/ve-chung-toi`);
};

/**
 * Tính toán thời gian kết thúc dựa trên thời gian bắt đầu và độ dài
 * @param startTime Thời gian bắt đầu (ISO string)
 * @param duration Độ dài thời gian (phút)
 */
export const calculateEndTime = (startTime: string, duration: number) => {
  const start = dayjs(startTime);
  return start.add(duration, 'minute');
};

export const getRemainingTime = (endTime: dayjs.Dayjs) => {
  const now = dayjs();
  const diff = endTime.diff(now); // Tính bằng miliseconds

  if (diff <= 0) {
    return {
      totalMs: 0,
      hours: '00',
      minutes: '00',
      seconds: '00',
      isOver: true,
    };
  }

  const dur = dayjs.duration(diff);

  return {
    totalMs: diff,
    hours: Math.floor(dur.asHours()).toString().padStart(2, '0'),
    minutes: dur.minutes().toString().padStart(2, '0'),
    seconds: dur.seconds().toString().padStart(2, '0'),
    isOver: false,
  };
};
