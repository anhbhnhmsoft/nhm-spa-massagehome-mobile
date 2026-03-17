import React, { forwardRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useChangeImage, useEditImage } from '@/features/ktv/hooks';
import { useProfileKtvQuery } from '@/features/ktv/hooks/use-query';
import { Alert } from 'react-native';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';

export const BottomEditImage = forwardRef<
  BottomSheetModal,
  {
    imageLength?: number;
  }
>(({ imageLength }, ref) => {
  const { t } = useTranslation();

  const { takePictureCamera } = useChangeImage();
  const { addImages } = useEditImage();
  const { data: profileData } = useProfileKtvQuery();
  const MAX_IMAGE = 5;

  return (
    <AppBottomSheet ref={ref} dynamicSizing={true}>
      <TouchableOpacity
        className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
        onPress={() => {
          takePictureCamera().finally(() => {
            (ref as any)?.current?.dismiss();
          });
        }}>
        <Text className="font-inter-medium text-lg text-slate-800">{t('profile.take_photo')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
        onPress={() => {
          const current =
            (profileData as any)?.images?.length ??
            (profileData as any)?.gallery?.length ??
            (profileData as any)?.photos?.length ??
            0;
          if (current >= MAX_IMAGE) {
            Alert.alert(t('common.error'), t('image.max_5'));
            (ref as any)?.current?.dismiss();
            return;
          }

          addImages(imageLength!, () => {
            // ✅ truyền vào addImages
            (ref as any)?.current?.dismiss();
          });
        }}>
        <Text className="font-inter-medium text-lg text-slate-800">
          {t('profile.choose_from_lib')}
        </Text>
      </TouchableOpacity>
    </AppBottomSheet>
  );
});
