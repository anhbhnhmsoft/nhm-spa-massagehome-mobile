import ktvApi from '@/features/ktv/api';
import { useQuery } from '@tanstack/react-query';


export const useDashboardKtvQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-dashboard'],
    queryFn: () => ktvApi.dashboard(),
    select: (res) => res.data,
  });
};
