import useApplicationStore, { LocationApp } from '@/lib/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Alert, AppState } from 'react-native';
import { useMutationSetDefaultAddress } from '@/features/location/hooks/use-mutation';
import { useCheckAuth } from '@/features/auth/hooks';
import { useTranslation } from 'react-i18next';
import { _TIME_OUT_LOADING_SCREEN_LAYOUT } from '@/lib/const';

/**
 * Kiểm tra có phải là sự thay đổi đáng kể hay không
 * @param oldLoc
 * @param newLoc
 */
const isSignificantChange = (oldLoc: Location.LocationObject | null, newLoc: Location.LocationObject) => {
  if (!oldLoc) return true;
  // Chỉ update nếu lệch quá 0.001 độ (khoảng 100 mét)
  const threshold = 0.001;
  const isLatDiff = Math.abs(oldLoc.coords.latitude - newLoc.coords.latitude) > threshold;
  const isLngDiff = Math.abs(oldLoc.coords.longitude - newLoc.coords.longitude) > threshold;

  return isLatDiff || isLngDiff;
};

/**
 * format địa chỉ tọa độ
 * @param locationObject Vị trí người dùng
 */
export const formatLocation = async (locationObject: Location.LocationObject): Promise<LocationApp | null> => {
  try {
    const reversedGeoCodes = await Location.reverseGeocodeAsync({
      latitude: locationObject.coords.latitude,
      longitude: locationObject.coords.longitude,
    });
    if (reversedGeoCodes.length > 0) {
      const place = reversedGeoCodes[0];
      // Xử lý đường/số nhà: Gom Số nhà + Tên đường lại cho rõ ràng
      // Ví dụ: "123" + "Đường Láng"
      let streetInfo = place.street || place.name;
      if (place.streetNumber && place.street) {
        streetInfo = `${place.streetNumber} ${place.street}`;
      }
      // Tạo mảng các thành phần theo thứ tự hiển thị mong muốn
      const parts = [
        streetInfo,                           // Số nhà + Đường (hoặc tên địa điểm)
        place.district || place.subregion,    // Quận/Huyện (iOS hay trả về subregion thay vì district)
        place.city || place.region,           // Tỉnh/Thành phố (Android hay trả về region)
      ];
      const addressString = parts
        .filter((part) => part && part.trim().length > 0) // Lọc null, undefined và chuỗi rỗng
        .join(', ');
      return {
        location: locationObject,
        address: addressString,
      };
    }
  } catch (error) {
    // Nếu không có dữ liệu, trả về null
  }
  return null;
};

/**
 * Hook quản lý vị trí người dùng, bao gồm:
 * - Xin quyền vị trí
 * - Lấy vị trí hiện tại
 * - Lưu vị trí vào store
 * - Quản lý trạng thái permission (granted, denied, skipped)
 * - Chỉ dùng ở layout toàn cục
 */
export const useLocation = () => {
  // Lưu vị trí hiện tại vào store
  const setAppLocation = useApplicationStore((s) => s.setLocation);
  // ref lưu vị trí hiện tại
  const currentLocation = useRef<LocationApp | null>(null);
  // Lưu subscription
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  // Lưu trạng thái ứng dụng
  const appState = useRef(AppState.currentState);
  //  Biến này để chặn việc gọi startWatching chồng chéo nhau
  const isStarting = useRef(false);
  // Mutation để set địa chỉ mặc định
  const mutation = useMutationSetDefaultAddress();
  // Kiểm tra auth
  const checkAuth = useCheckAuth();

  // Gửi vị trí lên server
  const sendLocation = () => {
    // Kiểm tra có vị trí và auth hay không
    if (currentLocation.current) {
      const newLocation = currentLocation.current;
      const oldLocation = useApplicationStore.getState().location;
      const check = isSignificantChange(oldLocation?.location ?? null, newLocation.location);

      // Chỉ update nếu có sự thay đổi đáng kể về vị trí
      if (check) {
        // Cập nhật vị trí mới vào store
        setAppLocation(newLocation);
        // Gửi lên server
        if (checkAuth){
          mutation.mutate({
            address: newLocation.address,
            latitude: newLocation.location.coords.latitude,
            longitude: newLocation.location.coords.longitude,
          });
        }
      }
    }
  };

  // Hàm dừng theo dõi
  const stopWatching = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  // Hàm bắt đầu theo dõi
  const startWatching = async () => {
    // Nếu đang có sub rồi HOẶC đang trong quá trình khởi tạo -> Dừng ngay
    if (locationSubscription.current || isStarting.current) return;

    try {
      isStarting.current = true; // Khóa lại

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Kiểm tra lại lần nữa phòng trường hợp App bị tắt trong lúc đang xin quyền
      if (appState.current.match(/inactive|background/)) return;

      // Bắt đầu theo dõi vị trí
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000 * 60, // Cập nhật mỗi 1 phút
          distanceInterval: 100, // Hoặc đi được 100 mét
        },
        async (newLocation) => {
          const location = await formatLocation(newLocation);
          if (location) {
            currentLocation.current = location;
          }
        },
      );

    } catch (error) {
      // Do nothing
    } finally {
      isStarting.current = false;
    }
  };

  // Lắng nghe sự kiện thay đổi trạng thái ứng dụng
  useEffect(() => {
    // Bắt đầu theo dõi khi component mount
    startWatching();

    const subscription = AppState.addEventListener('change', nextAppState => {
      // Logic: Chỉ start khi từ Background -> Active
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        startWatching();
      }
      // Logic: Chỉ stop khi từ Active -> Background
      else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        stopWatching();
      }
      appState.current = nextAppState;
    });

    return () => {
      stopWatching();
      subscription.remove();
    };
  }, []);


  // Effect: Gửi vị trí lên server khi có auth
  useEffect(() => {
    // Gửi vị trí ngay khi component mount
    const timeoutId = setTimeout(() => {
      sendLocation();
    }, _TIME_OUT_LOADING_SCREEN_LAYOUT); // Gửi sau _TIME_OUT_LOADING_SCREEN_LAYOUT (để đảm bảo có vị trí)

    // Gửi vị trí mỗi 1 phút khi có auth
    const intervalId = setInterval(() => {
      sendLocation();
    }, 1000 * 60 * 5); // Gửi mỗi 5 phút

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [checkAuth]);

};

/**
 * Hook get vị trí hiện tại của người dùng (dùng để lấy vị trí khi người dùng click vào nút "Lấy vị trí hiện tại")
 * - Set vị trí vào store
 */
export const useGetLocation = () => {
  const setAppLocation = useApplicationStore((s) => s.setLocation);
  const { t } = useTranslation();

  return async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('permission.location.title'),
          t('permission.location.message'),
        );
      }

      // Có quyền -> Lấy vị trí
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.High,
      });
      const location = await formatLocation(newLocation);
      setAppLocation(location);

      return location;
    } catch (error) {
      Alert.alert(
        t('permission.location.title'),
        t('permission.location.error'),
      );
      return null;
    }
  };
};
