import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import supportApi from '@/features/support/api';
import { SupportMessageListResponse, SupportTicketListResponse } from '@/features/support/types';

export const useSupportCategoriesQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['supportApi-categories'],
    queryFn: supportApi.listCategories,
    select: (res) => res.data,
    enabled,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    retry: 0,
    meta: { persist: false },
  });
};

export const useSupportTicketsQuery = (params: Record<string, any>, enabled: boolean) => {
  return useInfiniteQuery<SupportTicketListResponse>({
    queryKey: ['supportApi-tickets', params],
    queryFn: async ({ pageParam }) =>
      supportApi.listTickets({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    gcTime: 0,
    refetchInterval: enabled ? 30 * 1000 : false,
    retry: 0,
    meta: { persist: false },
  });
};

export const useSupportMessagesQuery = (
  ticketId: string | number | undefined,
  params: Record<string, any>,
  enabled: boolean
) => {
  return useInfiniteQuery<SupportMessageListResponse>({
    queryKey: ['supportApi-messages', ticketId, params],
    queryFn: async ({ pageParam }) =>
      supportApi.listMessages(ticketId!, {
        ...params,
        page: pageParam as number,
        per_page: params.per_page ?? 20,
      }),
    enabled: !!ticketId && enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    gcTime: 0,
    retry: 0,
    meta: { persist: false },
  });
};

export const useSupportTicketQuery = (ticketId: string | number | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ['supportApi-ticket', ticketId],
    queryFn: () => supportApi.detailTicket(ticketId!),
    select: (res) => res.data,
    enabled: !!ticketId && enabled,
    gcTime: 0,
    staleTime: 0,
    retry: 0,
    meta: { persist: false },
  });
};
