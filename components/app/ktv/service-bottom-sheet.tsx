import React, { FC } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TFunction } from 'i18next';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import { CategoryServiceItem } from '@/features/ktv/types';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { cn, formatBalance } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { Banknote, Clock } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useSetService } from '@/features/ktv/hooks';

type Props = {
  ref: React.Ref<BottomSheetModal>,
  detail: CategoryServiceItem | null,
  onDismiss: () => void,
  t: TFunction,


}

export const ServicesBottomSheet: FC<Props> = ({ ref, detail, onDismiss, t }) => {

  const { setService } = useSetService();

  return (
    <AppBottomSheet
      ref={ref}
      isScrollable={true}
      snapPoints={['90%']}
      onDismiss={() => {
        onDismiss();
      }}
    >
      {detail && (
        <View className={'flex-1'}>
          {/* --- IMAGE & INFO --- */}
          <View className="my-4 px-4">
            {/* Image Card */}
            <View className="relative h-48 w-full overflow-hidden rounded-2xl bg-gray-200">
              <Image
                source={{ uri: detail.image_url || '' }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                contentFit="cover"
              />
              {/* Status Badge */}
              <View
                className="absolute right-3 top-3 flex-row items-center rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
                <View
                  className={cn(
                    'mr-1.5 h-2 w-2 rounded-full',
                    detail.is_registered ? 'bg-green-500' : 'bg-gray-400',
                  )}
                />
                <Text className="font-inter-bold text-xs text-gray-800">
                  {detail.is_registered ? t('common.active') : t('common.inactive')}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text className="mt-4 font-inter-bold text-xl leading-7 text-gray-900">
              {detail.name}
            </Text>

            {/* --- BUTTONS --- */}
            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={async () => {
                  await setService(detail.id);
                  onDismiss();

                }}
                className={cn(
                  'flex-1 flex-row items-center justify-center rounded-xl bg-primary-color-2 py-3 shadow-md shadow-blue-200',
                  !detail.is_registered ? 'bg-primary-color-2' : 'bg-gray-400',
                )}>
                <Text className="ml-2 font-inter-bold text-sm text-white">
                  {detail.is_registered ? t('ktv.services.disable_service') : t('ktv.services.enable_service')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- DIVIDER --- */}
          <View className="h-1 bg-slate-100" />

          {/* --- SECTION 2: DESCRIPTION --- */}
          <View className="px-4 py-5">
            <Text className="mb-2 font-inter-bold text-base text-gray-900">
              {t('common.description')}
            </Text>
            <Text className="text-sm leading-6 text-gray-600">
              {detail.description || t('common.no_description')}
            </Text>
          </View>

          {/* --- DIVIDER --- */}
          <View className="h-1 bg-slate-100" />

          {/* --- SECTION 3: OPTIONS & ACTIONS --- */}
          <View className="px-4 py-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-inter-bold text-gray-900">{t('ktv.services.options')}</Text>
            </View>

            {/* Options List */}
            {detail.prices.map((opt, index) => (
              <View
                key={index}
                className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <View className="flex-row items-center">
                  <Clock size={14} color={DefaultColor.gray[700]} />
                  <Text className="ml-1.5 font-inter-bold text-sm text-gray-700">
                    {opt.duration} {t('common.minute')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Banknote size={14} color={DefaultColor.base['primary-color-2']} />
                  <Text className="ml-1.5 font-inter-bold text-sm text-primary-color-2">
                    {formatBalance(opt.price)} {t('common.currency')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </AppBottomSheet>
  );

};