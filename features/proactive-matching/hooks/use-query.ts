import { useQuery } from '@tanstack/react-query';
import { proactiveMatchingApi } from '../api';

export const PROACTIVE_KEYS = {
  nearbyDemands: ['proactiveMatchingApi-nearbyDemands'] as const,
  customerInvites: ['proactiveMatchingApi-customerInvites'] as const,
};

export const useNearbyDemandsQuery = (params?: { lat?: number; lng?: number; radius?: number }) => {
  return useQuery({
    queryKey: [...PROACTIVE_KEYS.nearbyDemands, params],
    queryFn: () => proactiveMatchingApi.getNearbyDemands(params),
    select: (res) => res.data,
    refetchInterval: 5000, // 5s auto polling for radar screen
  });
};

export const useCustomerInvitesQuery = () => {
  return useQuery({
    queryKey: PROACTIVE_KEYS.customerInvites,
    queryFn: () => proactiveMatchingApi.getCustomerInvites(),
    select: (res) => res.data,
    refetchInterval: 5000, // 5s auto polling for proactive invites
  });
};
