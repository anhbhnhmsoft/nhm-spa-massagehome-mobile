import useAuthStore from '@/features/auth/store';
import { useCallback, useEffect } from 'react';
import { fetchAndFormatLocation } from '@/features/app/hooks/use-location';
import { LocationPrimaryUser } from '@/features/location/types';
import useStoreLocation from '@/features/location/stores';

const isSignificantChange = (oldLoc: LocationPrimaryUser | null, newLoc: LocationPrimaryUser) => {
  if (!oldLoc) return true;
  // Chỉ update nếu lệch quá 0.001 độ (khoảng 100 mét) hoặc address thay đổi
  const threshold = 0.001;
  const isLatDiff = Math.abs(oldLoc.lat - newLoc.lat) > threshold;
  const isLngDiff = Math.abs(oldLoc.lng - newLoc.lng) > threshold;

  return isLatDiff || isLngDiff;
};

/**
 * Hook để lấy vị trí của user.
 * Nếu user có primary_location, thì trả về primary_location.
 * Ngược lại, thì gọi API location expo để lấy vị trí hiện tại của user.
 */
export const useGetUserLocation = () => {
  const user = useAuthStore((state) => state.user);
  return useCallback(async (): Promise<LocationPrimaryUser | null> => {
    try {
      if (user && user?.primary_location) {
        // Nếu user
        const locationUser = user?.primary_location;
        const addressUser = locationUser?.address || '';
        const latUser = Number(locationUser?.latitude) || 0;
        const lonUser = Number(locationUser?.longitude) || 0;
        return {
          lat: latUser,
          lng: lonUser,
          address: addressUser,
        };
      } else {
        const location = await fetchAndFormatLocation();
        const lat = Number(location?.location?.coords?.latitude) || 0;
        const lng = Number(location?.location?.coords?.longitude) || 0;
        const address = location?.address || '';
        return {
          lat,
          lng,
          address,
        };
      }
    } catch (err) {
      return null;
    }
  }, [user]);
};

/**
 * Hook để lấy vị trí của user.
 */
export const useLocationUser = () => {
  const locationUser = useStoreLocation((state) => state.location_user);

  const setLocationUser = useStoreLocation(state => state.setLocationUser);

  const getLocationUser = useGetUserLocation();
  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      const newLocation = await getLocationUser();
      if (newLocation && isMounted) {
        // Nếu thay đổi không đáng kể thì KHÔNG set lại store -> KHÔNG trigger
        if (isSignificantChange(locationUser, newLocation)) {
          setLocationUser(newLocation);
        }
      }
    };

    fetchLocation();

    return () => { isMounted = false; };
    // Bỏ locationUser ra khỏi dependency để tránh vòng lặp vô tận logic
  }, [getLocationUser]);

  return locationUser;
}

