import * as ImagePicker from 'expo-image-picker';
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
        t('profile.partner_form.alert_photo_permission_message'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      // 1. Ưu tiên lấy tên file từ Expo, nếu không có mới cắt từ URI
      let name = asset.fileName;
      if (!name) {
        name = uri.split('/').pop() || `image_${Date.now()}.jpg`;
      }

      // 2. Ưu tiên lấy mimeType từ Expo, nếu không có mới dùng Regex đoán từ tên file
      let type = asset.mimeType;
      if (!type) {
        const match = /\.(\w+)$/.exec(name);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      }

      // Trả về Object chuẩn bị sẵn cho FormData
      onPicked({ uri, name, type });
    }
  }, []);

  return { pickImage };
};