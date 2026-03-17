import { LocationApp, useApplicationStore } from '@/features/app/stores';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useMutationSetDefaultAddress } from '@/features/location/hooks/use-mutation';
import { useTranslation } from 'react-i18next';
import { _TIME_OUT_LOADING_SCREEN_LAYOUT } from '@/lib/const';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus } from '@/features/auth/const';

/**
 * Kiểm tra có phải là sự thay đổi đáng kể hay không
 * @param oldLoc
 * @param newLoc
 */
const isSignificantChange = (
  oldLoc: Location.LocationObject | null,
  newLoc: Location.LocationObject
) => {
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
export const formatLocation = async (
  locationObject: Location.LocationObject
): Promise<LocationApp | null> => {
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
        streetInfo, // Số nhà + Đường (hoặc tên địa điểm)
        place.district || place.subregion, // Quận/Huyện (iOS hay trả về subregion thay vì district)
        place.city || place.region, // Tỉnh/Thành phố (Android hay trả về region)
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
export const useLocation = ({ enabled = true }: { enabled?: boolean } = {}) => {
  // Lưu vị trí hiện tại vào store
  const setAppLocation = useApplicationStore((s) => s.setLocation);
  // Lưu subscription
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  // Lưu trạng thái ứng dụng
  const appState = useRef(AppState.currentState);
  //  Biến này để chặn việc gọi startWatching chồng chéo nhau
  const isStarting = useRef(false);
  // Mutation để set địa chỉ mặc định
  const mutation = useMutationSetDefaultAddress();

  const statusAuth = useAuthStore((state) => state.status);

  // Gửi vị trí lên server
  const sendLocation = () => {
    // Kiểm tra có vị trí và auth hay không
    const location = useApplicationStore.getState().location;

    if (location && statusAuth === _AuthStatus.AUTHORIZED) {
      mutation.mutate({
        address: location.address,
        latitude: location.location.coords.latitude,
        longitude: location.location.coords.longitude,
      });
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
      // --- BƯỚC THÊM MỚI: LẤY VỊ TRÍ TỨC THỜI ---
      // Lấy nhanh vị trí cuối cùng được ghi nhận hoặc vị trí hiện tại
      const lastKnown = await Location.getLastKnownPositionAsync({});
      const currentPos =
        lastKnown ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      if (currentPos) {
        const formatted = await formatLocation(currentPos);
        if (formatted) {
          setAppLocation(formatted);
          // Gửi lên server luôn nếu đã có Auth
          if (statusAuth === _AuthStatus.AUTHORIZED) {
            mutation.mutate({
              address: formatted.address,
              latitude: formatted.location.coords.latitude,
              longitude: formatted.location.coords.longitude,
            });
          }
        }
      }

      // Kiểm tra lại lần nữa phòng trường hợp App bị tắt trong lúc đang xin quyền
      if (appState.current.match(/inactive|background/)) return;

      // Bắt đầu theo dõi vị trí
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000 * 60 * 2, // Cập nhật mỗi 2 phút
          distanceInterval: 500, // Hoặc đi được 500 mét
        },
        async (locationObject) => {
          const oldLocation = useApplicationStore.getState().location;
          const newLocation = await formatLocation(locationObject);

          if (newLocation) {
            // So sánh vị trí mới với vị trí cũ
            const check = isSignificantChange(oldLocation?.location ?? null, newLocation.location);
            if (check) {
              setAppLocation(newLocation);
            }
          }
        }
      );
    } catch (error) {
      // Do nothing
    } finally {
      isStarting.current = false;
    }
  };

  // Lắng nghe sự kiện thay đổi trạng thái ứng dụng
  useEffect(() => {
    if (!enabled) {
      stopWatching();
      return;
    }
    // Bắt đầu theo dõi khi component mount
    startWatching();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Logic: Chỉ start khi từ Background -> Active
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        startWatching();
      }
      // Logic: Chỉ stop khi từ Active -> Background
      else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        stopWatching();
      }
      appState.current = nextAppState;
    });

    return () => {
      stopWatching();
      subscription.remove();
    };
  }, [enabled]);

  // Effect: Gửi vị trí lên server khi có auth
  useEffect(() => {
    if (!enabled) return;
    // Gửi vị trí ngay khi component mount
    const timeoutId = setTimeout(() => {
      sendLocation();
    }, _TIME_OUT_LOADING_SCREEN_LAYOUT); // Gửi sau _TIME_OUT_LOADING_SCREEN_LAYOUT (để đảm bảo có vị trí)

    // Gửi vị trí mỗi 1 phút khi có auth
    const intervalId = setInterval(
      () => {
        sendLocation();
      },
      1000 * 60 * 5
    ); // Gửi mỗi 5 phút

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [statusAuth, enabled]);
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
        Alert.alert(t('permission.location.title'), t('permission.location.message'));
      }

      // Có quyền -> Lấy vị trí
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.High,
      });
      const location = await formatLocation(newLocation);
      setAppLocation(location);

      return location;
    } catch (error) {
      Alert.alert(t('permission.location.title'), t('permission.location.error'));
      return null;
    }
  };
};

/**
 * Hook kiểm tra và yêu cầu quyền vị trí cho KTV
 */
export const useRequireLocationForKTV = () => {
  const [isLocationReady, setIsLocationReady] = useState<boolean>(false);

  const checkPermission = async () => {
    try {
      // 1. Kiểm tra quyền (Permission)
      const { status } = await Location.getForegroundPermissionsAsync();

      // 2. Kiểm tra GPS có đang bật không (Service)
      const isServiceEnabled = await Location.hasServicesEnabledAsync();

      if (status === 'granted' && isServiceEnabled) {
        setIsLocationReady(true);
      } else {
        setIsLocationReady(false);
      }
    } catch (error) {
      setIsLocationReady(false);
    }
  };

  useEffect(() => {
    checkPermission();

    // Lắng nghe khi user quay lại app từ Settings
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => subscription.remove();
  }, []);

  return { isLocationReady };
};
