import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  InteractionManager,
  NativeModules,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  Bike,
  Calendar,
  CheckCircle,
  DollarSign,
  Home,
  LocateFixed,
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
import { useIsFocused } from '@react-navigation/native';

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
import { useConfigApplicationQuery } from '@/features/config/hooks/use-query';
import { queryClient } from '@/lib/provider/query-provider';
import { formatBalance, formatDistance, getMessageError } from '@/lib/utils';

const { height: windowHeight } = Dimensions.get('window');

type MapLibreModule = typeof import('@maplibre/maplibre-react-native');
type CameraRef = import('@maplibre/maplibre-react-native').CameraRef;
type MapViewRef = import('@maplibre/maplibre-react-native').MapViewRef;
type CircleLayerStyle = import('@maplibre/maplibre-react-native').CircleLayerStyle;
type SymbolLayerStyle = import('@maplibre/maplibre-react-native').SymbolLayerStyle;
type MapPointProperties = { label: string };
type MapPointFeature = GeoJSON.Feature<GeoJSON.Point, MapPointProperties>;
type MapPointFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point, MapPointProperties>;

type BookingAssignmentMapProps = {
  t: TFunction;
  bookingData: BookingCheckItem;
  applications: BookingApplicationItem[];
  styleURL?: string;
};

const customerHaloLayerStyle: CircleLayerStyle = {
  circleRadius: 42,
  circleColor: '#DBEAFE',
  circleOpacity: 0.36,
  circleStrokeColor: '#93C5FD',
  circleStrokeWidth: 1,
  circlePitchScale: 'viewport',
};

const customerRingLayerStyle: CircleLayerStyle = {
  circleRadius: 22,
  circleColor: '#2563EB',
  circleOpacity: 0.24,
  circleStrokeColor: '#FFFFFF',
  circleStrokeWidth: 2,
  circlePitchScale: 'viewport',
};

const customerDotLayerStyle: CircleLayerStyle = {
  circleRadius: 10,
  circleColor: '#2563EB',
  circleStrokeColor: '#FFFFFF',
  circleStrokeWidth: 3,
  circlePitchScale: 'viewport',
};

const originalMarkerLayerStyle: CircleLayerStyle = {
  circleRadius: 18,
  circleColor: '#F59E0B',
  circleStrokeColor: '#FFFFFF',
  circleStrokeWidth: 3,
  circlePitchScale: 'viewport',
};

const applicantMarkerLayerStyle: CircleLayerStyle = {
  circleRadius: 18,
  circleColor: '#2563EB',
  circleStrokeColor: '#FFFFFF',
  circleStrokeWidth: 3,
  circlePitchScale: 'viewport',
};

const mapLabelLayerStyle: SymbolLayerStyle = {
  textField: ['get', 'label'] as const,
  textSize: 11,
  textColor: '#FFFFFF',
  textAllowOverlap: true,
  textIgnorePlacement: true,
  textPitchAlignment: 'viewport',
  textRotationAlignment: 'viewport',
  textHaloColor: 'rgba(15, 23, 42, 0.12)',
  textHaloWidth: 0.5,
};

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

const mapPointFeature = (
  id: string,
  coordinate: [number, number],
  label: string
): MapPointFeature => ({
  type: 'Feature',
  id,
  properties: { label },
  geometry: {
    type: 'Point',
    coordinates: coordinate,
  },
});

const mapPointCollection = (features: MapPointFeature[]): MapPointFeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

const formatCountdown = (deadline?: string | null) => {
  if (!deadline) return '--:--';

  const diff = dayjs(deadline).diff(dayjs(), 'second');
  if (diff <= 0) return '00:00';

  const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const buildApplicationsMapSignature = (applications: BookingApplicationItem[]) =>
  applications
    .map((application) => [
      application.id,
      application.ktv.name || '',
      application.ktv.avatar_url || '',
      application.ktv.location?.latitude || '',
      application.ktv.location?.longitude || '',
    ].join(':'))
    .join('|');

const buildBookingAssignmentMapSignature = (
  bookingData: BookingCheckItem,
  applications: BookingApplicationItem[],
  styleURL?: string
) => [
  styleURL || '',
  bookingData.latitude || '',
  bookingData.longitude || '',
  bookingData.original_ktv_user?.latitude || bookingData.ktv_latitude || '',
  bookingData.original_ktv_user?.longitude || bookingData.ktv_longitude || '',
  buildApplicationsMapSignature(applications),
].join('|');

const getCoordinateBounds = (coordinates: [number, number][]) => {
  const [firstLng, firstLat] = coordinates[0];
  let minLng = firstLng;
  let maxLng = firstLng;
  let minLat = firstLat;
  let maxLat = firstLat;

  coordinates.slice(1).forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    ne: [maxLng, maxLat] as [number, number],
    sw: [minLng, minLat] as [number, number],
  };
};

