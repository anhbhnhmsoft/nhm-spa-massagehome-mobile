import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, FileText, Check, Layers, ChevronRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import BaseBottomModal from '@/components/ui/base-bottom-modal';
import { useCreateServiceRequestMutation } from '@/features/service-request/hooks/use-mutation';
import { _UrgencyLevel } from '@/features/service-request/types';
import { cn } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApplicationStore } from '@/features/app/stores';
import { ListLocationModal } from '@/components/app/location';
import { useGetLocation } from '@/features/app/hooks/use-location';
import { SelectAddress } from '@/features/location/types';
import { useGetCategoryList } from '@/features/service/hooks/use-get-category-list';

interface CreateServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId?: number;
  serviceTitle?: string;
  onSuccess?: () => void;
}

const TECHNIQUES_OPTIONS = [
  { id: 'acupressure', labelKey: 'admin.ktv_technique.acupressure', defaultLabel: 'Ấn huyệt' },
  { id: 'massage', labelKey: 'admin.ktv_technique.massage', defaultLabel: 'Xoa bóp' },
  { id: 'therapy', labelKey: 'admin.ktv_technique.therapy', defaultLabel: 'Trị liệu' },
  { id: 'stretching', labelKey: 'admin.ktv_technique.stretching', defaultLabel: 'Giãn cơ' },
  { id: 'essential_oil', labelKey: 'admin.ktv_technique.essential_oil', defaultLabel: 'Tinh dầu' },
];

