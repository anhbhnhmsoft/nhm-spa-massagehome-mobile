import { useQuery } from '@tanstack/react-query';
import commercialApi from '@/features/commercial/api';


/**
 * Hook để lấy danh sách banner
 */
export const useListBannerQuery = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: commercialApi.listBanners,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
  })
}