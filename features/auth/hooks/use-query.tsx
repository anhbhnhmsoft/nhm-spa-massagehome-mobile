import { useQuery } from '@tanstack/react-query';
import authApi from '@/features/auth/api';

/**
 * Hook để lấy profile user
 */
export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['authApi-profile'],
    queryFn: authApi.profile,
    enabled: false,
    select: (res) => res.data.user,
    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0, // (Garbage Collection Time) = 0: Xóa khỏi bộ nhớ ngay khi component unmount
    staleTime: 0, // = 0: Luôn coi data là "ũ" -> Gọi API mới mỗi khi mount lại
    retry: 0, // Check token lỗi thì fail luôn, đừng thử lại (để logout luôn)
    // --- Đánh dấu để không lưu xuống AsyncStorage ---
    meta: {
      persist: false,
    },
  });
};

/**
 * Hook để heartbeat user
 */
export const useHeartbeatQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['authApi-heartbeat'],
    queryFn: authApi.heartbeat,
    enabled,
    refetchInterval: 1000 * 60 * 2, // 2 phút
    // Không refetch khi ứng dụng đang chạy trong background
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true, // Refetch khi ứng dụng quay lại focus

    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0, // (Garbage Collection Time) = 0: Xóa khỏi bộ nhớ ngay khi component unmount
    retry: 0, // Check token lỗi thì fail luôn, đừng thử lại (để logout luôn)
    // --- Đánh dấu để không lưu xuống AsyncStorage ---
    meta: {
      persist: false,
    },
  });
};
