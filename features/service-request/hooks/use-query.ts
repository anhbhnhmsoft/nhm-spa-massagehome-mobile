import { useQuery } from '@tanstack/react-query';
import { serviceRequestApi } from '@/features/service-request/api';
import { _ServiceRequestStatus } from '@/features/service-request/types';

export const SERVICE_REQUEST_KEYS = {
  customerRequests: ['serviceRequestApi-customerRequests'] as const,
  ktvProposals: ['serviceRequestApi-ktvProposals'] as const,
};

// Khớp ServiceRequestStatus::openStatuses() phía backend
const OPEN_SERVICE_REQUEST_STATUSES = [
  _ServiceRequestStatus.NEW,
  _ServiceRequestStatus.ASSIGNED,
  _ServiceRequestStatus.SEARCHING_KTV,
  _ServiceRequestStatus.PROPOSAL_SENT,
  _ServiceRequestStatus.WAITING_CUSTOMER_CONFIRM,
];

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

export const useActiveCustomerServiceRequestsQuery = (options?: {
  refetchInterval?: number | false;
}) => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.customerRequests,
    queryFn: () => serviceRequestApi.getCustomerRequests(),
    select: (res) =>
      (Array.isArray(res.data) ? res.data : []).filter((r) =>
        OPEN_SERVICE_REQUEST_STATUSES.includes(r.status)
      ),
    refetchInterval: options?.refetchInterval ?? 5000,
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
