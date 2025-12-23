import useAuthStore from '@/features/auth/store';
import { useCallback, useEffect, useState } from 'react';
import { fetchAndFormatLocation } from '@/features/app/hooks/use-location';
import { LocationPrimaryUser } from '@/features/location/types';
import useStoreLocation from '@/features/location/stores';


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
      getLocationUser().then(location => {
        setLocationUser(location);
      })
  }, [getLocationUser]);

  return locationUser;
}

