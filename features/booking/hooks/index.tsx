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
import { getMessageError } from '@/lib/utils';
import { useBookingStore } from '@/lib/ktv/useBookingStore';

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

  const handleError = useErrorToast();
  const [showModalCancelBooking, setShowModalCancelBooking] = useState(false);
  const { error } = useToast();
  const { mutate: cancelBooking, isPending: isCancelBookingPending } =
    useCancelBookingCustomerMutation();

  const [bookingIdCancel, setBookingIdCancel] = useState<string>('');
  const _hydrated = useBookingStore((s) => s._hydrated);
  const query = useInfiniteBookingList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  // hủy dịch vụ
  const handleCancelBooking = useCallback(
    (reason: string) => {
      if (reason.trim().length === 0) {
        Alert.alert(t('booking.booking_cancel_reason_required'));
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
              cancelBooking(
                { booking_id: bookingIdCancel, reason },
                {
                  onSuccess: async () => {
                    // also invalidate booking list so the list updates
                    await query.refetch();
                    setShowModalCancelBooking(false);
                  },
                  onError: (err) => {
                    const message = getMessageError(err, t);
                    if (message) {
                      error({ message: message });
                    }
                  },
                }
              );
            },
          },
        ]
      );
    },
    [bookingIdCancel]
  );

  const handleOpenModalCancelBooking = useCallback((bookingId: string) => {
    setShowModalCancelBooking(true);
    setBookingIdCancel(bookingId);
  }, []);
  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
    showModalCancelBooking,
    setShowModalCancelBooking,
    setBookingIdCancel,
    handleOpenModalCancelBooking,
    handleCancelBooking,
    isCancelBookingPending,
  };
};
