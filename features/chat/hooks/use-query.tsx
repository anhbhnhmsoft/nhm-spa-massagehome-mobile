import {
  KTVConversationRequest,
  KTVConversationResponse,
  ListMessageRequest,
  ListMessageResponse,
} from '@/features/chat/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import chatApi from '@/features/chat/api';


/**
 * Hook để lấy danh sách tin nhắn trong phòng chat
 * @param params - Tham số lọc tin nhắn
 * @param roomId - ID phòng chat (nếu có)
 * @param enabled - Có thể thực hiện truy vấn hay không
 */
export const useInfiniteQueryListMessage = (
  params: ListMessageRequest,
  roomId?: string,
  enabled?: boolean,
) => {
  return useInfiniteQuery<ListMessageResponse>({
    queryKey: ['chatApi-listMessages', roomId, params],
    queryFn: async ({ pageParam }) => {
      return chatApi.listMessages(roomId!,{
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled: !!roomId && enabled,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      if (currentPage < lastPageNum) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,

    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0,      // (Garbage Collection Time) = 0: Xóa khỏi bộ nhớ ngay khi component unmount
    retry: 0,       // Check token lỗi thì fail luôn, đừng thử lại (để logout luôn)
    // --- Đánh dấu để không lưu xuống AsyncStorage ---
    meta: {
      persist: false,
    },
  });
}


export const useInfiniteQueryKTVConversations = (
  params: KTVConversationRequest,
  enabled?: boolean,
) => {
  return useInfiniteQuery<KTVConversationResponse>({
    queryKey: ['chatApi-listKTVConversations', params],
    queryFn: async ({ pageParam }) => {
      return chatApi.listKTVConversations({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled: enabled,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      if (currentPage < lastPageNum) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0,      // (Garbage Collection Time) = 0: Xóa khỏi bộ nhớ ngay khi component unmount
    retry: 0,       // Check token lỗi thì fail luôn, đừng thử lại (để logout luôn)
    // --- Đánh dấu để không lưu xuống AsyncStorage ---
    meta: {
      persist: false,
    },
  });
}
