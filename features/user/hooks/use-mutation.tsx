import { useMutation } from '@tanstack/react-query';
import userApi from '@/features/user/api';
import { ApplyPartnerRequest, ApplyPartnerResponse } from '@/features/user/types';

export const useMutationKtvDetail = () => {
  return useMutation({
    mutationFn: (ktvId: string) => userApi.detailKTV(ktvId),
  });
};

export const useMutationApplyPartner = () => {
  return useMutation({
    mutationFn: (payload: FormData) => userApi.applyPartner(payload),
  });
};
