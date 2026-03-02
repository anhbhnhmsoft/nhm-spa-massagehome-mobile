import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

const FullScreenLoading = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  const { t } = useTranslation();

  return (
    // Dùng Modal để đảm bảo nó luôn nằm trên cùng của mọi lớp UI
    <Modal transparent visible={loading} animationType="fade">
      <View style={styles.fixedOverlay}>

        {/* Card Loading chính */}
        <View
          className="bg-white rounded-[40px] p-10 items-center justify-center shadow-2xl"
          style={styles.cardContainer}
        >
          {/* Logo Container với vòng tròn bao quanh nhẹ */}
          <View className="mb-6 bg-slate-50 p-4 rounded-full border border-slate-100">
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>

          {/* Spinner & Text Group */}
          <View className="items-center">
            <ActivityIndicator
              size="large"
              color={DefaultColor.base['primary-color-2']}
              className="mb-4"
            />

            <Text
              style={{ color: DefaultColor.base['primary-color-1'] }}
              className="font-inter-bold text-[15px] tracking-[1px] uppercase opacity-80"
            >
              {t('common.loading')}
            </Text>
          </View>
        </View>

      </View>
    </Modal>
  );
};

export default FullScreenLoading;

const styles = StyleSheet.create({
  fixedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Làm nền tối lại một chút để nổi bật Card trắng
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  cardContainer: {
    width: 240, // Cố định chiều rộng để Card trông cân đối
    minHeight: 280,
    elevation: 10, // Đổ bóng cho Android
    shadowColor: '#000', // Đổ bóng cho iOS
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
});