import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Globe, Sparkles, Wrench, Clock, Target, Check, X } from 'lucide-react-native';
import { CustomerCrmPreferences } from '@/features/profile/types';
import { useMutationUpdateCrmPreferences } from '@/features/profile/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';

export interface BottomCrmPreferencesModalProps {
  initialData?: CustomerCrmPreferences;
  onSaved?: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文 (Tiếng Trung)' },
  { value: 'ko', label: '한국어 (Tiếng Hàn)' },
];

const SERVICE_OPTIONS = [
  { value: 'body', label: 'Massage Body' },
  { value: 'neck_shoulder', label: 'Cổ Vai Gáy' },
  { value: 'traditional', label: 'Tẩm quất cổ truyền' },
  { value: 'thai', label: 'Massage Thái' },
  { value: 'head', label: 'Chăm sóc đầu & da mặt' },
];

const TECHNIQUE_OPTIONS = [
  { value: 'acupressure', label: 'Ấn huyệt' },
  { value: 'massage', label: 'Xoa bóp' },
  { value: 'therapy', label: 'Trị liệu chuyên sâu' },
  { value: 'stretching', label: 'Giãn cơ' },
  { value: 'essential_oil', label: 'Thư giãn tinh dầu' },
];

const TIME_SLOT_OPTIONS = [
  { value: 1, label: '00h - 06h (Đêm)' },
  { value: 2, label: '06h - 12h (Sáng)' },
  { value: 3, label: '12h - 18h (Chiều)' },
  { value: 4, label: '18h - 24h (Tối)' },
];

const DEMAND_STATUS_OPTIONS = [
  { value: 1, label: 'Cần dịch vụ ngay' },
  { value: 2, label: 'Đang tìm hiểu & So sánh' },
  { value: 3, label: 'Đã đặt lịch trước' },
  { value: 4, label: 'Chưa có nhu cầu lúc này' },
];

export const BottomCrmPreferencesModal = forwardRef<
  BottomSheetModal,
  BottomCrmPreferencesModalProps
