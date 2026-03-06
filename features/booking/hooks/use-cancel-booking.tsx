import { useCallback, useRef, useState } from 'react';
import useToast from '@/features/app/hooks/use-toast';
import {  useCancelBookingMutation } from '@/features/booking/hooks/use-mutation';
import { Alert } from 'react-native';
import { t } from 'i18next';
import { getMessageError } from '@/lib/utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';


export const useCancelBooking = (onSuccess: () => void) => {
  const ref  = useRef<BottomSheetModal>(null);

  const { error } = useToast();
  const { mutate: cancelBooking, isPending: loading } = useCancelBookingMutation();

  const [bookingIdCancel, setBookingIdCancel] = useState<string>('');

  // hủy dịch vụ
  const handleSubmit = useCallback((reason: string) => {
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
                    onSuccess();
                    ref.current?.dismiss();
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
    [bookingIdCancel, onSuccess]
  );

  const handleOpen = useCallback((bookingId: string) => {
    ref.current?.present();
    setBookingIdCancel(bookingId);
  }, []);

  return {
    ref,
    handleOpen,
    handleSubmit,
    loading,
  }
}