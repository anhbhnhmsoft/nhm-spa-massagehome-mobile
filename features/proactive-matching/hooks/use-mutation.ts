import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proactiveMatchingApi } from '../api';
import { PROACTIVE_KEYS } from './use-query';

export const useSendInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: proactiveMatchingApi.sendInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROACTIVE_KEYS.nearbyDemands });
    },
  });
};

export const useRespondInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteId, accept }: { inviteId: number; accept: boolean }) =>
      proactiveMatchingApi.respondInvite(inviteId, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROACTIVE_KEYS.customerInvites });
    },
  });
};

export const useToggleProactiveStatusMutation = () => {
  return useMutation({
    mutationFn: (enabled: boolean) => proactiveMatchingApi.toggleStatus(enabled),
  });
};
