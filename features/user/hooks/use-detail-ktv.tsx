import { useUserServiceStore } from '@/features/user/stores';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import { goBack } from '@/lib/utils';
import { ServiceCategoryItem } from '@/features/user/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { usePrepareBookingStore } from '@/features/profile/stores';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

/**
 * Xử lý man chi tiết KTV
 */
export const useDetailKtv = () => {
  const ktv = useUserServiceStore((s) => s.ktv);

  const setKtv = useUserServiceStore((s) => s.setKtv);

  const setItem = usePrepareBookingStore((s) => s.setItem);

  const bottomServiceRef = useRef<BottomSheetModal>(null);

  const [serviceData, setServiceData] = useState<ServiceCategoryItem | null>(null);

  const { mutate } = useMutationKtvDetail();

  const handleError = useErrorToast();

  const [loading,setLoading] = useState(false);

  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    // Chỉ tự thoát khi màn detail đang focus, tránh pop nhầm khi screen nằm dưới modal/result.
    if (isFocused && !ktv) {
      goBack();
    }
  }, [isFocused, ktv]);

  // Lấy lại thông tin của KTV
  const refreshPage = useCallback(() => {
    if (ktv) {
      setLoading(true);
      mutate(ktv.id, {
        onSuccess: (res) => {
          setKtv(res.data);
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

  // Mở bottom sheet để chọn dịch vụ
  const handleOpenServiceSheet = useCallback((item:ServiceCategoryItem) => {
    bottomServiceRef.current?.present();
    setServiceData(item);
  }, []);

  // Đóng bottom sheet khi chọn dịch vụ
  const handleDismissServiceSheet = useCallback(() => {
    setServiceData(null);
  }, []);

  // Xử lý chọn dịch vụ
  const handlePrepareBooking = useCallback((option: {id: string, price:string, duration: number}[]) => {
    bottomServiceRef.current?.dismiss();
    handleDismissServiceSheet();
    if (serviceData && ktv) {
      setItem({
        service: {
          category_id: serviceData.id,
          name: serviceData.name,
          image_url: serviceData.image_url,
          options: option,
        },
        ktv: {
          id: ktv.id,
          name: ktv.name,
          image_url: ktv.profile.avatar_url,
          rating: ktv.rating,
        },
      });
      router.push('/(app)/(customer)/(service)/service-booking');
    }
  }, [serviceData, ktv]);


  return {
    detail: ktv,
    loading,
    refreshPage,
    bottomServiceRef,
    serviceData,
    handleOpenServiceSheet,
    handleDismissServiceSheet,
    handlePrepareBooking
  };
};
