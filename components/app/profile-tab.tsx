import { forwardRef, useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useChangeAvatar } from '@/features/auth/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Globe, Sparkles, Wrench, Clock, Target, Check, X } from 'lucide-react-native';
import { CustomerCrmPreferences } from '@/features/profile/types';
import { useMutationUpdateCrmPreferences } from '@/features/profile/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';

// Bottom Edit image
export const BottomEditAvatar = forwardRef<
  BottomSheetModal,
  {
    canDelete?: boolean;
  }
>(({ canDelete }, ref) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  const { takePictureCamera, chooseImageFormLib, deleteAvatar } = useChangeAvatar();

  // Cấu hình Backdrop (Lớp nền mờ đen phía sau)
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0} // Mở ở snap point đầu tiên (50%)
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#f5f5f5' }}
      handleIndicatorStyle={{ backgroundColor: 'white' }} // Màu cái thanh ngang nhỏ ở trên
    >
      <BottomSheetView
        style={{ paddingBottom: inset.bottom + 20 }}
        className="flex-1"
      >
        <TouchableOpacity
          className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
          onPress={() => {
            takePictureCamera().finally(() => {
              (ref as any)?.current?.dismiss();
            });
          }}>
          <Text className="font-inter-medium text-lg text-slate-800">
            {t('profile.take_photo')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
          onPress={() => {
            chooseImageFormLib().finally(() => {
              (ref as any)?.current?.dismiss();
            });
          }}>
          <Text className="font-inter-medium text-lg text-slate-800">
            {t('profile.choose_from_lib')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={'flex-row items-center px-5 py-2 pb-4'}
          onPress={() => {
            deleteAvatar();
            (ref as any)?.current?.dismiss();
          }}
          disabled={!canDelete}>
          <Text
            className={cn(
              'font-inter-medium text-lg text-red-500',
              !canDelete ? 'opacity-50' : ''
            )}>
            {t('profile.delete_avatar_title')}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

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

// Bottom CRM Preferences Modal
export const BottomCrmPreferencesModal = forwardRef<
  BottomSheetModal,
  {
    initialData?: CustomerCrmPreferences;
    onSaved?: () => void;
  }
>(({ initialData, onSaved }, ref) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
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
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
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
          toast.success({ message: t('profile.update_preferences_success', 'Cập nhật nhu cầu thành công!') });
          onSaved?.();
          (ref as any)?.current?.dismiss();
        },
        onError: () => {
          toast.error({ message: t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại!') });
        },
      }
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['85%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1' }}
    >
      <BottomSheetView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-slate-100 pb-3 pt-1">
          <View className="flex-row items-center gap-2">
            <Icon as={Sparkles} size={20} className="text-primary-color-2" />
            <Text className="font-inter-bold text-lg text-slate-800">
              {t('profile.crm_preferences_title', 'Khảo sát Nhu cầu Service')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => (ref as any)?.current?.dismiss()} className="p-1">
            <Icon as={X} size={20} className="text-slate-400" />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false} className="flex-1 py-3">
          {/* Ngôn ngữ giao tiếp */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Globe} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-700">
                {t('profile.communication_languages', 'Ngôn ngữ giao tiếp')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = languages.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleArrayItem(languages, setLanguages, opt.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 px-3 py-2 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200'
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

          {/* Dịch vụ quan tâm */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Sparkles} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-700">
                {t('profile.preferred_services', 'Dịch vụ quan tâm')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {SERVICE_OPTIONS.map((opt) => {
                const active = preferredServices.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleArrayItem(preferredServices, setPreferredServices, opt.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 px-3 py-2 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200'
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

          {/* Kỹ thuật mong muốn */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Wrench} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-700">
                {t('profile.preferred_techniques', 'Kỹ thuật mong muốn')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TECHNIQUE_OPTIONS.map((opt) => {
                const active = preferredTechniques.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleArrayItem(preferredTechniques, setPreferredTechniques, opt.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 px-3 py-2 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200'
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

          {/* Khung giờ quan tâm */}
          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Clock} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-700">
                {t('profile.preferred_time_slots', 'Khung giờ quan tâm')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TIME_SLOT_OPTIONS.map((opt) => {
                const active = preferredTimeSlots.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleArrayItem(preferredTimeSlots, setPreferredTimeSlots, opt.value)}
                    className={cn(
                      'flex-row items-center gap-1.5 px-3 py-2 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200'
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

          {/* Trạng thái nhu cầu */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon as={Target} size={16} className="text-primary-color-2" />
              <Text className="font-inter-semibold text-sm text-slate-700">
                {t('profile.demand_status', 'Trạng thái nhu cầu')}
              </Text>
            </View>
            <View className="flex-col gap-2">
              {DEMAND_STATUS_OPTIONS.map((opt) => {
                const active = demandStatus === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setDemandStatus(opt.value)}
                    className={cn(
                      'flex-row items-center justify-between px-4 py-3 rounded-xl border',
                      active
                        ? 'bg-primary-color-2/10 border-primary-color-2'
                        : 'bg-slate-50 border-slate-200'
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

        {/* Footer Actions */}
        <View
          style={{ paddingBottom: Math.max(inset.bottom, 16) + 10 }}
          className="pt-3 border-t border-slate-100 flex-row gap-3 bg-white"
        >
          <TouchableOpacity
            className="flex-1 items-center justify-center py-3.5 rounded-xl bg-slate-100 active:bg-slate-200"
            onPress={() => (ref as any)?.current?.dismiss()}
          >
            <Text className="font-inter-semibold text-slate-600 text-sm">
              {t('common.cancel', 'Bỏ qua')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={cn(
              'flex-1 items-center justify-center py-3.5 rounded-xl bg-primary-color-2 active:bg-primary-color-2/90',
              isPending && 'opacity-60'
            )}
            disabled={isPending}
            onPress={handleSave}
          >
            <Text className="font-inter-bold text-white text-sm">
              {isPending ? t('common.saving', 'Đang lưu...') : t('common.save', 'Lưu nhu cầu')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
