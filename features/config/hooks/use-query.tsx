import configApi from '@/features/config/api';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook để check các thông số mà server gửi về client
 */
export const useConfigApplicationQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['configApi-configApplication'],
    queryFn: configApi.configApplication,
    select: (res) => res.data,
    enabled,
    refetchOnWindowFocus: true,
    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0,
    staleTime: 0,
    retry: 0,
    meta: {
      persist: false,
    },
  });
}