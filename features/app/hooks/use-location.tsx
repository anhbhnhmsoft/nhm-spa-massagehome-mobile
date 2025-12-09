import useApplicationStore, { LocationApp } from '@/lib/store';
import { useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';

const fetchAndFormatLocation = async (): Promise<LocationApp> => {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.LocationAccuracy.Balanced,
  });

  const reverseGeocode = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  let addressString = '';
  if (reverseGeocode.length > 0) {
    const place = reverseGeocode[0];
    // Logic format địa chỉ tập trung 1 chỗ, dễ sửa đổi sau này
    addressString = place.formattedAddress || `${place.subregion || place.district || ''}, ${place.region || place.city || ''}`;
    // Xử lý cleanup dấu phẩy thừa nếu dữ liệu thiếu
    addressString = addressString.replace(/^, /, '').replace(/, $/, '');
  }

  return {
    location,
    address: addressString,
  };
};

/**
 * Hook quản lý vị trí người dùng, bao gồm:
 * - Xin quyền vị trí
 * - Lấy vị trí hiện tại
 * - Lưu vị trí vào store
 * - Quản lý trạng thái permission (granted, denied, skipped)
 */
export const useLocation = () => {
  const setLocation = useApplicationStore((s) => s.setLocation);
  const locationPermission = useApplicationStore((s) => s.location_permission);
  const setLocationPermission = useApplicationStore((s) => s.setLocationPermission);
  const hydrateLocationPermission = useApplicationStore((s) => s.hydrateLocationPermission);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const locationPermissionHydrated = await hydrateLocationPermission();

        // Chỉ check nếu permission đã từng được set (không null) và user không chọn skip
        if (locationPermissionHydrated !== null && locationPermissionHydrated !== 'skipped') {
          const { status } = await Location.getForegroundPermissionsAsync();

          // Sync Store nếu status thực tế khác store
          if (status !== locationPermissionHydrated) {
            await setLocationPermission(status);
          }

          // Nếu có quyền -> Lấy vị trí (Dùng Helper)
          if (status === 'granted') {
            const locationApp = await fetchAndFormatLocation();
            setLocation(locationApp);
          }
        }
      } catch (error) {
        // Fallback an toàn
        await setLocationPermission(null);
        setLocation(null);
      }
    };

    checkPermission();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [locationPermission]); // Dependency này ok, nhưng cẩn thận loop nếu logic bên trong thay đổi permission liên tục

  return { locationPermission };
};

/**
 * Hook quản lý việc lấy vị trí người dùng, bao gồm:
 * - Xin quyền vị trí
 * - Lấy vị trí hiện tại
 * - Lưu vị trí vào store
 * - Quản lý trạng thái permission (granted, denied, skipped)
 */
export const useGetLocation = () => {
  const setLocation = useApplicationStore((s) => s.setLocation);
  const setLocationPermission = useApplicationStore((s) => s.setLocationPermission);

  const getPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      // Luôn cập nhật status mới nhất vào store dù granted hay denied
      await setLocationPermission(status);

      if (status !== 'granted') {
        return false;
      }

      // Có quyền -> Lấy vị trí (Dùng Helper)
      const locationApp = await fetchAndFormatLocation();
      setLocation(locationApp);

      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const skipGetLocation = useCallback(async () => {
    await setLocationPermission('skipped');
  }, []);

  return {
    getPermission,
    skipGetLocation,
  };
};

export const useLocationAddress = () => {
  const location = useApplicationStore((s) => s.location);
  const permission = useApplicationStore((s) => s.location_permission);
  return {
    location,
    permission
  };
};
