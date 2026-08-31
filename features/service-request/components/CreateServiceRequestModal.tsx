import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkles, MapPin, Clock, FileText, Check } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import BaseBottomModal from '@/components/ui/base-bottom-modal';
import { useCreateServiceRequestMutation } from '@/features/service-request/hooks/use-mutation';
import { _UrgencyLevel } from '@/features/service-request/types';
import { cn } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CreateServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId: number;
  serviceTitle: string;
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
  serviceId,
  serviceTitle,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<_UrgencyLevel>(
    _UrgencyLevel.NEED_NOW
  );
  const [address, setAddress] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateServiceRequestMutation();

  const toggleTechnique = (id: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      setErrorMessage(t('service_request_form.address_placeholder', 'Vui lòng nhập địa chỉ phục vụ'));
      return;
    }
    setErrorMessage(null);

    createMutation.mutate(
      {
        service_id: serviceId,
        preferred_techniques: selectedTechniques,
        urgency_level: urgencyLevel,
        address: address.trim(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err?.response?.data?.message || t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại!'));
        },
      }
    );
  };

  return (
    <BaseBottomModal
      visible={visible}
      onClose={onClose}
      title={t('service_request_form.title', 'Yêu cầu CSKH tìm KTV')}
      description={t('service_request_form.subtitle', 'Hệ thống sẽ lọc KTV phù hợp nhất')}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
        {/* Dịch vụ đã chọn */}
        <View className="mb-4 rounded-xl bg-primary-color-2/10 p-3 border border-primary-color-2/20">
          <Text className="font-inter-semibold text-xs text-primary-color-2">
            {t('service_request_form.service_label', 'Dịch vụ')}:{' '}
            <Text className="font-inter-bold text-sm text-primary-color-2">
              {serviceTitle}
            </Text>
          </Text>
        </View>

        {/* Kỹ thuật mong muốn */}
        <Text className="mb-2 font-inter-semibold text-sm text-slate-800">
          {t('service_request_form.techniques_label', 'Kỹ thuật mong muốn')}
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
            { level: _UrgencyLevel.NEED_NOW, label: t('admin.urgency_level.need_now', 'Cần gấp (30-60 phút)') },
            { level: _UrgencyLevel.TODAY, label: t('admin.urgency_level.today', 'Trong ngày hôm nay') },
            { level: _UrgencyLevel.SCHEDULED, label: t('admin.urgency_level.scheduled', 'Đặt lịch hẹn trước') },
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
                <Clock
                  size={16}
                  color={active ? '#10b981' : '#64748B'}
                />
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

        {/* Địa chỉ */}
        <View className="mb-1 flex-row items-center gap-1.5">
          <MapPin size={14} className="text-primary-color-2" />
          <Text className="font-inter-semibold text-sm text-slate-800">
            {t('service_request_form.address_label', 'Địa chỉ phục vụ *')}
          </Text>
        </View>
        <TextInput
          className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-primary-color-2 focus:bg-white"
          placeholder={t('service_request_form.address_placeholder', 'Nhập số nhà, tên đường, phường/xã...')}
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        {/* Ghi chú */}
        <View className="mb-1 flex-row items-center gap-1.5">
          <FileText size={14} className="text-sky-600" />
          <Text className="font-inter-semibold text-sm text-slate-800">
            {t('service_request_form.note_label', 'Ghi chú thêm cho CSKH')}
          </Text>
        </View>
        <TextInput
          className="h-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:border-primary-color-2 focus:bg-white"
          placeholder={t('service_request_form.note_placeholder', 'Ví dụ: Cần KTV có tay nghề bấm huyệt tốt...')}
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

      {/* Footer Submit Action với Safe Area Bottom Padding */}
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
  );
};
