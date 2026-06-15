import { usePrepareBookingStore } from '@/features/profile/stores';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMessageError, goBack } from '@/lib/utils';
import { useApplicationStore } from '@/features/app/stores';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { BookingServiceRequest, PrepareBookingResponse } from '@/features/booking/types';
import { useQueryListCoupon } from '@/features/service/hooks/use-query';
import {
  useMutationBookingService,
  useMutationPrepareBooking,
} from '@/features/booking/hooks/use-mutation';
import { useBookingStore } from '@/features/booking/stores';
import { router } from 'expo-router';
import { useWalletStore } from '@/features/payment/stores';
import { useConfigPaymentMutation } from '@/features/payment/hooks/use-mutation';

/**
 * Hook dùng cho booking
 */
export const useBooking = () => {
  const { t } = useTranslation();

  const item = usePrepareBookingStore((s) => s.item);

  const userLocation = useApplicationStore((s) => s.location);

  const setBookingId = useBookingStore((s) => s.setBookingId);
  const setPendingTopupBookingPayload = useBookingStore((s) => s.setPendingTopupBookingPayload);
  const pendingTopupBookingPayload = useBookingStore((s) => s.pending_topup_booking_payload);

  const setLoading = useApplicationStore((s) => s.setLoading);
  const setConfigPayment = useWalletStore((state) => state.setConfigPayment);
  const setDepositContext = useWalletStore((state) => state.setDepositContext);
  const { mutate: mutateConfigPayment } = useConfigPaymentMutation();

  const form = useForm<BookingServiceRequest>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        ktv_id: z.string(),
        category_id: z.string(),
        option_ids: z.array(z.string()).min(1, {
          error: t('services.error.require_option'),
        }),
        note: z.string().optional(),
        address: z.string().trim().min(1, {
          error: t('location.error.invalid_address'),
        }),
        latitude: z.number({
          error: t('services.error.invalid_address'),
        }),
        longitude: z.number({
          error: t('services.error.invalid_address'),
        }),
        coupon_id: z.string().nullable().optional(),
      })
    ),
    defaultValues: {
      category_id: '',
      option_ids: [],
      note: '',
      address: '',
      latitude: 0,
      longitude: 0,
      coupon_id: null,
    },
  });
  const { watch } = form;
  const currentOptionIds = useMemo(
    () => item?.service.options.map((option) => option.id) || [],
    [item]
  ) as string[];

  const isPendingPayloadMatchedCurrentItem = useCallback(() => {
    if (!item || !pendingTopupBookingPayload) return false;

    const pendingOptionIds = Array.isArray(pendingTopupBookingPayload.option_ids)
      ? pendingTopupBookingPayload.option_ids
      : [];

    return (
      pendingTopupBookingPayload.category_id === item.service.category_id
      && pendingTopupBookingPayload.ktv_id === item.ktv.id
      && pendingOptionIds.length === currentOptionIds.length
      && pendingOptionIds.every((optionId: string, index: number) => optionId === currentOptionIds[index])
    );
  }, [currentOptionIds, item, pendingTopupBookingPayload]);

  // redirect nếu không có item
  useEffect(() => {
    if (!item) {
      goBack();
      return;
    }

    const shouldRestorePendingPayload = isPendingPayloadMatchedCurrentItem();

    form.reset({
      category_id: item.service.category_id,
      option_ids: currentOptionIds,
      ktv_id: item.ktv.id,
      note: shouldRestorePendingPayload ? pendingTopupBookingPayload?.note || '' : '',
      address: shouldRestorePendingPayload ? pendingTopupBookingPayload?.address || '' : '',
      latitude: shouldRestorePendingPayload ? Number(pendingTopupBookingPayload?.latitude ?? 0) : 0,
      longitude: shouldRestorePendingPayload ? Number(pendingTopupBookingPayload?.longitude ?? 0) : 0,
      coupon_id: shouldRestorePendingPayload ? pendingTopupBookingPayload?.coupon_id || null : null,
    });

    if (pendingTopupBookingPayload && !shouldRestorePendingPayload) {
      setPendingTopupBookingPayload(null);
    }
  }, [
    currentOptionIds,
    form,
    isPendingPayloadMatchedCurrentItem,
    item,
    pendingTopupBookingPayload,
    setPendingTopupBookingPayload,
  ]);

  // auto fill location
  useEffect(() => {
    if (!userLocation) return;

    const currentAddress = form.getValues('address');
    const currentLatitude = form.getValues('latitude');
    const currentLongitude = form.getValues('longitude');
    const hasExistingAddress = !!currentAddress?.trim();
    const hasExistingCoordinates =
      Number.isFinite(currentLatitude) &&
      Number.isFinite(currentLongitude) &&
      !(currentLatitude === 0 && currentLongitude === 0);

    if (hasExistingAddress && hasExistingCoordinates) {
      return;
    }

    form.setValue('address', userLocation.address, { shouldValidate: true });
    form.setValue('latitude', userLocation.location.coords.latitude, { shouldValidate: true });
    form.setValue('longitude', userLocation.location.coords.longitude, { shouldValidate: true });
  }, [form, userLocation]);

  const queryCoupon = useQueryListCoupon({ filter: {} }, true);

  const { mutate: mutateBookingService, isPending: loadingBookingService } =
    useMutationBookingService();

  const [dataPricing, setDataPricing] = useState<PrepareBookingResponse['data'] | null>(null);

  const [error, setError] = useState<string | null>(null);

  const { mutate: mutatePrepareBooking, isPending: loadingPrepareBooking } =
    useMutationPrepareBooking();

  const latestPrepareRequestRef = useRef(0);

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const address = watch('address');
  const coupon_id = watch('coupon_id');
  const hasValidAddress = !!address?.trim();
  const hasValidCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0);

  const handleSelectCoupon = useCallback((couponId: string | null) => {
    setError(null);
    form.setValue('coupon_id', couponId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [form]);

  useEffect(() => {
    if (!item || !hasValidAddress || !hasValidCoordinates) {
      setDataPricing(null);
      setError(null);
      return;
    }

    if (item && hasValidAddress && hasValidCoordinates) {
      const requestId = latestPrepareRequestRef.current + 1;
      latestPrepareRequestRef.current = requestId;

      mutatePrepareBooking(
        {
          category_id: item!.service.category_id,
          option_ids: item!.service.options.map((option) => option.id),
          ktv_id: item!.ktv.id,
          latitude,
          longitude,
          coupon_id: coupon_id || null,
        },
        {
          onSuccess: (res) => {
            if (latestPrepareRequestRef.current !== requestId) return;
            setDataPricing(res.data);
            setError(null);
          },
          onError: (err) => {
            if (latestPrepareRequestRef.current !== requestId) return;
            const message = getMessageError(err, t);
            setError(message || t('common_error.unknown_error'));
            setDataPricing(null);
          },
        }
      );
    }
  }, [address, coupon_id, hasValidAddress, hasValidCoordinates, item, latitude, longitude, mutatePrepareBooking, t]);

  const handleBookingService = useCallback(
    (data: BookingServiceRequest) => {
      if (!item) return;

      const bookingPayload: BookingServiceRequest = {
        ...data,
        category_id: item.service.category_id,
        option_ids: item.service.options.map((option) => option.id),
        ktv_id: item.ktv.id,
      };

      if (dataPricing && !dataPricing.is_balance_enough) {
        const missingAmount = String(Math.ceil(dataPricing.required_topup_amount || 0));
        setLoading(true);
        setPendingTopupBookingPayload(bookingPayload);
        mutateConfigPayment(undefined, {
          onSuccess: (res) => {
            setConfigPayment(res.data);
            setDepositContext({
              source: 'booking_topup',
              amountPreset: missingAmount,
              returnPath: '/(app)/(customer)/(service)/service-booking',
            });
            router.push('/(app)/(customer)/(profile)/deposit');
          },
          onError: (err) => {
            const message = getMessageError(err, t);
            setError(message || t('common_error.unknown_error'));
          },
          onSettled: () => {
            setLoading(false);
          },
        });
        return;
      }

      setLoading(true);
      mutateBookingService(bookingPayload, {
        onSuccess: (res) => {
          setBookingId(res.data.booking_id);
          setPendingTopupBookingPayload(null);
          router.push('/(app)/(customer)/(service)/service-booking-result');
        },
        onError: (err) => {
          const message = getMessageError(err, t);
          setError(message || t('common_error.unknown_error'));
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    },
    [
      dataPricing,
      item,
      mutateBookingService,
      mutateConfigPayment,
      setBookingId,
      setConfigPayment,
      setDepositContext,
      setLoading,
      setPendingTopupBookingPayload,
      t,
    ]
  );

  useEffect(() => {
    setLoading(loadingBookingService);
  }, [loadingBookingService, setLoading]);

  return {
    item,
    userLocation,
    queryCoupon,
    form,
    dataPricing,
    error,
    loadingPrepareBooking,
    canSubmitBooking: hasValidAddress && hasValidCoordinates && !loadingPrepareBooking,
    handleSelectCoupon,
    handleBookingService,
  };
};
