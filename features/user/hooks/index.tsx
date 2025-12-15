import { useInfiniteListKTV } from '@/features/user/hooks/use-query';
import { KTVListFilterPatch, ListKTVRequest } from '@/features/user/types';
import { useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import useUserServiceStore, { useKTVStore } from '@/features/user/stores';
import { useGetServiceList } from '@/features/service/hooks';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus } from '@/features/auth/const';


export const useGetListKTV = (initialParams: Omit<ListKTVRequest, 'filter'>) => {
  const params = useKTVStore((state) => state.params);
  const setFilter = useKTVStore((state) => state.setFilter);

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
    setFilter,
    params,
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

  return useCallback((id: string) => {
      if (status === _AuthStatus.UNAUTHORIZED ) {
        router.push(`/(auth)`);
      }else{
        setLoading(true);
        mutate(id, {
          onSuccess: (res) => {
            setKtv(res.data);
            router.push('/(app)/(service)/masseurs-detail');
          },
          onError: (error) => {
            handleError(error);
          },
          onSettled: () => {
            setLoading(false);
          }
        });
      }
    },
    [status]
  );
};

/**
 * Lấy thông tin ktv và danh sách dịch vụ của ktv đó
 */
export const useKTVDetail = () => {
  const ktv = useUserServiceStore((s) => s.ktv);

  useEffect(() => {
    // Nếu không có massager, quay lại màn hình trước
    if (!ktv) {
      router.back();
    }
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

/**
 * Xử lý màn hình profile
 */
export const useProfile = () => {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);


  // Chuyển hướng đến màn hình đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!user && status === _AuthStatus.UNAUTHORIZED) {
      router.push('/(auth)');
    }
  }, [user, status]);

  return {
    user,
  };
};
