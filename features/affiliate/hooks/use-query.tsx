import { useQuery } from '@tanstack/react-query';
import affiliateApi from '@/features/affiliate/api';

// lây cấu hình affiliate
export const useQueryGetConfigAffiliate = () => {
  return useQuery({
    queryKey: ['affiliateApi-config'],
    queryFn: () => affiliateApi.config(),
    select: (res) => res.data,
  });
};

export const useQueryMatchAffiliate = () => {
  return useQuery({
    queryKey: ['userApi-matchAffiliate'],
    queryFn: async () => {
      return affiliateApi.matchAffilate();
    },
    select: (res) => res.data,
  });
};
