import React, { useState } from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator, Pressable,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { X } from 'lucide-react-native';
import { useCommercialCoupon } from '@/features/commercial/hooks';
import { Image } from 'expo-image';
import { cn } from '@/lib/utils';
import useAuthStore from '@/features/auth/store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Component hiển thị modal khuyến mãi
const PromoModal = () => {
  const { isVisible, collectCoupon, isPending, data, setIsVisible } = useCommercialCoupon();

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Modal transparent={true} visible={isVisible} animationType="fade">
      {/* Background mờ đè lên toàn màn hình */}
      <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
        <View className="relative flex-1 items-center justify-center bg-black/70 px-6">
          {/* Nút đóng (X) */}
          <TouchableOpacity
            onPress={() => setIsVisible(false)}
            className="absolute right-5 top-6 z-50 rounded-full bg-black/20 p-2">
            <X size={24} color="white" />
          </TouchableOpacity>


          {/* Container của Carousel */}
          <View className="w-full overflow-hidden rounded-3xl shadow-2xl z-1">
            {isPending && (
              <Pressable onPress={(e) => e.stopPropagation()} className="absolute flex-1 w-full h-full z-[999] bg-black/70 items-center justify-center">
                <ActivityIndicator
                  color="white"
                  size="large"
                />
              </Pressable>
            )}
            <Carousel
              loop={false}
              width={screenWidth - 48} // Trừ đi padding 2 bên của container (px-6 = 24*2)
              height={screenHeight * 0.6} // Chiếm 60% chiều cao màn hình
              autoPlay={true}
              autoPlayInterval={4000}
              data={data}
              onSnapToItem={(index) => setActiveIndex(index)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  disabled={isPending}
                  onPress={(e) => {
                    // Ngăn chặn sự kiện click mặc định
                    e.preventDefault();
                    e.stopPropagation();
                    collectCoupon(item.id);
                  }}
                  activeOpacity={1}
                  className="h-full w-full">
                  <Image
                    source={{ uri: item.banners as string }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              )}
            />

            {/* Pagination Dots (Dấu chấm nhỏ bên dưới banner) */}
            <View className="absolute bottom-6 w-full flex-row justify-center gap-2">
              {data.map((_, index) => (
                <View
                  key={index}
                  className={cn('h-2 w-2 rounded-full', {
                    'w-6 bg-primary-color-2': activeIndex === index,
                    'bg-white/50': activeIndex !== index,
                  })}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PromoModal;
