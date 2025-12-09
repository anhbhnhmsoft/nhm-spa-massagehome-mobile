import useApplicationStore from '@/lib/store';
import { useCallback } from 'react';
import { getDistanceFromLatLonInKm } from '@/lib/utils';

const useCalculateDistance = () => {
  const location = useApplicationStore((state) => state.location);

  return useCallback((latProvider: number, lonProvider: number) => {
    if (!location) {
      return null;
    }
    const locationUser = location.location;

    return getDistanceFromLatLonInKm(
      locationUser.coords.latitude,
      locationUser.coords.longitude,
      latProvider,
      lonProvider
    );

  }, [location]);
};

export default useCalculateDistance;
