import { CategoryItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Bath, Medal } from 'lucide-react-native';


const CategoryCard = ({ item }: { item: CategoryItem }) => {
  const { t } = useTranslation();

  const [imageError, setImageError] = useState(false);

  return(
    <TouchableOpacity className="flex-row rounded-xl border border-slate-100 bg-white p-3 shadow-sm">

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
      <View className="flex-1 justify-center">
        <Text className="mb-2 text-base font-bold text-slate-800">{item.name}</Text>
        <Text className="text-xs leading-4 text-slate-600" numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  )
}


export default CategoryCard;
