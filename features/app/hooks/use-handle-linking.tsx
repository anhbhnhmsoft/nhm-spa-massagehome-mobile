import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import useAuthStore from '@/features/auth/store';
import { router } from 'expo-router';
import { useScanQRCodeKtv } from '@/features/ktv/hooks';
import { _UserRole } from '@/features/auth/const';

export enum _LinkingTask {
  INVITE_KTV = 'invite-ktv',
}

// 1. Khai báo biến global để lưu URL đã xử lý
// Biến này sẽ tồn tại suốt phiên làm việc của App (cho đến khi kill app)
let globalLastProcessedUrl: string | null = null;

// Hàm helper nếu bạn muốn thủ công reset (ít khi cần, nhưng bạn hỏi cách clear)
export const clearLinkingHistory = () => {
  globalLastProcessedUrl = null;
};

const useHandleLinking = (complete: boolean) => {
  const url = Linking.useLinkingURL();
  const user = useAuthStore((state) => state.user);
  const handleScanQRCodeKtv = useScanQRCodeKtv();

  useEffect(() => {
    // Nếu chưa hydrate xong hoặc không có url thì bỏ qua
    if (!complete || !url) {
      return;
    }

    // 2. So sánh với biến global thay vì ref
    // Điều này ngăn chặn việc chạy lại logic khi component unmount/remount
    if (url === globalLastProcessedUrl) {
      return;
    }

    const { queryParams } = Linking.parse(url);
    if (!queryParams) return;

    const task = queryParams.task as _LinkingTask | undefined;
    if (!task) return;

    // 3. Đánh dấu URL này đã xử lý vào biến global
    globalLastProcessedUrl = url;

    // --- BẮT ĐẦU XỬ LÝ LOGIC ---
    if (!user) {
      clearLinkingHistory();
      router.push('/(auth)');
      return;
    }

    switch (task) {
      case _LinkingTask.INVITE_KTV:
        clearLinkingHistory();
        const referrer_id = queryParams.referrer_id as string | undefined;
        if (referrer_id) {
          if (user.role === _UserRole.CUSTOMER) {
            router.push({
              pathname: '/(app)/(profile)/partner-register-individual',
              params: {
                referrer_id,
                forWho: "ktv"
              },
            });
          } else if (user.role === _UserRole.KTV) {
            handleScanQRCodeKtv(referrer_id);
          }
        }
        break;
    }
  }, [url, user, complete]);
};

export default useHandleLinking;