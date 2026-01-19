import React, { forwardRef, useCallback} from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useChangeImage, useEditImage } from '@/features/ktv/hooks';
import { useProfileKtvQuery } from '@/features/ktv/hooks/use-query';
import { Alert } from 'react-native';


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
      snapPoints={[]}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#f5f5f5' }}
      handleIndicatorStyle={{ backgroundColor: 'white' }} // Màu cái thanh ngang nhỏ ở trên
    >
      <BottomSheetView className="flex-1 pb-5">
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
      </BottomSheetView>
    </BottomSheetModal>
  );
});
