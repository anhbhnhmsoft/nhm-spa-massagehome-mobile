import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import HeaderBack from '@/components/header-back';
import Empty from '@/components/empty';
import {
  CarouselImageKtvSection,
  InfoKtvSection,
  RecentReviewKtvSection,
  SchedulesKtvSection,
} from '@/components/app/customer';
import { Text } from '@/components/ui/text';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import { useUserServiceStore } from '@/features/user/stores';
import { useBookingStore } from '@/features/booking/stores';
import { useSelectBookingApplicationMutation } from '@/features/booking/hooks/use-mutation';
import { queryClient } from '@/lib/provider/query-provider';
import { formatBalance, getMessageError } from '@/lib/utils';
import useToast from '@/features/app/hooks/use-toast';

export default function ApplicationTechnicianDetailScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { error } = useToast();
  const bookingId = useBookingStore((state) => state.booking_id);
  const selectedApplication = useBookingStore((state) => state.selected_application);
  const applicationPreview = useBookingStore((state) => state.application_preview);
  const selectionSource = useBookingStore((state) => state.application_selection_source);
  const clearApplicationSelection = useBookingStore((state) => state.clearApplicationSelection);
  const ktv = useUserServiceStore((state) => state.ktv);
  const setKtv = useUserServiceStore((state) => state.setKtv);
  const { mutate, isPending } = useMutationKtvDetail();
  const selectMutation = useSelectBookingApplicationMutation();
  const requestedKtvIdRef = useRef<string | null>(null);
  const selectedKtvId = selectedApplication?.ktv.id ?? null;
  const hasSelectedKtvDetail = !!ktv && !!selectedKtvId && ktv.id === selectedKtvId;

  useEffect(() => {
    if (!selectedKtvId) return;
    if (ktv?.id === selectedKtvId) {
      requestedKtvIdRef.current = selectedKtvId;
      return;
    }
    if (requestedKtvIdRef.current === selectedKtvId) return;

    requestedKtvIdRef.current = selectedKtvId;

    mutate(selectedKtvId, {
      onSuccess: (res) => {
        setKtv(res.data);
      },
      onError: (err) => {
        requestedKtvIdRef.current = null;
        error({ message: getMessageError(err, t) || t('common_error.request_error') });
      },
    });
  }, [ktv?.id, mutate, selectedKtvId, setKtv]);

  const handleBack = () => {
    requestedKtvIdRef.current = null;
    clearApplicationSelection();
    setKtv(null);
    router.back();
  };

  const handleAccept = () => {
    if (!bookingId || !selectedApplication) return;

    selectMutation.mutate(
      {
        bookingId,
        applicationId: selectedApplication.id,
      },
      {
        onSuccess: async () => {
          requestedKtvIdRef.current = null;
          await queryClient.invalidateQueries({ queryKey: ['bookingApi-applications', bookingId] });
          await queryClient.invalidateQueries({ queryKey: ['bookingApi-listBookings'] });
          await queryClient.invalidateQueries({ queryKey: ['bookingApi-checkBooking', bookingId] });
          clearApplicationSelection();
          setKtv(null);
          router.back();
          if (selectionSource === 'result') {
            router.back();
          }
        },
        onError: (err) => {
          error({ message: getMessageError(err, t) || t('common_error.request_error') });
        },
      }
    );
  };

  if (!selectedApplication || !applicationPreview) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <HeaderBack title="booking.select_technician_title" onBack={handleBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-slate-500">{t('common.empty')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasSelectedKtvDetail || isPending) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <HeaderBack title="booking.select_technician_title" onBack={handleBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-3 text-sm text-slate-500">{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <HeaderBack title="booking.select_technician_title" onBack={handleBack} />

      <FlatList
        keyExtractor={(item, index) => `application-service-${item.id}-${index}`}
        data={ktv.service_categories}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <View key={item.id} className="bg-white px-5 pb-4">
            <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Text className="font-inter-bold text-base text-slate-900">{item.name}</Text>
              <Text className="mt-1 text-sm text-slate-500">
                {item.prices.length} {t('common.service')}
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View>
            <CarouselImageKtvSection images={ktv.display_image} t={t} ktvId={ktv.id} />
            <InfoKtvSection t={t} detail={ktv} />
            <View className="mt-4 bg-white px-4 py-4">
              <Text className="font-inter-bold text-lg text-slate-900">
                {t('booking.select_technician_title')}
              </Text>
              <View className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-slate-500">{t('booking.original_price')}</Text>
                  <Text className="font-inter-semibold text-sm text-slate-800">
                    {formatBalance(applicationPreview.price)} {t('common.currency')}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-slate-500">{t('booking.price_discount')}</Text>
                  <Text className="font-inter-semibold text-sm text-slate-800">
                    {formatBalance(applicationPreview.price_discount)} {t('common.currency')}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-sm text-slate-500">{t('booking.price_transportation')}</Text>
                  <Text className="font-inter-semibold text-sm text-slate-800">
                    {formatBalance(applicationPreview.price_transportation)} {t('common.currency')}
                  </Text>
                </View>
                <View className="mt-3 border-t border-slate-200 pt-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-inter-bold text-base text-slate-900">{t('common.total')}</Text>
                    <Text className="font-inter-bold text-lg text-primary-color-2">
                      {formatBalance(applicationPreview.total_price)} {t('common.currency')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={<Empty className="bg-white" />}
        ListFooterComponent={
          <View>
            {ktv.schedule && <SchedulesKtvSection schedule={ktv.schedule} t={t} />}
            <RecentReviewKtvSection
              t={t}
              review_count={ktv.review_count}
              recent_reviews={ktv.recent_reviews}
              ktv_id={ktv.id}
            />
            <View style={{ paddingBottom: insets.bottom + 96 }} />
          </View>
        }
      />

      <View className="border-t border-slate-100 bg-white p-4">
        <TouchableOpacity
          disabled={selectMutation.isPending}
          onPress={handleAccept}
          className="items-center justify-center rounded-2xl bg-primary-color-2 py-3"
        >
          <Text className="font-inter-bold text-base text-white">
            {selectMutation.isPending ? t('common.loading') : t('common.accept')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
