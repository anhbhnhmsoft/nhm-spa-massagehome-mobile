import { useCallback } from 'react';
import { getDistanceFromLatLonInKm } from '@/lib/utils';
import useApplicationStore from '@/lib/store';

/**
 * Hook để tính khoảng cách giữa user và provider.
 */
const useCalculateDistance = () => {
  const userLocation = useApplicationStore((state) => state.location);
  return useCallback(
    (latProvider: number, lonProvider: number) => {
      if (userLocation) {
        return getDistanceFromLatLonInKm(
          userLocation.location.coords.latitude,
          userLocation.location.coords.longitude,
          latProvider,
          lonProvider
        );
      } else {
        return 0;
      }
    },
    [userLocation]
  );
};

export default useCalculateDistance;