const ServiceBookingResultScreen = () => {
  const { t } = useTranslation();
  const { error, success } = useToast();
  const setBookingId = useBookingStore((state) => state.setBookingId);
  const setApplicationSelection = useBookingStore((state) => state.setApplicationSelection);
  const setApplicationSelectionSource = useBookingStore((state) => state.setApplicationSelectionSource);
  const clearApplicationSelection = useBookingStore((state) => state.clearApplicationSelection);

  const { status, data, bookingId, applications, applicationsQuery, refetch } = useCheckBooking();
  const configQuery = useConfigApplicationQuery(true);
  const cancelMutation = useCancelBookingMutation();
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [isClosingScreen, setIsClosingScreen] = useState(false);
  const closeFrameRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeInteractionRef = useRef<{ cancel: () => void } | null>(null);
  const isFocused = useIsFocused();
  const refetchApplications = applicationsQuery.refetch;

  const bookingData = data?.data;
  const mapStyleURL = configQuery.data?.map?.style_url || undefined;
  const isWaitingAssignment = status === 'waiting' || status === 'waiting_ktv_confirm' || status === 'open_for_application';

  const closeModal = useCallback(() => {
    if (isClosingScreen) {
      return;
    }

    setIsClosingScreen(true);

    closeFrameRef.current = requestAnimationFrame(() => {
      closeInteractionRef.current = InteractionManager.runAfterInteractions(() => {
        closeTimeoutRef.current = setTimeout(() => {
          router.dismissTo('/(app)/(customer)/(tab)/orders');
        }, Platform.OS === 'ios' && isWaitingAssignment ? 220 : 0);
      });
    });
  }, [isClosingScreen, isWaitingAssignment, status]);

  useEffect(() => {
    if (!isFocused || !bookingId) return;
    refetch();
    refetchApplications();
  }, [bookingId, isFocused, refetch, refetchApplications]);

  useEffect(() => {
    return () => {
      if (closeFrameRef.current !== null) {
        cancelAnimationFrame(closeFrameRef.current);
      }
      if (closeTimeoutRef.current !== null) {
        clearTimeout(closeTimeoutRef.current);
      }
      closeInteractionRef.current?.cancel();
      clearApplicationSelection();
      setBookingId(null);
    };
  }, [clearApplicationSelection, setBookingId]);

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
        router.push({ pathname: '/(app)/(customer)/(service)/application-technician-detail' });
      })
      .catch((err) => {
        error({ message: getMessageError(err, t) || t('common_error.request_error') });
      })
      .finally(() => setPreviewLoadingId(null));
  }, [bookingId, error, setApplicationSelection, setApplicationSelectionSource, t]);

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
                onSuccess: (res) => {
                  success({ message: res.message || t('enum.booking_status.CANCELED') });
                  closeModal();
                  void queryClient.invalidateQueries({ queryKey: ['bookingApi-checkBooking', bookingId] });
                  void queryClient.invalidateQueries({ queryKey: ['bookingApi-listBookings'] });
                  void queryClient.invalidateQueries({ queryKey: ['bookingApi-applications', bookingId] });
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
  }, [bookingId, cancelMutation, closeModal, error, success, t]);

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
          onClose={closeModal}
          isClosingScreen={isClosingScreen}
          onSelectApplication={handleSelectApplication}
          previewLoadingId={previewLoadingId}
        />
      ) : (
        <View className="flex-1">
          {status !== 'waiting' && (
            <View className="flex-row justify-end px-4 pt-2">
              <TouchableOpacity onPress={closeModal} disabled={isClosingScreen} className="rounded-full bg-gray-100 p-2">
                <Icon as={X} size={24} className="text-gray-700" />
              </TouchableOpacity>
            </View>
          )}
          {status === 'waiting' && <Processing t={t} />}
          {status === 'confirmed' && data?.data && <Success t={t} bookingData={data.data} onGoHome={closeModal} />}
          {(status === 'failed' || status === 'canceled') && data?.data && (
            <Failed t={t} bookingData={data.data} onGoHome={closeModal} />
          )}
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
  onClose: () => void;
  isClosingScreen: boolean;
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
  onClose,
  isClosingScreen,
  onSelectApplication,
  previewLoadingId,
}: AssignmentMapResultProps) => {
  const deadline = bookingData.assignment_deadline_at || bookingData.ktv_confirm_deadline_at;
  const originalName = bookingData.original_ktv_user?.name || bookingData.technician || t('booking.unassigned_technician');
  const shouldUseFullScreenMap = applications.length === 0;

  return (
    <View className="flex-1 bg-white">
      <View style={{ height: shouldUseFullScreenMap ? windowHeight : Math.max(300, windowHeight * 0.42) }}>
        {isClosingScreen ? (
          <ClosingMapPlaceholder t={t} />
        ) : (
          <BookingAssignmentMap
            t={t}
            bookingData={bookingData}
            applications={applications}
            styleURL={mapStyleURL}
          />
        )}
        <TouchableOpacity
          onPress={onClose}
          disabled={isClosingScreen}
          className="absolute left-5 top-5 h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg"
        >
          <Icon as={X} size={22} className="text-slate-700" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          disabled={cancelLoading || isClosingScreen}
          className="absolute right-5 top-5 rounded-3xl bg-red-500 px-5 py-3 shadow-lg"
        >
          <Text className="font-inter-bold text-[15px] text-white">
            {cancelLoading || isClosingScreen ? t('common.loading') : t('booking.cancel_order_short')}
          </Text>
        </TouchableOpacity>
      </View>

      {!shouldUseFullScreenMap ? (
      <View className="-mt-5 flex-1 rounded-t-[30px] bg-white px-5 pt-3 shadow-2xl">
        <View className="mb-4 items-center">
          <View className="h-1.5 w-12 rounded-full bg-slate-300" />
        </View>
        <Text className="font-inter-bold text-[18px] leading-7 text-slate-950">
          {t('booking.assignment_waiting_title', { name: originalName })}
        </Text>
        <AssignmentCountdownText t={t} deadline={deadline} />
        <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <View className="h-full w-1/5 rounded-full bg-[#2563EB]" />
        </View>

        <View className="mt-5 flex-row items-end justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-inter-bold text-[18px] text-slate-950">
              {t('booking.application_count_title', { count: applications.length })}
            </Text>
            <Text className="mt-2 text-[14px] text-slate-500">
              {t('booking.application_count_subtitle', { name: originalName })}
            </Text>
          </View>
          {applicationsLoading ? <ActivityIndicator color="#2563EB" /> : null}
        </View>

        <ScrollView
          className="mt-3 flex-1"
          contentContainerStyle={{ paddingBottom: 22 }}
          showsVerticalScrollIndicator={false}
        >
          {applications.length === 0 && !applicationsLoading ? (
            <View className="items-center justify-center rounded-3xl bg-slate-50 px-6 py-10">
              <Text className="text-center text-[14px] text-slate-500">
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
      ) : null}
    </View>
  );
};

const AssignmentCountdownText = ({ t, deadline }: { t: TFunction; deadline?: string | null }) => {
  const [countdown, setCountdown] = useState(() => formatCountdown(deadline));

  useEffect(() => {
    setCountdown(formatCountdown(deadline));
    const timer = setInterval(() => setCountdown(formatCountdown(deadline)), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <Text className="mt-2 text-[14px] text-slate-500">
      {t('booking.assignment_auto_cancel_in', { time: countdown })}
    </Text>
  );
};

const BookingAssignmentMap = memo(({
  t,
  bookingData,
  applications,
  styleURL,
}: BookingAssignmentMapProps) => {
  const cameraRef = useRef<CameraRef | null>(null);
  const mapRef = useRef<MapViewRef | null>(null);
  const [customerScreenPoint, setCustomerScreenPoint] = useState<[number, number] | null>(null);
  const customerCoordinate = useMemo(
    () => coordinateFrom(bookingData.latitude, bookingData.longitude),
    [bookingData.latitude, bookingData.longitude]
  );
  const originalCoordinate = useMemo(
    () =>
      coordinateFrom(
        bookingData.original_ktv_user?.latitude || bookingData.ktv_latitude,
        bookingData.original_ktv_user?.longitude || bookingData.ktv_longitude
      ),
    [
      bookingData.original_ktv_user?.latitude,
      bookingData.original_ktv_user?.longitude,
      bookingData.ktv_latitude,
      bookingData.ktv_longitude,
    ]
  );

  const applicantMarkersDeps = JSON.stringify(
    applications.map((app) => ({
      id: app.id,
      name: app.ktv.name,
      avatarUrl: app.ktv.avatar_url,
      latitude: app.ktv.location?.latitude,
      longitude: app.ktv.location?.longitude,
    }))
  );

  const applicantMarkers = useMemo(
    () =>
      applications
        .map((application) => ({
          id: application.id,
          name: application.ktv.name,
          avatarUrl: application.ktv.avatar_url,
          coordinate: coordinateFrom(application.ktv.location?.latitude, application.ktv.location?.longitude),
        }))
        .filter(
          (item): item is {
            id: string;
            name: string | null;
            avatarUrl: string | null;
            coordinate: [number, number];
          } => !!item.coordinate
        ),
    [applicantMarkersDeps]
  );

  const mapCoordinates = useMemo(
    () =>
      [customerCoordinate, originalCoordinate, ...applicantMarkers.map((marker) => marker.coordinate)].filter(
        (coordinate): coordinate is [number, number] => !!coordinate
      ),
    [applicantMarkers, customerCoordinate, originalCoordinate]
  );
  const customerShape = useMemo(
    () => mapPointCollection(customerCoordinate ? [mapPointFeature('customer', customerCoordinate, '')] : []),
    [customerCoordinate]
  );
  const originalShape = useMemo(
    () => mapPointCollection(originalCoordinate ? [mapPointFeature('original', originalCoordinate, 'G')] : []),
    [originalCoordinate]
  );
  const applicantShape = useMemo(
    () => mapPointCollection(
      applicantMarkers.map((marker, index) => mapPointFeature(marker.id, marker.coordinate, `${index + 1}`))
    ),
    [applicantMarkers]
  );
  const centerCoordinate = mapCoordinates[0];
  const MapLibreGL = getMapLibreModule();
  const defaultCameraSettings = useMemo(
    () => (centerCoordinate ? { centerCoordinate, zoomLevel: 12 } : undefined),
    [centerCoordinate]
  );
  const syncCustomerOverlayPosition = useCallback(() => {
    if (!mapRef.current || !customerCoordinate) {
      setCustomerScreenPoint(null);
      return;
    }

    mapRef.current
      .getPointInView(customerCoordinate)
      .then((point) => {
        setCustomerScreenPoint(point);
      })
      .catch(() => {
        setCustomerScreenPoint(null);
      });
  }, [customerCoordinate]);

  useEffect(() => {
    if (!cameraRef.current || !MapLibreGL || !styleURL || mapCoordinates.length === 0) return;

    const cameraPadding = applications.length > 0 ? [72, 40, 136, 40] : [72, 40, 104, 40];
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;
    const frameId = requestAnimationFrame(() => {
      if (!cameraRef.current) return;

      if (mapCoordinates.length === 1) {
        cameraRef.current.setCamera({
          centerCoordinate: mapCoordinates[0],
          zoomLevel: 12,
          animationDuration: 0,
        });
        syncTimeout = setTimeout(syncCustomerOverlayPosition, 80);
        return;
      }

      const bounds = getCoordinateBounds(mapCoordinates);
      cameraRef.current.fitBounds(bounds.ne, bounds.sw, cameraPadding, 650);
      syncTimeout = setTimeout(syncCustomerOverlayPosition, 700);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [MapLibreGL, applications.length, mapCoordinates, styleURL, syncCustomerOverlayPosition]);

  if (!styleURL || !centerCoordinate || !MapLibreGL) {
    return (
      <View className="flex-1 justify-between bg-[#DCEEFF] px-5 py-6">
        <View className="rounded-3xl bg-white/80 p-4">
          <Text className="font-inter-bold text-lg text-[#1E3A8A]">
            {t('booking.application_count_title', { count: applications.length })}
          </Text>
          <Text className="mt-1 text-sm text-[#315C9C]">
            {t('common_error.program_error')}
          </Text>
        </View>
        <View className="items-center justify-center">
          <View className="rounded-full bg-white/90 p-5 shadow-sm">
            <MapPin size={42} color="#2563EB" />
          </View>
        </View>
        <MapLegend t={t} applicantCount={applications.length} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapLibreGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapStyle={styleURL}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={syncCustomerOverlayPosition}
        onRegionDidChange={syncCustomerOverlayPosition}
      >
        <MapLibreGL.Camera ref={cameraRef} defaultSettings={defaultCameraSettings} />
        <MapLibreGL.ShapeSource id="booking-customer-source" shape={customerShape}>
          <MapLibreGL.CircleLayer id="booking-customer-halo-layer" style={customerHaloLayerStyle} />
          <MapLibreGL.CircleLayer id="booking-customer-ring-layer" style={customerRingLayerStyle} />
          <MapLibreGL.CircleLayer id="booking-customer-dot-layer" style={customerDotLayerStyle} />
        </MapLibreGL.ShapeSource>
        <MapLibreGL.ShapeSource id="booking-original-source" shape={originalShape}>
          <MapLibreGL.CircleLayer id="booking-original-marker-layer" style={originalMarkerLayerStyle} />
          <MapLibreGL.SymbolLayer id="booking-original-label-layer" style={mapLabelLayerStyle} />
        </MapLibreGL.ShapeSource>
        <MapLibreGL.ShapeSource id="booking-applicant-source" shape={applicantShape}>
          <MapLibreGL.CircleLayer id="booking-applicant-marker-layer" style={applicantMarkerLayerStyle} />
          <MapLibreGL.SymbolLayer id="booking-applicant-label-layer" style={mapLabelLayerStyle} />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>
      {customerScreenPoint ? (
        <View
          pointerEvents="none"
          className="absolute"
          style={{
            left: customerScreenPoint[0] - 80,
            top: customerScreenPoint[1] - 80,
          }}
        >
          <CustomerRadarOverlay />
        </View>
      ) : null}
        <View className="absolute bottom-6 left-5 right-5">
        <View className="mb-3 self-start rounded-2xl bg-white/95 px-4 py-3 shadow-lg">
          <Text className="font-inter-bold text-[14px] text-slate-950">
            {t('booking.application_count_title', { count: applications.length })}
          </Text>
        </View>
        <MapLegend t={t} applicantCount={applications.length} />
      </View>
    </View>
  );
}, (prevProps, nextProps) => (
  prevProps.t === nextProps.t
  && buildBookingAssignmentMapSignature(prevProps.bookingData, prevProps.applications, prevProps.styleURL)
    === buildBookingAssignmentMapSignature(nextProps.bookingData, nextProps.applications, nextProps.styleURL)
));

const MapLegend = ({ t, applicantCount }: { t: TFunction; applicantCount: number }) => (
  <View className="flex-row flex-wrap gap-2 rounded-2xl bg-white/95 p-3 shadow-lg">
    <LegendItem color={DefaultColor.blue[300]} label={t('services.booking_location')} />
    <LegendItem color="#F59E0B" label={t('services.booking_technician')} />
    <LegendItem color="#2563EB" label={t('booking.application_count_title', { count: applicantCount })} />
  </View>
);

const ClosingMapPlaceholder = ({ t }: { t: TFunction }) => (
  <View className="flex-1 items-center justify-center bg-[#DCEEFF] px-5">
    <View className="items-center rounded-3xl bg-white/90 px-5 py-4 shadow-sm">
      <ActivityIndicator color="#2563EB" />
      <Text className="mt-3 text-center font-inter-semibold text-sm text-[#315C9C]">
        {t('common.loading')}
      </Text>
    </View>
  </View>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View className="flex-row items-center rounded-full bg-slate-50 px-3 py-1.5">
    <View className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    <Text className="text-xs text-slate-600" numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const RadarSweepLine = ({
  rotateOffset,
  opacity,
  color,
  width,
}: {
  rotateOffset: string;
  opacity: number;
  color: string;
  width: number;
}) => (
  <View
    style={{
      position: 'absolute',
      width: 160,
      height: 160,
      transform: [{ rotate: rotateOffset }],
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: width,
        height: 80,
        backgroundColor: color,
        opacity: opacity,
      }}
    />
  </View>
);

const CustomerRadarOverlay = memo(() => (
  <View className="h-[160px] w-[160px] items-center justify-center">
    <View
      style={{
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1,
        borderColor: 'rgba(147, 197, 253, 0.7)',
        backgroundColor: 'rgba(219, 234, 254, 0.22)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.35)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.18)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 160,
        height: 1,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 1,
        height: 160,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
      }}
    />

    <MotiView
      from={{ rotate: '0deg' }}
      animate={{ rotate: '360deg' }}
      transition={{
        type: 'timing',
        duration: 3200,
        loop: true,
        repeatReverse: false,
        easing: Easing.linear,
      }}
      style={{
        position: 'absolute',
        width: 160,
        height: 160,
      }}
    >
      <RadarSweepLine rotateOffset="0deg" color="#3b82f6" width={2.5} opacity={1} />
      <RadarSweepLine rotateOffset="-1.5deg" color="#60a5fa" width={3.5} opacity={0.82} />
      <RadarSweepLine rotateOffset="-3.5deg" color="#60a5fa" width={4.5} opacity={0.68} />
      <RadarSweepLine rotateOffset="-6deg" color="#93c5fd" width={6} opacity={0.52} />
      <RadarSweepLine rotateOffset="-9.5deg" color="#93c5fd" width={8} opacity={0.4} />
      <RadarSweepLine rotateOffset="-14deg" color="#bfdbfe" width={11} opacity={0.28} />
      <RadarSweepLine rotateOffset="-19.5deg" color="#bfdbfe" width={14} opacity={0.18} />
      <RadarSweepLine rotateOffset="-26deg" color="#dbeafe" width={18} opacity={0.1} />
    </MotiView>

    <View className="h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-blue-500 shadow-lg">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-50">
        <Icon as={LocateFixed} size={18} color={DefaultColor.blue[500]} />
      </View>
    </View>
  </View>
));

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
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled || loading}
      activeOpacity={0.85}
      className="mb-3 flex-row rounded-[22px] bg-white p-1 shadow-sm"
    >
      <Avatar source={application.ktv.avatar_url} size={112} borderWidth={0} style={{ borderRadius: 16 }} fallbackIconSize={34} />
      <View className="ml-3 flex-1 py-1.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="font-inter-bold text-[18px] text-slate-950" numberOfLines={1}>
              {application.ktv.name || '-'}
            </Text>
            <View className="mt-2 flex-row items-center">
              <Star size={16} color="#F2A900" fill="#F2A900" />
              <Text className="ml-1 font-inter-bold text-[14px] text-[#D99A00]">
                {(application.ktv.rating || 0).toFixed(1)}
              </Text>
              <Text className="ml-1 text-[13px] text-slate-500">
                ({application.ktv.review_count || 0} {t('common.review')})
              </Text>
            </View>
          </View>
          <Text className="font-inter-bold text-[12px] text-red-400">
            {t('booking.technician_ready')}
          </Text>
        </View>

        <View className="mt-3 flex-row items-end justify-between">
          <View className="flex-row items-center">
            <MapPin size={16} color="#8A8F98" />
            <Text className="ml-1 text-[13px] text-slate-500">{distance || '--'}</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#2563EB" size="small" />
          ) : (
            <Text className="text-[12px] font-inter-semibold text-[#2563EB]">
              {t('common.select')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
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
