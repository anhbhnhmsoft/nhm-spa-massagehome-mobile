import { useCallback, useRef, useState } from 'react';
import { CameraType, CameraView } from 'expo-camera';
import { TouchableOpacity, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEditImage } from '@/features/ktv/hooks';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { goBack } from '@/lib/utils';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export default function TakePictureScreen() {
  // khai báo camera
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const { uploadImages } = useEditImage();

  const takePicture = useCallback(async () => {
    const camera = cameraRef.current;
    if (!camera || !camera.takePictureAsync) return;

    const photo = await camera.takePictureAsync({
      quality: 1, // Lấy full quality, để manipulator xử lý
      base64: false,
      exif: false,
    });

    // Convert sang JPEG — tránh lỗi format từ camera native
    const context = ImageManipulator.manipulate(photo.uri);
    const image = await context.renderAsync();
    const saved = await image.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    });

    const form = new FormData();
    form.append('images[]', {
      uri: saved.uri,
      name: `photo_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    try {
      uploadImages(form, () => {
        goBack();
      });
    } catch (e) {
      // noop - uploadImages handles errors via hooks
    }
  }, []);
  return (
    <View className="flex-1">
      <FocusAwareStatusBar hidden={true} />
      <CameraView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        ref={cameraRef}
        facing={facing}
      />
      <View className="flex-row items-center justify-between bg-base-color-3 px-10 py-10">
        <TouchableOpacity onPress={goBack}>
          <Entypo name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture}>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-primary-color-1">
            <View className="h-8 w-8 rounded-full bg-primary-color-1" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (facing === 'back') {
              setFacing('front');
            }
            if (facing === 'front') {
              setFacing('back');
            }
          }}>
          <AntDesign name="sync" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
