import { useMutation } from '@tanstack/react-query';
import { SupportChanelResponse } from '@/features/config/types';
import configApi from '@/features/config/api';


export const useGetListSupportChanel = () => {
  return useMutation<SupportChanelResponse>({
    mutationFn: () => configApi.listSupportChanel(),
  });
};
