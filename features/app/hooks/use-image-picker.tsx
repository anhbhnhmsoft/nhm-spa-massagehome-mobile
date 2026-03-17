import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IFileUpload } from '@/lib/types';
import { useCallback } from 'react';

export const useImagePicker = () => {
  const { t } = useTranslation();

  const pickImage = useCallback(async (onPicked: (fileInfo: IFileUpload) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('profile.partner_form.alert_photo_permission_title'),
        t('profile.partner_form.alert_photo_permission_message')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      const context = ImageManipulator.manipulate(asset.uri);
      const image = await context.renderAsync();
      const saved = await image.saveAsync({
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      onPicked({
        uri: saved.uri,
        name: `image_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  }, []);

  return { pickImage };
};
