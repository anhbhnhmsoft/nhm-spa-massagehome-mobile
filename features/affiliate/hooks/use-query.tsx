import { useQuery } from '@tanstack/react-query';
import affiliateApi from '@/features/affiliate/api';

// lây cấu hình affiliate
export const useQueryGetConfigAffiliate = () => {
  return useQuery({
    queryKey: ['affiliateApi-config'],
    queryFn: () => affiliateApi.config(),
    select: res => res.data
  });
}
