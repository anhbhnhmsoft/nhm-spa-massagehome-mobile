import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity,  Modal } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { X } from 'lucide-react-native';
import { useCommercialCoupon } from '@/features/commercial/hooks';
import { Image } from 'expo-image';
import { cn } from '@/lib/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Component hiển thị modal khuyến mãi
const PromoModal = () => {

  const {isVisible, collectCoupon, isPending, data, setIsVisible} = useCommercialCoupon();

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
    >
      {/* Background mờ đè lên toàn màn hình */}
      <View className="flex-1 justify-center items-center bg-black/70 px-6 relative">
        {/* Nút đóng (X) */}
        <TouchableOpacity
          onPress={() => setIsVisible(false)}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/20 p-2"
        >
          <X size={24} color="white" />
        </TouchableOpacity>

        {/* Container của Carousel */}
        <View className="w-full overflow-hidden rounded-3xl shadow-2xl">
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
                onPress={() => collectCoupon(item.id)}
                activeOpacity={1}
                className="w-full h-full"
              >
                <Image
                  source={{ uri: item.banners as string }}
                  style={{ width: "100%", height: "100%" }}
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
                className={cn('h-2 rounded-full w-2', { 'w-6 bg-primary-color-2': activeIndex === index, 'bg-white/50': activeIndex !== index })}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PromoModal;
