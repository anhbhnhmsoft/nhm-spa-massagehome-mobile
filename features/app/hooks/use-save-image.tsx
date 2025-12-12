import { useTranslation } from 'react-i18next';
import { Directory, File, Paths } from "expo-file-system";
import { useCallback } from 'react';
import * as MediaLibrary from "expo-media-library";
import { Alert } from 'react-native';

const useSaveFileImage = () => {
  const {t} = useTranslation();

  const saveURLImage = useCallback(async (url: string, fileName: string = "image") => {
    const {status} = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t('permission.picture_lib.title'),
        t('permission.picture_lib.message')
      );
      return;
    }
    const destination = new Directory(Paths.cache, 'qrimage');
    try {
      // uri của thư mục cache
      if (!destination.exists) {
        destination.create();
      }
      const qrFile = new File(destination, `${fileName}_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`);
      // download file
      const output = await File.downloadFileAsync(url, qrFile);
      if (output.exists) {
        await MediaLibrary.saveToLibraryAsync(output.uri);
        Alert.alert(t('common_success.save_image_success'))
      } else {
        Alert.alert(t('common_error.error_save_image'))
      }
    } catch {
      Alert.alert(t('common_success.error_save_image'))
    }
  }, [t]);

  return {
    saveURLImage
  }
}

export default useSaveFileImage;
