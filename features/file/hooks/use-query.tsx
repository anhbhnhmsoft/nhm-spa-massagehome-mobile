import { useQuery } from '@tanstack/react-query';
import { fileApi } from '../api';

export const useGetFileQuery = (type?: number) => {
  return useQuery({
    queryKey: ['file-api', type],
    queryFn: () => fileApi.getContractFile(type as number),
    enabled: !!type,
    select: (res) => res.data,
    staleTime: 0,
    gcTime: 1000 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
};
