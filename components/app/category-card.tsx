import { CategoryItem } from '@/features/service/types';
import React, { useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Bath, Medal } from 'lucide-react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { useKTVSearchStore } from '@/features/user/stores';
import { router } from 'expo-router';
import {Text} from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';

const CategoryCard = ({ item }: { item: CategoryItem }) => {
  const setFilter = useKTVSearchStore((state) => state.setFilter);

  const [imageError, setImageError] = useState(false);

  const {t} = useTranslation();

  const handlePress = useSingleTouch(() => {
    setFilter({
      category_id: item.id,
      category_name: item.name,
    });
    router.push('/(app)/(tab)/masseurs');
  });

  return(
    <TouchableOpacity
      className="flex-row rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
      onPress={handlePress}
    >
      {/* --- PHẦN ẢNH --- */}
      <View className={"relative"}>
        {item.image_url && !imageError ? (
          <Image
            source={{ uri: item.image_url }}
            className="mr-3 h-24 w-24 rounded-lg"
            resizeMode="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="mr-3 h-24 w-24 items-center justify-center rounded-lg bg-slate-200">
            <Bath size={32} color="#94a3b8" />
          </View>
        )}
        {item.is_featured && (
          <View style={{top: -8, right: 2}} className="absolute p-2 rounded-full bg-orange-200 px-2 text-xs items-center flex-row justify-center" >
            <Medal size={14} color={"#f97316"} />
          </View>
        )}
      </View>

      {/* --- PHẦN THÔNG TIN --- */}
      <View className="flex-1 justify-start">
        <Text className="mb-2 font-inter-bold text-primary-color-1">{item.name}</Text>
        <Text className="text-xs leading-4 text-slate-600" numberOfLines={2}>
          {item.description}
        </Text>
        <View className={"flex-row justify-end mt-4"}>
          <View className="px-3 py-1.5 rounded-lg bg-primary-color-2">
            <Text className="text-white text-xs font-inter-bold">{t('common.book_now')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}




export default CategoryCard;
