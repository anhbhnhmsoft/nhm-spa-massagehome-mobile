import { useAuthStore } from '@/features/auth/stores';
import { useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQueryKTVConversations } from '@/features/chat/hooks/use-query';
import {
  KTVConversationItem,
  KTVConversationResponse,
  PayloadNewMessage,
} from '@/features/chat/types';
import { InfiniteData } from '@tanstack/query-core';
import { produce } from 'immer';
import { queryClient } from '@/lib/provider/query-provider';
import SocketService from '@/features/chat/socket-service';
import { _ChatConstant } from '@/features/chat/consts';

// Lấy danh sách cuộc trò chuyện KTV
export const useGetKTVConversations = () => {
  const token = useAuthStore((state) => state.token);

  // Cấu hình params (Dùng useMemo để tránh re-render object gây fetch lại vô lý)
  const paramsSearch = useMemo(
    () => ({
      filter: {},
      per_page: 15,
      page: 1,
    }),
    []
  );

  // 2. Gọi Hook Infinite Query
  const query = useInfiniteQueryKTVConversations(paramsSearch);

  // 3. Làm phẳng dữ liệu từ Infinite Pages thành Array đơn giản để hiển thị FlatList
  const conversations = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  // Handler xử lý khi có tin nhắn mới
  const handleSocketUpdate = useCallback(
    (payload: PayloadNewMessage) => {
      const queryKey = ['chatApi-listKTVConversations', paramsSearch];
      queryClient.setQueryData<InfiniteData<KTVConversationResponse>>(queryKey, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return produce(oldData, (draft) => {
          let foundItem: KTVConversationItem | null = null;
          // A. TÌM VÀ CẮT (Duyệt qua các pages)
          for (const page of draft.pages) {
            const list = page.data.data;
            // Tìm index trong mảng items
            const index = list.findIndex((item) => item.id === payload.room_id);
            if (index !== -1) {
              foundItem = list[index]; // Giữ lại item cũ (proxy)
              list.splice(index, 1); // Xóa khỏi vị trí cũ
              break;
            }
          }
          // CHUẨN BỊ ITEM MỚI HOẶC UPDATE ITEM CŨ
          if (foundItem) {
            // Đã tồn tại -> Update
            foundItem.unread_count = (foundItem.unread_count || 0) + 1;
            foundItem.latest_message = {
              id: payload.id?.toString() || Date.now().toString(),
              content: payload.content,
              created_at: payload.created_at,
            };
          } else {
            // Mới tinh -> Tạo mới đúng chuẩn Type KTVConversationItem
            foundItem = {
              id: payload.room_id,
              customer: {
                id: payload.sender_id,
                name: payload.sender_name,
                avatar: payload.sender_avatar || null,
              },
              unread_count: 1,
              latest_message: {
                id: payload.id?.toString(),
                content: payload.content,
                created_at: payload.created_at,
              },
            };
          }

          // CHÈN LÊN ĐẦU TRANG 1
          if (draft.pages.length > 0) {
            draft.pages[0].data.data.unshift(foundItem);
          }
        });
      });
    },
    [queryClient, paramsSearch]
  );

  // 4. Xử lý Realtime Socket
  useEffect(() => {
    if (!token) return;
    // Lấy lại dữ liệu mới khi có sự thay đổi trên socket
    query.refetch();
    // Đảm bảo socket đã kết nối
    const socket = SocketService.connect(token);

    // Đăng ký lắng nghe sự kiện
    socket.on(_ChatConstant.CHAT_CONVERSATION_UPDATE, handleSocketUpdate);

    // Cleanup khi unmount
    return () => {
      socket.off(_ChatConstant.CHAT_CONVERSATION_UPDATE, handleSocketUpdate);
      // Không cần ngắt kết nối socket
      SocketService.disconnect();
    };
  }, [token, paramsSearch]); // Dependencies quan trọng

  return {
    conversations,
    ...query,
  };
};
