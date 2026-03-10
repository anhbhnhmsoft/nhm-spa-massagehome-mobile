import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import DefaultColor from '@/components/styles/color';
import { MotiView } from 'moti';

export interface BaseBottomModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  containerClassName?: string;
  showBackdrop?: boolean;
}

const BaseBottomModal = ({
                           visible,
                           onClose,
                           children,
                           title,
                           description,
                           containerClassName,
                           showBackdrop = true,
                         }: BaseBottomModalProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade" // Nền đen vẫn nên fade nhẹ cho mượt
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className={cn("flex-1 justify-end", showBackdrop ? "bg-black/40" : "bg-transparent")}>

          <TouchableWithoutFeedback>
            <MotiView
              from={{ translateY: 300 }}
              animate={{ translateY: visible ? 0 : 300 }}
              transition={{
                type: 'timing', // Dùng timing để không bị nảy
                duration: 100,  // Thời gian trượt (ms)
              }}
              className={cn("bg-white rounded-t-[24px] p-3", containerClassName)}
              style={[
                styles.shadow,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              {/* --- HEADER --- */}
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-1 mr-4">
                  {title && (
                    <Text className="text-lg font-inter-bold text-slate-800">{title}</Text>
                  )}
                  {description && (
                    <Text className="text-slate-400 text-sm mt-1">{description}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-slate-100 p-2 rounded-full"
                  activeOpacity={0.7}
                >
                  <X size={20} color={DefaultColor.slate[700]} />
                </TouchableOpacity>
              </View>

              {/* --- BODY --- */}
              <View>
                {children}
              </View>
            </MotiView>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 20,
      },
    }),
  },
});

export default BaseBottomModal;