>(({ initialData, onSaved }, ref) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast(true);
  const { mutate: updatePreferences, isPending } = useMutationUpdateCrmPreferences();

  const [languages, setLanguages] = useState<string[]>([]);
  const [preferredServices, setPreferredServices] = useState<string[]>([]);
  const [preferredTechniques, setPreferredTechniques] = useState<string[]>([]);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<number[]>([]);
  const [demandStatus, setDemandStatus] = useState<number>(2);

  useEffect(() => {
    if (initialData) {
      setLanguages(initialData.languages || ['vi']);
      setPreferredServices(initialData.preferred_services || []);
      setPreferredTechniques(initialData.preferred_techniques || []);
      setPreferredTimeSlots(initialData.preferred_time_slots || []);
      setDemandStatus(initialData.demand_status || 2);
    }
  }, [initialData]);

  const toggleArrayItem = <T,>(array: T[], setArray: (val: T[]) => void, item: T) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
    ),
    []
  );

  const handleSave = () => {
    updatePreferences(
      {
        languages,
        preferred_services: preferredServices,
        preferred_techniques: preferredTechniques,
        preferred_time_slots: preferredTimeSlots,
        demand_status: demandStatus,
      },
      {
        onSuccess: () => {
          toast.success({
            message: t('profile.update_preferences_success', 'Cập nhật nhu cầu thành công!'),
          });
          onSaved?.();
          (ref as any)?.current?.dismiss();
        },
        onError: () => {
          toast.error({
            message: t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại!'),
          });
        },
      }
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['88%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 44 }}
    >
      <View className="flex-1 flex-col justify-between">
        {/* Sticky Header */}
        <View className="flex-row items-center justify-between border-b border-slate-100 px-5 pb-3.5 pt-1">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-primary-color-2/10 p-2">
              <Icon as={Sparkles} size={18} className="text-primary-color-2" />
            </View>
            <Text className="font-inter-bold text-lg text-slate-800">
              {t('profile.crm_preferences_title', 'Khảo sát Nhu cầu Service')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => (ref as any)?.current?.dismiss()}
            className="rounded-full bg-slate-100 p-1.5"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon as={X} size={18} className="text-slate-500" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content Body */}
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        >
          {/* 1. Ngôn ngữ giao tiếp */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2.5">
              <Icon as={Globe} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('profile.communication_languages', 'Ngôn ngữ giao tiếp')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = languages.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleArrayItem(languages, setLanguages, opt.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200/80'
                    )}
                  >
                    {active && <Icon as={Check} size={14} className="text-primary-color-2" />}
                    <Text
                      className={cn(
                        'text-xs font-inter-medium',
                        active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-600'
                      )}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Dịch vụ quan tâm */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2.5">
              <Icon as={Sparkles} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('profile.preferred_services', 'Dịch vụ quan tâm')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {SERVICE_OPTIONS.map((opt) => {
                const active = preferredServices.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() =>
                      toggleArrayItem(preferredServices, setPreferredServices, opt.value)
                    }
                    className={cn(
                      'flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200/80'
                    )}
                  >
                    {active && <Icon as={Check} size={14} className="text-primary-color-2" />}
                    <Text
                      className={cn(
                        'text-xs font-inter-medium',
                        active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-600'
                      )}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Kỹ thuật mong muốn */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2.5">
              <Icon as={Wrench} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('profile.preferred_techniques', 'Kỹ thuật mong muốn')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {TECHNIQUE_OPTIONS.map((opt) => {
                const active = preferredTechniques.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() =>
                      toggleArrayItem(preferredTechniques, setPreferredTechniques, opt.value)
                    }
                    className={cn(
                      'flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200/80'
                    )}
                  >
                    {active && <Icon as={Check} size={14} className="text-primary-color-2" />}
                    <Text
                      className={cn(
                        'text-xs font-inter-medium',
                        active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-600'
                      )}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Khung giờ quan tâm */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2.5">
              <Icon as={Clock} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('profile.preferred_time_slots', 'Khung giờ quan tâm')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {TIME_SLOT_OPTIONS.map((opt) => {
                const active = preferredTimeSlots.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() =>
                      toggleArrayItem(preferredTimeSlots, setPreferredTimeSlots, opt.value)
                    }
                    className={cn(
                      'flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200/80'
                    )}
                  >
                    {active && <Icon as={Check} size={14} className="text-primary-color-2" />}
                    <Text
                      className={cn(
                        'text-xs font-inter-medium',
                        active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-600'
                      )}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Trạng thái nhu cầu */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-2.5">
              <Icon as={Target} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-800">
                {t('profile.demand_status', 'Trạng thái nhu cầu')}
              </Text>
            </View>
            <View className="flex-col gap-2.5">
              {DEMAND_STATUS_OPTIONS.map((opt) => {
                const active = demandStatus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setDemandStatus(opt.value)}
                    className={cn(
                      'flex-row items-center justify-between px-4 py-3.5 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200/80'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-inter-medium',
                        active ? 'text-primary-color-2 font-inter-bold' : 'text-slate-700'
                      )}
                    >
                      {opt.label}
                    </Text>
                    {active && <Icon as={Check} size={16} className="text-primary-color-2" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </BottomSheetScrollView>

        {/* Sticky Fixed Bottom Actions with Safe Area Bottom */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
          className="border-t border-slate-100 bg-white px-5 pt-3.5 shadow-sm"
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3.5 active:bg-slate-200"
              onPress={() => (ref as any)?.current?.dismiss()}
            >
              <Text className="font-inter-semibold text-sm text-slate-600">
                {t('common.cancel', 'Bỏ qua')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary-color-2 py-3.5 active:bg-primary-color-2/90 shadow-sm',
                isPending && 'opacity-70'
              )}
              disabled={isPending}
              onPress={handleSave}
            >
              {isPending && <ActivityIndicator size="small" color="#ffffff" />}
              <Text className="font-inter-bold text-sm text-white">
                {isPending ? t('common.saving', 'Đang lưu...') : t('common.save', 'Lưu nhu cầu')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
});

BottomCrmPreferencesModal.displayName = 'BottomCrmPreferencesModal';
export default BottomCrmPreferencesModal;
