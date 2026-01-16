import { useInfiniteBookingList, useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useCallback, useMemo, useState } from 'react';
import { ListBookingRequest } from '@/features/booking/types';
import { useImmer } from 'use-immer';
import { _BookingStatus } from '@/features/service/const';
import { useCancelBookingCustomerMutation } from '@/features/booking/hooks/use-mutation';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useApplicationStore from '@/lib/store';

// Lấy thông tin đặt lịch
export const useCheckBooking = (id: string | null) => {
  const query = useQueryBookingCheck(id);
  const status = useMemo(() => {
    return query.data?.status || 'waiting';
  }, [query.data]);

  return {
    status,
    data: query.data,
  };
};

// Lấy danh sách đặt lịch

export const useGetBookingList = () => {
  const { t } = useTranslation();
  const [params, setParams] = useImmer<ListBookingRequest>({
    filter: {
      status: _BookingStatus.PENDING,
    },
    page: 1,
    per_page: 10,
  });
  const setLoading = useApplicationStore((state) => state.setLoading);
  const setFilter = useCallback(
    (filterPatch: Partial<ListBookingRequest['filter']>) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams]
  );
  const { warning, error } = useToast();
  const handleError = useErrorToast();
  const [showModalCancelBooking, setShowModalCancelBooking] = useState(false);
  const { mutate: cancelBooking } = useCancelBookingCustomerMutation();
  const [cancelReason, setCancelReason] = useState<string>('');
  const [bookingIdCancel, setBookingIdCancel] = useState<string>('');

  const query = useInfiniteBookingList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  const handleCancelBooking = useCallback(
    (reason: string) => {
      if (!bookingIdCancel) return;
      setLoading(true);
      cancelBooking(
        { booking_id: bookingIdCancel, reason },
        {
          onSuccess: () => {
            query.refetch();
          },
          onError: (err: any) => {
            console.error(err);
            handleError(err);
          },
          onSettled: () => {
            setLoading(false);
          },
        }
      );
    },
    [cancelBooking, bookingIdCancel]
  );

  const handleConfirmCancel = useCallback(() => {
    if (cancelReason.trim().length === 0) {
      Alert.alert(t('statistics_desc.notification'), 'Vui lòng nhập lý do huỷ');
      return;
    }

    Alert.alert(
      t('booking.booking_cancel_confirm_title'),
      t('booking.booking_cancel_confirm_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.accept'),
          style: 'destructive',
          onPress: () => {
            handleCancelBooking(cancelReason);
            setShowModalCancelBooking(false);
          },
        },
      ]
    );
  }, [cancelReason, handleCancelBooking, t]);

  const handleOpenModalCancelBooking = useCallback((bookingId: string) => {
    setShowModalCancelBooking(true);
    setBookingIdCancel(bookingId);
    setCancelReason('');
  }, []);
  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
    cancelReason,
    showModalCancelBooking,
    setShowModalCancelBooking,
    setBookingIdCancel,
    handleOpenModalCancelBooking,
    handleConfirmCancel,
    setCancelReason,
  };
};
