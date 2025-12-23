import { useCallback } from 'react';
import { getDistanceFromLatLonInKm } from '@/lib/utils';
import { useGetUserLocation, useLocationUser } from '@/features/app/hooks/use-get-user-location';

const useCalculateDistance = () => {
  const userLocation = useLocationUser();
  return useCallback(
    (latProvider: number, lonProvider: number) => {
      if (userLocation) {
        return getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
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
