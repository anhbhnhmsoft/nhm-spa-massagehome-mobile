import { useQuery } from '@tanstack/react-query';
import { serviceRequestApi } from '@/features/service-request/api';

export const SERVICE_REQUEST_KEYS = {
  customerRequests: ['serviceRequestApi-customerRequests'] as const,
  ktvProposals: ['serviceRequestApi-ktvProposals'] as const,
};

export const useCustomerServiceRequestsQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.customerRequests,
    queryFn: () => serviceRequestApi.getCustomerRequests(),
    select: (res) => res.data,
    refetchInterval: options?.refetchInterval ?? 5000, // Dynamic polling every 5s for active matching
  });
};

export const useKtvProposalsQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.ktvProposals,
    queryFn: () => serviceRequestApi.getKtvProposals(),
    select: (res) => res.data,
    refetchInterval: options?.refetchInterval ?? 5000, // Dynamic polling every 5s for new proposals
  });
};
