import { useInfiniteListKTV, useQueryDashboardProfile } from '@/features/user/hooks/use-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import useUserServiceStore, { useKTVSearchStore } from '@/features/user/stores';
import { useGetServiceList } from '@/features/service/hooks';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useAuthStore from '@/features/auth/store';
import { useCheckAuth, useCheckAuthToRedirect } from '@/features/auth/hooks';
import { KTVDetail } from '@/features/user/types';
import { useProfileQuery } from '@/features/auth/hooks/use-query';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BarcodeScanningResult, Camera, useCameraPermissions } from 'expo-camera';
export { usePartnerRegisterForm } from '@/features/user/hooks/use-partner-register-form';
export { useFileUpload } from '@/features/user/hooks/use-file-upload';

export const useGetListKTV = () => {
  const params = useKTVSearchStore((state) => state.params);
  const setFilter = useKTVSearchStore((state) => state.setFilter);

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

export const useGetListKTVHomepage = () => {
  const query = useInfiniteListKTV({
    filter: {},
    // Sắp xếp theo đánh giá trung bình giảm dần
    sort_by: 'reviews_received_avg_rating',
    direction: 'asc',
    page: 1,
    per_page: 6,
  });
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

  const redirect = useCheckAuthToRedirect();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  const { mutate } = useMutationKtvDetail();

  return (id: string) => {
    redirect(() => {
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
        },
      });
    });
  };
};

/**
 * Lấy thông tin ktv và danh sách dịch vụ của ktv đó
 */
export const useKTVDetail = () => {
  const ktv = useUserServiceStore((s) => s.ktv);
  const setKtv = useUserServiceStore((s) => s.setKtv);
  const { mutate } = useMutationKtvDetail();
  const handleError = useErrorToast();
  const setLoading = useApplicationStore((s) => s.setLoading);

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

  const refreshPage = useCallback(() => {
    if (ktv) {
      setLoading(true);
      mutate(ktv.id, {
        onSuccess: (res) => {
          setKtv(res.data);
          queryServices.refetch();
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  }, [ktv]);

  const queryServices = useGetServiceList(serviceParams, !!ktv);

  return {
    detail: ktv as KTVDetail,
    queryServices,
    refreshPage,
  };
};

/**
 * Xử lý màn hình profile
 */
export const useProfile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const checkAuth = useCheckAuth();

  const queryProfile = useProfileQuery();

  const queryDashboard = useQueryDashboardProfile();

  // Cập nhật thông tin user khi có dữ liệu từ query
  useEffect(() => {
    if (queryProfile.data) {
      setUser(queryProfile.data);
    }
  }, [queryProfile.data]);

  // Chuyển hướng đến màn hình đăng nhập nếu chưa đăng nhập
  useEffect(() => {
    if (!checkAuth && !user) {
      router.push('/(auth)');
    }
  }, [checkAuth]);

  const isLoading = useMemo(() => {
    return (
      queryProfile.isLoading ||
      queryDashboard.isLoading ||
      queryDashboard.isRefetching ||
      queryProfile.isRefetching
    );
  }, [
    queryProfile.isLoading,
    queryDashboard.isLoading,
    queryDashboard.isRefetching,
    queryProfile.isRefetching,
  ]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const refreshProfile = useCallback(() => {
    queryProfile.refetch();
    queryDashboard.refetch();
  }, [queryProfile, queryDashboard]);

  return {
    user,
    dashboardData: queryDashboard.data,
    refreshProfile,
    isLoading,
  };
};

/**
 * Xử lý màn hình quét qr code khách hàng
 */

export const useScanQRCodeCustomer = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { t } = useTranslation();

  const [isScanning, setIsScanning] = useState(false);
  const scanningRef = useRef(false);
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const onBarcodeScanned = (result: BarcodeScanningResult) => {
    if (!isScanning || scanningRef.current || !result.data) return;

    scanningRef.current = true;
    setIsScanning(false);
    setLoading(true);

    try {
      const url = new URL(result.data);
      const agencyId = url.searchParams.get('id');

      if (!agencyId) {
        Alert.alert(t('qr_scan.invalid_title'), t('qr_scan.invalid_message'), [
          {
            text: 'OK',
            onPress: () => {
              scanningRef.current = false;
              setIsScanning(true);
            },
          },
        ]);
        return;
      }

      router.replace({
        pathname: '/(app)/(profile)/partner-register-individual',
        params: { agencyId },
      });
    } catch (error) {
      Alert.alert(t('qr_scan.invalid_title'), t('qr_scan.invalid_message'), [
        {
          text: 'OK',
          onPress: () => {
            scanningRef.current = false;
            setIsScanning(true);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const startScan = () => {
    scanningRef.current = false;
    setIsScanning(true);
  };

  const stopScan = () => {
    scanningRef.current = true;
    setIsScanning(false);
  };

  return {
    hasPermission: permission?.granted,
    isScanning,
    startScan,
    stopScan,
    onBarcodeScanned,
  };
};
