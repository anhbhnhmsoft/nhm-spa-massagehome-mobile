import { useInfiniteListKTV } from '@/features/user/hooks/use-query';
import { ListKTVRequest } from '@/features/user/types';
import { useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import useUserServiceStore from '@/features/user/stores';
import { useGetServiceList } from '@/features/service/hooks';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus } from '@/features/auth/const';

export const useGetListKTV = (params: ListKTVRequest) => {
  const query = useInfiniteListKTV(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
  };
};

/**
 * Lưu thông tin massager vào store và chuyển hướng đến màn hình chi tiết massager
 */
export const useSetKtv = () => {
  const setKtv = useUserServiceStore((s) => s.setKtv);

  const status = useAuthStore((s) => s.status);

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  const { mutate } = useMutationKtvDetail();

  return useCallback(
    (id: string) => {
      setLoading(true);
      if (status === _AuthStatus.UNAUTHORIZED ) {
        router.push(`/(auth)`);
        setLoading(false);
      }
      mutate(id, {
        onSuccess: (res) => {
          setKtv(res.data);
          setLoading(false);
          router.push('/(service)/masseurs-detail');
        },
        onError: (error) => {
          setLoading(false);
          handleError(error);
        },
      });
    },
    [status]
  );
};

/**
 * Lấy thông tin ktv và danh sách dịch vụ của ktv đó
 */
export const useKTVDetail = () => {
  const ktv = useUserServiceStore((s) => s.ktv);
  const setKtv = useUserServiceStore((s) => s.setKtv);

  useEffect(() => {
    // Nếu không có massager, quay lại màn hình trước
    if (!ktv) {
      router.back();
    }
    // Xóa massager khi component unmount
    return () => setKtv(null);
  }, [ktv]);

  const serviceParams = useMemo(
    () => ({
      filter: {
        user_id: ktv?.id,
      },
      page: 1,
      per_page: 5,
    }),
    [ktv?.id]
  );

  const queryServices = useGetServiceList(serviceParams, !!ktv);

  return {
    ktv,
    queryServices,
  };
};