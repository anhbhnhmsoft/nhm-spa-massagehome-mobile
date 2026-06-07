import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import dayjs from 'dayjs';

import BaseBottomModal from '@/components/ui/base-bottom-modal';
import Avatar from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { BookingApplicationItem, BookingApplicationPreviewResponse } from '@/features/booking/types';
import { useTranslation } from 'react-i18next';
import { formatBalance } from '@/lib/utils';

type Props = {
  visible: boolean;
  onClose: () => void;
  data: BookingApplicationItem[];
  onSelect: (application: BookingApplicationItem) => void;
  onChangeSelection?: (application: BookingApplicationItem) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  loadingText?: string;
  emptyText?: string;
  preview?: BookingApplicationPreviewResponse['data'] | null;
  previewLoading?: boolean;
  title: string;
};

export const ApplicationTechnicianModal = ({
  visible,
  onClose,
  data,
  onSelect,
  onChangeSelection,
  isLoading,
  isSubmitting,
  loadingText,
  emptyText,
  preview,
  previewLoading,
  title,
}: Props) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const selectedApplication = useMemo(
    () => data.find((item) => item.id === activeId) || null,
    [activeId, data]
  );

  return (
    <BaseBottomModal visible={visible} onClose={onClose} title={title}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-3">
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator />
              {loadingText ? (
                <Text className="mt-3 text-sm text-slate-500">{loadingText}</Text>
              ) : null}
            </View>
          ) : data.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-center text-sm text-slate-500">{emptyText || '-'}</Text>
            </View>
          ) : data.map((item) => (
            <TouchableOpacity
              key={item.id}
              disabled={isSubmitting}
              onPress={() => {
                setActiveId(item.id);
                onChangeSelection?.(item);
              }}
              className={`rounded-2xl border bg-white p-4 ${
                activeId === item.id ? 'border-primary-color-2' : 'border-slate-200'
              }`}
            >
              <View className="flex-row items-center">
                <Avatar source={item.ktv.avatar_url} size={48} />
                <View className="ml-3 flex-1">
                  <Text className="font-inter-bold text-base text-slate-900">
                    {item.ktv.name || '-'}
                  </Text>
                  {typeof item.ktv.experience === 'number' ? (
                    <Text className="mt-1 text-xs text-slate-500">
                      {item.ktv.experience} năm kinh nghiệm
                    </Text>
                  ) : null}
                  {item.applied_at ? (
                    <Text className="mt-1 text-xs text-slate-400">
                      {dayjs(item.applied_at).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  ) : null}
                </View>
                {isSubmitting && activeId === item.id ? <ActivityIndicator /> : null}
              </View>

              {item.ktv.location?.address ? (
                <View className="mt-3 flex-row items-start">
                  <MapPin size={14} color="#64748b" />
                  <Text className="ml-2 flex-1 text-sm text-slate-600">
                    {item.ktv.location.address}
                  </Text>
                </View>
              ) : null}

              {item.ktv.bio?.vi ? (
                <Text className="mt-3 text-sm leading-5 text-slate-600" numberOfLines={3}>
                  {item.ktv.bio.vi}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </BaseBottomModal>
  );
};
