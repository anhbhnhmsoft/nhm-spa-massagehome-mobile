import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  isLoading?: boolean;
};

export const ImageRegisterPartnerSlot: React.FC<ImageSlotProps> = ({
  uri,
  label,
  onAdd,
  onRemove,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <View
      className="relative h-32 w-28 overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50"
      style={disabled && !isLoading ? styles.dimmed : styles.normal}>
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      )}

      {uri ? (
        <>
          <TouchableOpacity
            disabled={disabled || isLoading}
            onPress={onAdd}
            activeOpacity={0.8}
            className="h-full w-full">
            <Image
              source={{ uri }}
              style={styles.image} // ✅ StyleSheet thay inline
              contentFit="cover"
            />
          </TouchableOpacity>

          {!disabled && !isLoading && onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              className="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1.5 shadow-sm"
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Icon as={Trash2} size={14} className="text-white" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <TouchableOpacity
          disabled={disabled || isLoading}
          onPress={onAdd}
          className="h-full w-full items-center justify-center">
          <Icon as={ImagePlus} size={24} className="text-gray-400" />
          <Text className="mt-1 text-center text-xs text-gray-400">{label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  normal: { opacity: 1 },
  dimmed: { opacity: 0.4 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
