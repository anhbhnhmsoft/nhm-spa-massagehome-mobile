import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';
import useAuthStore from '@/features/auth/store';
import { router } from 'expo-router';
import { useScanQRCodeKtv } from '@/features/ktv/hooks';
import { _UserRole } from '@/features/auth/const';

export enum _LinkingTask {
  INVITE_KTV = 'invite-ktv',
}

const useHandleLinking = (complete: boolean) => {
  const url = Linking.useLinkingURL();
  const user = useAuthStore((state) => state.user);
  const handleScanQRCodeKtv = useScanQRCodeKtv();

  // 1. Dùng useRef để lưu vết URL đã xử lý xong
  const lastProcessedUrl = useRef<string | null>(null);

  useEffect(() => {
    // Nếu chưa hydrate xong hoặc không có url thì bỏ qua
    if (!complete || !url) {
      return;
    }
    // Nếu URL này giống hệt URL vừa xử lý xong thì dừng
    if (url === lastProcessedUrl.current) {
      return;
    }
    const { queryParams } = Linking.parse(url);
    if (!queryParams) return;

    const task = queryParams.task as _LinkingTask | undefined;
    if (!task) return;

    // Đánh dấu là đã xử lý URL này để không bị lặp lại ở lần render sau
    lastProcessedUrl.current = url;

    // --- BẮT ĐẦU XỬ LÝ LOGIC ---
    if (!user) {
      router.push('/(auth)');
      return;
    }

    switch (task) {
      case _LinkingTask.INVITE_KTV:
        const referrer_id = queryParams.referrer_id as string | undefined;
        if (referrer_id) {
          if (user.role === _UserRole.CUSTOMER) {
            router.push({
              pathname: '/(app)/(profile)/partner-register-individual',
              params: { referrer_id },
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
