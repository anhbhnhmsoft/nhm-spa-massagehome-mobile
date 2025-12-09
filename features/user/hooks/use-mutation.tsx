import { useMutation } from '@tanstack/react-query';
import userApi from '@/features/user/api';

export const useMutationKtvDetail = () => {
  return useMutation({
    mutationFn: (ktvId: string) => userApi.detailKTV(ktvId),
  });
};
