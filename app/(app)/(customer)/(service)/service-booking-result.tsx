import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeModules,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  Bike,
  Calendar,
  CheckCircle,
  DollarSign,
  Home,
  MapPin,
  Star,
  TicketPercent,
  User,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import DefaultColor from '@/components/styles/color';
import Avatar from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import bookingApi from '@/features/booking/api';
import { useCheckBooking } from '@/features/booking/hooks';
import { useCancelBookingMutation } from '@/features/booking/hooks/use-mutation';
import { useBookingStore } from '@/features/booking/stores';
import { BookingApplicationItem, BookingCheckItem } from '@/features/booking/types';
import useToast from '@/features/app/hooks/use-toast';
import useResetNav from '@/features/app/hooks/use-reset-nav';
import { useConfigApplicationQuery } from '@/features/config/hooks/use-query';
import { useUserServiceStore } from '@/features/user/stores';
import { queryClient } from '@/lib/provider/query-provider';
import { cn, formatBalance, formatDistance, getMessageError } from '@/lib/utils';

const { height: windowHeight } = Dimensions.get('window');

type MapLibreModule = typeof import('@maplibre/maplibre-react-native');

let mapLibreModule: MapLibreModule | null | undefined;

const getMapLibreModule = (): MapLibreModule | null => {
  if (mapLibreModule !== undefined) return mapLibreModule;

  if (!NativeModules.MLRNModule) {
    mapLibreModule = null;
    return mapLibreModule;
  }

  try {
    mapLibreModule = require('@maplibre/maplibre-react-native') as MapLibreModule;
  } catch {
    mapLibreModule = null;
  }

  return mapLibreModule;
};

const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const coordinateFrom = (
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined
): [number, number] | null => {
  const lat = toNumber(latitude);
  const lng = toNumber(longitude);

  if (lat === null || lng === null) return null;

  return [lng, lat];
};

