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
};

export const ImageSlot: React.FC<ImageSlotProps> = ({ uri, label, onAdd, onRemove }) => {
  return (
    <TouchableOpacity
      onPress={onAdd}
      className="relative h-32 w-28 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
      {uri ? (
        <>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            className="rounded-xl"
          />
          {onRemove && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 z-10"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon as={Trash2} size={14} className="text-white" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View className="items-center justify-center">
          <Icon as={ImagePlus} size={24} className="text-gray-400" />
          <Text className="mt-1 text-xs text-gray-400">{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

