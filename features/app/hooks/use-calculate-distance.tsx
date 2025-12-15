import useApplicationStore from '@/lib/store';
import { useCallback } from 'react';
import { getDistanceFromLatLonInKm } from '@/lib/utils';
import useAuthStore from '@/features/auth/store';

const useCalculateDistance = () => {
  const user = useAuthStore((state) => state.user);

  return useCallback((latProvider: number, lonProvider: number) => {
    if (!user || !user.primary_location) {
      return null;
    }
    const locationUser = user.primary_location;

    return getDistanceFromLatLonInKm(
      locationUser.latitude,
      locationUser.longitude,
      latProvider,
      lonProvider
    );

  }, [location]);
};

export default useCalculateDistance;