export const CreateServiceRequestModal: React.FC<CreateServiceRequestModalProps> = ({
  visible,
  onClose,
  serviceId: propServiceId,
  serviceTitle: propServiceTitle,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const locationUser = useApplicationStore((s) => s.location);

  const [selectedServiceId, setSelectedServiceId] = useState<number>(propServiceId || 0);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<_UrgencyLevel>(_UrgencyLevel.NEED_NOW);
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  const getCurrentLocation = useGetLocation();
  const createMutation = useCreateServiceRequestMutation();

  // Fetch danh mục dịch vụ từ API (đồng bộ với màn hình Dịch Vụ)
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoryList(
    { per_page: 50 },
  );

  // Tự động chọn danh mục đầu tiên khi load xong (nếu chưa có propServiceId)
  useEffect(() => {
    if (!propServiceId && categories.length > 0 && selectedServiceId === 0) {
      setSelectedServiceId(Number(categories[0].id));
    }
  }, [propServiceId, categories, selectedServiceId]);

  useEffect(() => {
    if (propServiceId) {
      setSelectedServiceId(propServiceId);
    }
  }, [propServiceId]);

  useEffect(() => {
    if (visible && locationUser?.address && !address) {
      setAddress(locationUser.address);
      if (locationUser.location?.coords) {
        setLatitude(locationUser.location.coords.latitude);
        setLongitude(locationUser.location.coords.longitude);
      }
    }
  }, [visible, locationUser]);

  const toggleTechnique = (id: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc?.address) {
        setAddress(loc.address);
        if (loc.location?.coords) {
          setLatitude(loc.location.coords.latitude);
          setLongitude(loc.location.coords.longitude);
        }
      }
    } catch {
      // Error is handled in useGetLocation
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectLocation = (selectedLoc: SelectAddress) => {
    setAddress(selectedLoc.address);
    if (selectedLoc.latitude) setLatitude(Number(selectedLoc.latitude));
    if (selectedLoc.longitude) setLongitude(Number(selectedLoc.longitude));
    setShowLocationModal(false);
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      setErrorMessage(t('service_request_form.address_placeholder', 'Vui lòng nhập hoặc chọn địa chỉ phục vụ'));
      return;
    }
    setErrorMessage(null);

    createMutation.mutate(
      {
        service_id: propServiceId || selectedServiceId,
        preferred_techniques: selectedTechniques,
        urgency_level: urgencyLevel,
        address: address.trim(),
        latitude: latitude ?? locationUser?.location?.coords?.latitude,
        longitude: longitude ?? locationUser?.location?.coords?.longitude,
        note: note.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert(
            t('common.notification', 'Thông báo'),
            t(
              'service_request_form.submit_success',
              'Yêu cầu dịch vụ đã gửi thành công! CSKH MasaHome sẽ tiếp nhận và đề xuất KTV phù hợp nhất trong ít phút.'
            )
          );
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(
            err?.response?.data?.message ||
              t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại!')
          );
        },
      }
    );
  };

  return (
    <>
      <BaseBottomModal
        visible={visible && !showLocationModal}
        onClose={onClose}
        title={t('service_request_form.title', 'Yêu cầu CSKH tìm KTV')}
        description={t('service_request_form.subtitle', 'Hệ thống sẽ lọc KTV phù hợp nhất theo yêu cầu')}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[520px]">
          {/* Chọn dịch vụ (Nếu chưa chọn từ trước) */}
          {propServiceTitle ? (
            <View className="mb-4 rounded-xl bg-primary-color-2/10 p-3 border border-primary-color-2/20">
              <Text className="font-inter-semibold text-xs text-primary-color-2">
                {t('service_request_form.service_label', 'Dịch vụ')}:{' '}
                <Text className="font-inter-bold text-sm text-primary-color-2">
                  {propServiceTitle}
                </Text>
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              <View className="mb-2 flex-row items-center gap-1.5">
                <Layers size={14} className="text-primary-color-2" />
                <Text className="font-inter-semibold text-sm text-slate-800">
                  {t('service_request_form.service_label', 'Chọn dịch vụ cần phục vụ')} *
                </Text>
              </View>
              {isCategoriesLoading ? (
                // Skeleton loading khi đang fetch categories
                <View className="flex-row flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      className="h-9 w-28 rounded-full bg-slate-100 animate-pulse"
                    />
                  ))}
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((srv) => {
                    const srvId = Number(srv.id);
                    const isSelected = selectedServiceId === srvId;
                    return (
                      <TouchableOpacity
                        key={srv.id}
                        onPress={() => setSelectedServiceId(srvId)}
                        className={cn(
                          'flex-row items-center gap-1 rounded-full px-3.5 py-2 border',
                          isSelected
                            ? 'bg-primary-color-2/10 border-primary-color-2'
                            : 'bg-slate-50 border-slate-200'
                        )}
                      >
                        {isSelected && <Check size={14} className="text-primary-color-2" />}
                        <Text
                          className={cn(
                            'text-xs font-inter-medium',
                            isSelected ? 'text-primary-color-2 font-inter-bold' : 'text-slate-700'
                          )}
                        >
                          {srv.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Kỹ thuật mong muốn */}
          <Text className="mb-2 font-inter-semibold text-sm text-slate-800">
            {t('service_request_form.techniques_label', 'Kỹ thuật mong muốn (Có thể chọn nhiều)')}
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {TECHNIQUES_OPTIONS.map((item) => {
              const isSelected = selectedTechniques.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  className={cn(
                    'flex-row items-center gap-1 rounded-full px-3 py-1.5 border',
                    isSelected
                      ? 'bg-primary-color-2/10 border-primary-color-2'
                      : 'bg-slate-50 border-slate-200'
                  )}
                  onPress={() => toggleTechnique(item.id)}
                >
                  {isSelected && <Check size={12} className="text-primary-color-2" />}
                  <Text
                    className={cn(
                      'text-xs font-inter-medium',
                      isSelected ? 'text-primary-color-2 font-inter-bold' : 'text-slate-600'
                    )}
                  >
                    {t(item.labelKey, item.defaultLabel)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Mức độ gấp */}
          <Text className="mb-2 font-inter-semibold text-sm text-slate-800">
            {t('service_request_form.urgency_label', 'Mức độ gấp')}
          </Text>
          <View className="mb-4 flex-col gap-2">
            {[
              {
                level: _UrgencyLevel.NEED_NOW,
                label: t('admin.urgency_level.need_now', 'Cần gấp (30-60 phút)'),
              },
              {
                level: _UrgencyLevel.TODAY,
                label: t('admin.urgency_level.today', 'Trong ngày hôm nay'),
              },
              {
                level: _UrgencyLevel.SCHEDULED,
                label: t('admin.urgency_level.scheduled', 'Đặt lịch hẹn trước'),
              },
            ].map((item) => {
              const active = urgencyLevel === item.level;
              return (
                <TouchableOpacity
                  key={item.level}
                  className={cn(
                    'flex-row items-center gap-2 rounded-xl p-3 border',
                    active
                      ? 'bg-primary-color-2/10 border-primary-color-2'
                      : 'bg-slate-50 border-slate-200'
                  )}
                  onPress={() => setUrgencyLevel(item.level)}
                >
                  <Clock size={16} color={active ? '#10b981' : '#64748B'} />
                  <Text
                    className={cn(
                      'text-xs font-inter-medium flex-1',
                      active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-700'
                    )}
                  >
                    {item.label}
                  </Text>
                  {active && <Check size={16} className="text-primary-color-2" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Địa chỉ phục vụ */}
          <View className="mb-2 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5 flex-1">
              <MapPin size={14} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('service_request_form.address_label', 'Địa chỉ phục vụ *')}
              </Text>
            </View>
            {/* Nút Lấy Vị Trí Hiện Tại (Ảnh 1) */}
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="flex-row items-center rounded-lg bg-primary-color-2/10 px-2.5 py-1.5 active:bg-primary-color-2/20"
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#F97316" className="mr-1" />
              ) : (
                <Icon as={MapPin} size={14} className="mr-1 text-primary-color-2" />
              )}
              <Text className="font-inter-medium text-xs text-primary-color-2">
                {t('location.get_current_location', 'Lấy vị trí hiện tại')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ô Chọn Địa Chỉ (Bấm mở Modal Danh Sách Địa Chỉ Đã Lưu - Ảnh 3) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowLocationModal(true)}
            className="mb-4 flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 active:bg-slate-100"
          >
            <View className="flex-1 mr-2 flex-row items-center gap-2">
              <Icon as={MapPin} size={18} className="text-primary-color-2 flex-shrink-0" />
              <Text
                className={cn(
                  'text-sm font-inter-medium flex-1',
                  address ? 'text-slate-900' : 'text-slate-400'
                )}
                numberOfLines={2}
              >
                {address || t('service_request_form.address_placeholder', 'Chọn địa chỉ phục vụ...')}
              </Text>
            </View>
            <Icon as={ChevronRight} size={18} className="text-slate-400" />
          </TouchableOpacity>

          {/* Ghi chú */}
          <View className="mb-1 flex-row items-center gap-1.5">
            <FileText size={14} className="text-sky-600" />
            <Text className="font-inter-semibold text-sm text-slate-800">
              {t('service_request_form.note_label', 'Ghi chú thêm cho CSKH')}
            </Text>
          </View>
          <TextInput
            className="h-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-primary-color-2 focus:bg-white"
            placeholder={t(
              'service_request_form.note_placeholder',
              'Ví dụ: Cần KTV có tay nghề bấm huyệt tốt...'
            )}
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            multiline
            textAlignVertical="top"
          />

          {errorMessage && (
            <Text className="mt-2 text-xs font-inter-medium text-red-500">{errorMessage}</Text>
          )}
        </ScrollView>

        {/* Footer Submit Action */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className="pt-3 border-t border-slate-100 bg-white"
        >
          <TouchableOpacity
            className={cn(
              'flex-row items-center justify-center rounded-xl bg-primary-color-2 py-3.5 active:bg-primary-color-2/90',
              createMutation.isPending && 'opacity-60'
            )}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-inter-bold text-sm text-white">
                {t('service_request_form.submit_button', 'Gửi yêu cầu tới CSKH')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </BaseBottomModal>

      {/* Modal Chọn Địa Chỉ Đã Lưu (Ảnh 3) */}
      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleSelectLocation}
      />
    </>
  );
};

