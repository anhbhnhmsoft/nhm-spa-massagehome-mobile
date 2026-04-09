import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IFileUpload } from '@/lib/types';
import { useCallback, useRef, useState } from 'react';
import { _PartnerFileType } from '@/features/user/const';

const MAX_DIMENSION = 1280;
const COMPRESS_QUALITY = 0.7;

export const useImagePicker = () => {
  const { t } = useTranslation();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  const pickImage = useCallback(async (key: string, onPicked: (fileInfo: IFileUpload) => void) => {
    // Chặn ngay lập tức nếu đang xử lý slot khác
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      if (Platform.OS === 'ios') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.message'));
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoadingKey(key);
        try {
          const asset = result.assets[0];
          const { width, height } = asset;
          let resizeWidth = width;
          let resizeHeight = height;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width >= height) {
              resizeWidth = MAX_DIMENSION;
              resizeHeight = Math.round((height / width) * MAX_DIMENSION);
            } else {
              resizeHeight = MAX_DIMENSION;
              resizeWidth = Math.round((width / height) * MAX_DIMENSION);
            }
          }

          const context = ImageManipulator.manipulate(asset.uri);

          if (resizeWidth !== width || resizeHeight !== height) {
            context.resize({ width: resizeWidth, height: resizeHeight });
          }

          const image = await context.renderAsync();
          const saved = await image.saveAsync({
            compress: COMPRESS_QUALITY,
            format: SaveFormat.JPEG,
          });

          onPicked({
            uri: saved.uri,
            name: `image_${Date.now()}.jpg`,
            type: 'image/jpeg',
          });
        } finally {
          setLoadingKey(null);
        }
      }
    } finally {
      // Luôn release dù cancel hay lỗi
      isProcessingRef.current = false;
    }
  }, []);

  return {
    pickImage,
    loadingKey,
    isAnyLoading: loadingKey !== null, // có slot nào đang loading không
  };
};
