import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestApi } from '@/features/service-request/api';
import { SERVICE_REQUEST_KEYS } from '@/features/service-request/hooks/use-query';
import { _CreateServiceRequestInput } from '@/features/service-request/types';

export const useCreateServiceRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: _CreateServiceRequestInput) =>
      serviceRequestApi.createServiceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SERVICE_REQUEST_KEYS.customerRequests,
      });
    },
  });
};

export const useCustomerRespondProposalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proposalId,
      accept,
    }: {
      proposalId: number;
      accept: boolean;
    }) => serviceRequestApi.respondProposalByCustomer(proposalId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SERVICE_REQUEST_KEYS.customerRequests,
      });
    },
  });
};

export const useKtvRespondProposalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      proposalId,
      accept,
    }: {
      proposalId: number;
      accept: boolean;
    }) => serviceRequestApi.respondProposalByKtv(proposalId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SERVICE_REQUEST_KEYS.ktvProposals,
      });
    },
  });
};
