import useApplicationStore, { LocationApp } from '@/lib/store';
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';

export const fetchAndFormatLocation = async (): Promise<LocationApp> => {
  let location = await Location.getLastKnownPositionAsync();

  if (!location) {
    location = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Balanced, // Dùng Balanced để đỡ nhảy hơn High
    });
  }

  const reverseGeocode = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  let addressString = '';
  if (reverseGeocode.length > 0) {
    const place = reverseGeocode[0];
    if (place.formattedAddress) {
      addressString = place.formattedAddress;
    } else {
      const parts: string[] = [];

      if (place.name) {
        parts.push(place.name);
      } else if (place.street) {
        parts.push(place.street);
      }

      if (place.subregion) {
        parts.push(place.subregion);
      } else if (place.district) {
        parts.push(place.district);
      }

      if (place.region) {
        parts.push(place.region);
      } else if (place.city) {
        parts.push(place.city);
      }

      addressString = parts.filter(Boolean).join(', ');
    }

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
  const [completeCheck, setCompleteCheck] = useState(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus|null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status === 'granted') {
          const locationApp = await fetchAndFormatLocation();
          setLocation(locationApp);
        }
      } catch (error) {
        // Fallback an toàn
        setLocationPermission(null);
      }
      finally{
        setCompleteCheck(true);
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
  }, []);

  return { locationPermission, completeCheck };
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

  const getPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
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

  return {
    getPermission,
  };
};

export const useLocationAddress = () => {
  const location = useApplicationStore((s) => s.location);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);
      } catch (error) {
        // Fallback an toàn
        setLocationPermission(null);
      }
    };
    checkPermission();
  }, []);

  return {
    location,
    permission: locationPermission,
  };
};
