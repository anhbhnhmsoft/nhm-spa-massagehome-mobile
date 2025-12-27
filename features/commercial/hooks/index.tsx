import { useListCommercialCouponQuery } from '@/features/commercial/hooks/use-query';
import { useEffect, useState } from 'react';
import { useCollectCouponMutation } from '@/features/commercial/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { router } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _TIME_OUT_LOADING_SCREEN_LAYOUT } from '@/lib/const';
import { _UserRole } from '@/features/auth/const';

// Hook để quản lý việc thu thập mã giảm giá
export const useCommercialCoupon = () => {
  const [callApi, setCallApi] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const handleError = useErrorToast();
  const user = useAuthStore((state) => state.user);
  const query = useListCommercialCouponQuery(callApi);

  const { mutate, isPending } = useCollectCouponMutation();

  useEffect(() => {
    // Set timeout to call API after loading screen layout
    const timer = setTimeout(() => {
      // Chỉ gọi API khi có user và role khác KTV
      if (!user || user.role !== _UserRole.KTV) {
        setCallApi(true);
      }
    }, _TIME_OUT_LOADING_SCREEN_LAYOUT);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    // Check if the query is successful and has data
    if (query.isSuccess && (query.data?.length || 0) > 0) {
      setIsVisible(true);
    }
  }, [query.isSuccess, query.data]);

  const collectCoupon = (id: string) => {
    mutate(id, {
      onSuccess: (res) => {
        const data = res.data;
        // đối với trường hợp cần đăng nhập
        if (data.need_login) {
          router.push('/(auth)');
        } else {
          // không thì chuyển hướng đến trang ví
          router.push({
            pathname: '/(app)/(profile)/wallet',
            params: {
              toTabWallet: 'coupon',
            },
          });
        }
      },
      onError: (err) => {
        handleError(err);
      },
      onSettled: () => {
        setIsVisible(false);
      },
    });
  };

  return {
    isVisible,
    collectCoupon,
    isPending,
    setIsVisible,
    data: query.data || [],
  };
};