const formatCountdown = (deadline?: string | null) => {
  if (!deadline) return '--:--';

  const diff = dayjs(deadline).diff(dayjs(), 'second');
  if (diff <= 0) return '00:00';

  const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const ServiceBookingResultScreen = () => {
  const { t } = useTranslation();
  const { error, success } = useToast();
  const resetNav = useResetNav();
  const setApplicationSelection = useBookingStore((state) => state.setApplicationSelection);
  const setApplicationSelectionSource = useBookingStore((state) => state.setApplicationSelectionSource);
  const setKtv = useUserServiceStore((state) => state.setKtv);

  const { status, data, bookingId, applications, applicationsQuery, refetch } = useCheckBooking();
  const configQuery = useConfigApplicationQuery(true);
  const cancelMutation = useCancelBookingMutation();
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const bookingData = data?.data;
  const mapStyleURL = configQuery.data?.map?.style_url || undefined;
  const isWaitingAssignment = status === 'waiting' || status === 'waiting_ktv_confirm' || status === 'open_for_application';

  const closeModal = useCallback(() => {
    resetNav('/(app)/(customer)/(tab)');
  }, [resetNav]);

  const handleSelectApplication = useCallback((application: BookingApplicationItem) => {
    if (!bookingId) return;

    setPreviewLoadingId(application.id);
    bookingApi.previewApplicationSelection(bookingId, application.id)
      .then((response) => {
        setApplicationSelection({
          application,
          preview: response.data,
        });
        setApplicationSelectionSource('result');
        setKtv(null);
        router.push('/(app)/(customer)/(service)/application-technician-detail');
      })
      .catch((err) => {
        error({ message: getMessageError(err, t) || t('common_error.request_error') });
      })
      .finally(() => setPreviewLoadingId(null));
  }, [bookingId, error, setApplicationSelection, setApplicationSelectionSource, setKtv, t]);

  const handleCancel = useCallback(() => {
    if (!bookingId) return;

    Alert.alert(
      t('booking.booking_cancel_confirm_title'),
      t('booking.booking_cancel_confirm_message'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: () => {
            cancelMutation.mutate(
              {
                booking_id: bookingId,
                reason: t('booking.customer_cancel_from_result_reason'),
              },
              {
                onSuccess: async () => {
                  success({ message: t('booking.waiting_cancel') });
                  await queryClient.invalidateQueries({ queryKey: ['bookingApi-checkBooking', bookingId] });
                  await queryClient.invalidateQueries({ queryKey: ['bookingApi-listBookings'] });
                  await refetch();
                },
                onError: (err) => {
                  error({ message: getMessageError(err, t) || t('common_error.request_error') });
                },
              }
            );
          },
        },
      ]
    );
  }, [bookingId, cancelMutation, error, refetch, success, t]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {isWaitingAssignment && bookingData ? (
        <AssignmentMapResult
          t={t}
          bookingData={bookingData}
          applications={applications}
          applicationsLoading={applicationsQuery.isLoading || applicationsQuery.isFetching}
          mapStyleURL={mapStyleURL}
          onCancel={handleCancel}
          cancelLoading={cancelMutation.isPending}
          onSelectApplication={handleSelectApplication}
          previewLoadingId={previewLoadingId}
        />
      ) : (
        <View className="flex-1">
          {status !== 'waiting' && (
            <View className="flex-row justify-end px-4 pt-2">
              <TouchableOpacity onPress={closeModal} className="rounded-full bg-gray-100 p-2">
                <Icon as={X} size={24} className="text-gray-700" />
              </TouchableOpacity>
            </View>
          )}
          {status === 'waiting' && <Processing t={t} />}
          {status === 'confirmed' && data?.data && <Success t={t} bookingData={data.data} onGoHome={closeModal} />}
          {status === 'failed' && data?.data && <Failed t={t} bookingData={data.data} onGoHome={closeModal} />}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ServiceBookingResultScreen;

type AssignmentMapResultProps = {
  t: TFunction;
  bookingData: BookingCheckItem;
  applications: BookingApplicationItem[];
  applicationsLoading: boolean;
  mapStyleURL?: string;
  onCancel: () => void;
  cancelLoading: boolean;
  onSelectApplication: (application: BookingApplicationItem) => void;
  previewLoadingId: string | null;
};

const AssignmentMapResult = ({
  t,
  bookingData,
  applications,
  applicationsLoading,
  mapStyleURL,
  onCancel,
  cancelLoading,
  onSelectApplication,
  previewLoadingId,
}: AssignmentMapResultProps) => {
  const deadline = bookingData.assignment_deadline_at || bookingData.ktv_confirm_deadline_at;
  const [countdown, setCountdown] = useState(formatCountdown(deadline));
  const originalName = bookingData.original_ktv_user?.name || bookingData.technician || t('booking.unassigned_technician');

  useEffect(() => {
    setCountdown(formatCountdown(deadline));
    const timer = setInterval(() => setCountdown(formatCountdown(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <View className="flex-1 bg-white">
      <View style={{ height: Math.max(310, windowHeight * 0.44) }}>
        <BookingAssignmentMap
          t={t}
          bookingData={bookingData}
          applications={applications}
          styleURL={mapStyleURL}
        />
        <TouchableOpacity
          onPress={onCancel}
          disabled={cancelLoading}
          className="absolute right-6 top-5 rounded-3xl bg-red-500 px-7 py-4 shadow-lg"
        >
          <Text className="font-inter-bold text-lg text-white">
            {cancelLoading ? t('common.loading') : t('booking.cancel_order_short')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="-mt-5 flex-1 rounded-t-[30px] bg-white px-6 pt-4 shadow-2xl">
        <View className="mb-4 items-center">
          <View className="h-1.5 w-12 rounded-full bg-slate-300" />
        </View>
        <Text className="font-inter-bold text-[22px] leading-8 text-slate-950">
          {t('booking.assignment_waiting_title', { name: originalName })}
        </Text>
        <Text className="mt-2 text-base text-slate-500">
          {t('booking.assignment_auto_cancel_in', { time: countdown })}
        </Text>
        <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <View className="h-full w-1/5 rounded-full bg-[#5E8B55]" />
        </View>

        <View className="mt-7 flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-inter-bold text-[22px] text-slate-950">
              {t('booking.application_count_title', { count: applications.length })}
            </Text>
            <Text className="mt-2 text-base text-slate-500">
              {t('booking.application_count_subtitle', { name: originalName })}
            </Text>
          </View>
          {applicationsLoading ? <ActivityIndicator color="#5E8B55" /> : null}
        </View>

        <ScrollView
          className="mt-4 flex-1"
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {applications.length === 0 && !applicationsLoading ? (
            <View className="items-center justify-center rounded-3xl bg-slate-50 px-6 py-10">
              <Text className="text-center text-base text-slate-500">
                {t('booking.no_application_waiting')}
              </Text>
            </View>
          ) : applications.map((application) => (
            <ApplicationCandidateCard
              key={application.id}
              application={application}
              loading={previewLoadingId === application.id}
              disabled={!!previewLoadingId}
              onSelect={() => onSelectApplication(application)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const BookingAssignmentMap = ({
  t,
  bookingData,
  applications,
  styleURL,
}: {
  t: TFunction;
  bookingData: BookingCheckItem;
  applications: BookingApplicationItem[];
  styleURL?: string;
}) => {
  const customerCoordinate = coordinateFrom(bookingData.latitude, bookingData.longitude);
  const originalCoordinate = coordinateFrom(
    bookingData.original_ktv_user?.latitude || bookingData.ktv_latitude,
    bookingData.original_ktv_user?.longitude || bookingData.ktv_longitude
  );

  const applicantMarkers = useMemo(() => applications
    .map((application) => ({
      id: application.id,
      coordinate: coordinateFrom(application.ktv.location?.latitude, application.ktv.location?.longitude),
    }))
    .filter((item): item is { id: string; coordinate: [number, number] } => !!item.coordinate), [applications]);

  const centerCoordinate = customerCoordinate || originalCoordinate || applicantMarkers[0]?.coordinate;
  const MapLibreGL = getMapLibreModule();
  console.log('MapLibreGL', MapLibreGL);
  if (!styleURL || !centerCoordinate || !MapLibreGL) {
    return (
      <View className="flex-1 items-center justify-center bg-[#DCEEFF] px-8">
        <MapPin size={36} color="#2563EB" />
        <Text className="mt-3 text-center font-inter-semibold text-base text-[#1E3A8A]">
          {t('common_error.program_error')}
        </Text>
      </View>
    );
  }

  return (
    <MapLibreGL.MapView style={{ flex: 1 }} mapStyle={styleURL} logoEnabled={false} attributionEnabled={false}>
      <MapLibreGL.Camera centerCoordinate={centerCoordinate} zoomLevel={12} />
      {customerCoordinate ? (
        <MapLibreGL.PointAnnotation id="customer-location" coordinate={customerCoordinate}>
          <MapMarker tone="customer" label="H" />
        </MapLibreGL.PointAnnotation>
      ) : null}
      {originalCoordinate ? (
        <MapLibreGL.PointAnnotation id="original-ktv-location" coordinate={originalCoordinate}>
          <MapMarker tone="original" />
        </MapLibreGL.PointAnnotation>
      ) : null}
      {applicantMarkers.map((marker) => (
        <MapLibreGL.PointAnnotation key={marker.id} id={`applicant-${marker.id}`} coordinate={marker.coordinate}>
          <MapMarker tone="applicant" />
        </MapLibreGL.PointAnnotation>
      ))}
    </MapLibreGL.MapView>
  );
};

const MapMarker = ({ tone, label }: { tone: 'customer' | 'original' | 'applicant'; label?: string }) => {
  const isCustomer = tone === 'customer';
  const markerClass = cn(
    'items-center justify-center rounded-full border-2 shadow-lg',
    isCustomer ? 'h-9 w-9 border-white bg-red-500' : 'h-10 w-10 border-white bg-[#6E8952]'
  );

  return (
    <View className={markerClass}>
      {label ? (
        <Text className="font-inter-bold text-white">{label}</Text>
      ) : (
        <User size={22} color="white" />
      )}
    </View>
  );
};

const ApplicationCandidateCard = ({
  application,
  loading,
  disabled,
  onSelect,
}: {
  application: BookingApplicationItem;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => {
  const { t } = useTranslation();
  const distance = application.ktv.distance !== null && application.ktv.distance !== undefined
    ? formatDistance(Number(application.ktv.distance) / 1000)
    : null;

  return (
    <View className="mb-5 flex-row rounded-3xl bg-white p-1 shadow-sm">
      <Avatar source={application.ktv.avatar_url} size={112} borderWidth={0} style={{ borderRadius: 16 }} fallbackIconSize={34} />
      <View className="ml-4 flex-1 py-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="font-inter-bold text-xl text-slate-950" numberOfLines={1}>
              {application.ktv.name || '-'}
            </Text>
            <View className="mt-3 flex-row items-center">
              <Star size={18} color="#F2A900" fill="#F2A900" />
              <Text className="ml-1 font-inter-bold text-base text-[#D99A00]">
                {(application.ktv.rating || 0).toFixed(1)}
              </Text>
              <Text className="ml-1 text-base text-slate-500">
                ({application.ktv.review_count || 0} {t('common.review')})
              </Text>
            </View>
          </View>
          <Text className="font-inter-bold text-sm text-red-400">
            {t('booking.technician_ready')}
          </Text>
        </View>

        <View className="mt-5 flex-row items-end justify-between">
          <View className="flex-row items-center">
            <MapPin size={18} color="#8A8F98" />
            <Text className="ml-1 text-base text-slate-500">{distance || '--'}</Text>
          </View>
          <TouchableOpacity
            onPress={onSelect}
            disabled={disabled}
            className="min-w-[78px] items-center justify-center rounded-full bg-[#5F934F] px-5 py-2"
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="font-inter-bold text-base text-white">{t('common.select')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Processing = ({ t }: { t: TFunction }) => (
  <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
    <View className="flex-1 items-center justify-center px-6">
      <View className="mb-4 rounded-full bg-blue-50 p-4">
        <ActivityIndicator size={80} color={DefaultColor.base['primary-color-1']} />
      </View>
      <Text className="text-center font-inter-bold text-2xl text-gray-800">
        {t('services.booking_processing_title')}
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        {t('services.booking_processing_description')}
      </Text>
    </View>
  </ScrollView>
);

const Success = ({ t, bookingData, onGoHome }: { t: TFunction; bookingData: BookingCheckItem; onGoHome: () => void }) => (
  <>
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View className="mb-6 mt-4 items-center px-6">
        <View className="mb-4 rounded-full bg-blue-50 p-4">
          <Icon as={CheckCircle} size={80} color={DefaultColor.blue['500']} fill={DefaultColor.blue[200]} />
        </View>
        <Text className="text-center font-inter-bold text-2xl text-gray-800">
          {t('services.booking_success_title')}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {t('services.booking_success_description')}
        </Text>
      </View>
      <InfoCard t={t} bookingData={bookingData} />
    </ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <TouchableOpacity
        onPress={onGoHome}
        className="flex-row items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3"
      >
        <Icon as={Home} size={18} className="text-gray-700" />
        <Text className="font-inter-bold text-base text-gray-700">{t('common.go_to_home')}</Text>
      </TouchableOpacity>
    </View>
  </>
);

const Failed = ({ t, bookingData, onGoHome }: { t: TFunction; bookingData: BookingCheckItem; onGoHome: () => void }) => (
  <>
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View className="mb-6 mt-4 items-center px-6">
        <View className="mb-4 rounded-full bg-red-50 p-4">
          <Icon as={XCircle} size={80} color={DefaultColor.red[500]} fill={DefaultColor.red[100]} />
        </View>
        <Text className="text-center font-inter-bold text-2xl text-gray-800">
          {t('services.booking_failed_title')}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {t('services.booking_failed_message')}
        </Text>
      </View>
      <InfoCard t={t} bookingData={bookingData} />
    </ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <TouchableOpacity
        onPress={onGoHome}
        className="flex-row items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3"
      >
        <Icon as={Home} size={18} className="text-gray-700" />
        <Text className="font-inter-bold text-base text-gray-700">{t('common.go_to_home')}</Text>
      </TouchableOpacity>
    </View>
  </>
);

const InfoCard = ({ t, bookingData }: { t: TFunction; bookingData: BookingCheckItem }) => (
  <View className="w-full px-4 pb-24">
    <View className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <View className="mb-3 flex-row items-center justify-between border-b border-dashed border-gray-200 pb-3">
        <Text className="text-xs text-gray-500">{t('services.booking_id')}</Text>
        <Text className="font-inter-bold text-sm text-gray-800">{bookingData.booking_id}</Text>
      </View>
      {!!bookingData.reason_cancel && (
        <Card containerClassName="mb-4 border border-red-100 bg-red-50" className="flex-row items-center">
          <View className="mr-3 rounded-full bg-red-100 p-1.5">
            <AlertCircle size={18} color={DefaultColor.red[500]} strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className="font-inter-italic text-[13px] leading-5 text-red-600">
              {bookingData.reason_cancel}
            </Text>
          </View>
        </Card>
      )}
      <Text className="mb-4 font-inter-bold text-lg text-primary-color-1">
        {bookingData.service_name}
      </Text>
      <View className="gap-3">
        <InfoRow icon={User} label={t('services.booking_technician')} value={bookingData.technician || t('booking.unassigned_technician')} />
        <InfoRow icon={Calendar} label={t('services.booking_date')} value={bookingData.date} />
        <InfoRow icon={MapPin} label={t('services.booking_location')} value={bookingData.location} />
        <InfoRow icon={DollarSign} label={t('services.service_price')} value={`${formatBalance(bookingData.price || 0)} ${t('common.currency')}`} />
        <InfoRow icon={Bike} label={t('services.distance_price')} value={`${formatBalance(bookingData.price_transportation || 0)} ${t('common.currency')}`} />
        <InfoRow icon={TicketPercent} label={t('services.discount')} value={`${formatBalance(bookingData.price_discount || 0)} ${t('common.currency')}`} />
      </View>
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-200 pt-4">
        <Text className="font-inter-medium text-gray-600">{t('services.booking_total_price')}</Text>
        <Text className="font-inter-bold text-xl text-primary-color-1">
          {formatBalance(bookingData.total_price || 0)} {t('common.currency')}
        </Text>
      </View>
    </View>
  </View>
);

const InfoRow = ({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <View className="flex-row items-start">
    <View className="mt-0.5">
      <Icon as={icon} size={16} className="text-primary-color-1" />
    </View>
    <View className="ml-3 flex-1 flex-row justify-between">
      <Text className="mr-2 flex-1 text-sm text-gray-500">{label}</Text>
      <Text className="flex-1 text-right font-inter-medium text-sm text-gray-800">{value}</Text>
    </View>
  </View>
);
