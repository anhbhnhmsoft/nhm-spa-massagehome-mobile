import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ImagePlus, Trash2 } from 'lucide-react-native';

type ImageSlotProps = {
  uri: string | null;
  label: string;
  onAdd: () => void;
  onRemove?: () => void;
  disabled?: boolean;
};

export const ImageRegisterPartnerSlot: React.FC<ImageSlotProps> = ({ uri, label, onAdd, onRemove, disabled }) => {
  return (
    // Dùng View làm khung bọc ngoài cùng thay vì TouchableOpacity
    <View className="relative h-32 w-28 overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
      {uri ? (
        <>
          {/* Nút bấm vào ảnh để đổi ảnh khác */}
          <TouchableOpacity
            disabled={disabled}
            onPress={onAdd}
            activeOpacity={0.8}
            className="h-full w-full"
          >
            <Image
              source={{ uri: uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </TouchableOpacity>

          {/* Nút Xóa đè lên trên tuyệt đối (Absolute), nằm ngang hàng (sibling) với ảnh */}
          {!disabled && onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1.5 shadow-sm"
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Mở rộng vùng bấm cho dễ chạm
            >
              <Icon as={Trash2} size={14} className="text-white" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        /* Trạng thái chưa có ảnh */
        <TouchableOpacity
          disabled={disabled}
          onPress={onAdd}
          className="h-full w-full items-center justify-center"
        >
          <Icon as={ImagePlus} size={24} className="text-gray-400" />
          <Text className="mt-1 text-center text-xs text-gray-400">{label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};