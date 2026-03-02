import { CategoryItem } from '@/features/service/types';
import { ListKTVRequest } from '@/features/user/types';
import { TFunction } from 'i18next';
import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Bath, Medal } from 'lucide-react-native';
import {Image} from "expo-image";
import {Text} from "@/components/ui/text";
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryCard = ({ item, setFilter, t }: {
  item: CategoryItem,
  setFilter: (filterPatch: Partial<ListKTVRequest['filter']>) => void,
  t: TFunction,
}) => {

  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    setFilter({
      category_id: item.id,
      category_name: item.name,
    });
    router.push('/(app)/(customer)/(tab)/masseurs');
  },[item]);

  return (
    <TouchableOpacity
      className="flex-row rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
      onPress={handlePress}
    >
      {/* --- PHẦN ẢNH --- */}
      <View className={'relative'}>
        {item.image_url && !imageError ? (
          <Image
            source={{ uri: item.image_url }}
            className="mr-3 h-24 w-24 rounded-lg"
            style={{
              marginRight: 12,
              height: 96,
              width: 96,
              borderRadius: 12,
            }}
            contentFit="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="mr-3 h-24 w-24 items-center justify-center rounded-xl bg-slate-200">
            <Bath size={32} color="#94a3b8" />
          </View>
        )}
        {item.is_featured && (
          <View style={{ top: -8, right: 2 }}
                className="absolute p-2 rounded-full bg-orange-200 px-2 text-xs items-center flex-row justify-center">
            <Medal size={14} color={'#f97316'} />
          </View>
        )}
      </View>

      {/* --- PHẦN THÔNG TIN --- */}
      <View className="flex-1 justify-start">
        <Text className="mb-2 font-inter-bold text-primary-color-1">{item.name}</Text>
        <Text className="text-xs leading-4 text-slate-600" numberOfLines={2}>
          {item.description}
        </Text>
        <View className={'flex-row justify-end mt-4'}>
          <View className="px-3 py-1.5 rounded-lg bg-primary-color-2">
            <Text className="text-white text-xs font-inter-bold">{t('common.book_now')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const CategorySkeletonCard = () => {
  return(
    <View className="flex-row rounded-xl border border-slate-100 bg-white p-3 shadow-sm mb-3">
      <Skeleton className="mr-3 h-24 w-24 rounded-lg bg-slate-200" />
      <View className="flex-1 justify-center">
        <Skeleton className="mb-2 h-5 w-3/4 rounded-lg bg-slate-200" />
        <Skeleton className="h-12 w-full rounded-lg bg-slate-200" />
      </View>
    </View>
  )
}