import { useMutation } from '@tanstack/react-query';
import { UpdateAgencyRequest } from '@/features/agency/type';
import { agencyApi } from '@/features/agency/api';

export const useEditProfileAgencyMutation = () => {
  return useMutation({
    mutationFn: (data: UpdateAgencyRequest) => agencyApi.editProfile(data),
  });
};
