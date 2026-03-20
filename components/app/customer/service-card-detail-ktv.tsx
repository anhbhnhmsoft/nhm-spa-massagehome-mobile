import { FC, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {  ServiceCategoryItem } from '@/features/user/types';
import {Image} from 'expo-image';
import { TFunction } from 'i18next';
import {Text} from "@/components/ui/text"
import DefaultColor from '@/components/styles/color';
import { Icon } from '@/components/ui/icon';
import { ImageOff } from 'lucide-react-native';
import { formatBalance } from '@/lib/utils';

type Props = {
  t: TFunction;
  item: ServiceCategoryItem;
  setItem: (item: ServiceCategoryItem) => void;
}

export const ServiceCardDetailKtv: FC<Props> = ({ t, item, setItem }: Props) => {
  const [imageError, setImageError] = useState(false);
  // Tính giá thấp nhất trong danh sách giá
  const minPrice = useMemo(() => {
    const min = item.prices.reduce(
      (acc, option) => Math.min(acc, Number(option.price)),
      Number(item.prices[0]?.price ?? 0)
    );
    return min.toFixed(2);
  }, [item.prices]);

  return (
    <TouchableOpacity
      onPress={() => setItem(item)}
      className={'flex-row border-b border-gray-100 pb-4'}>
      {item.image_url && !imageError ? (
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            backgroundColor: DefaultColor.gray[200],
          }}
          contentFit="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            backgroundColor: DefaultColor.gray[200],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon as={ImageOff} size={24} className="text-slate-400" />
        </View>
      )}
      <View className="ml-3 flex-1 justify-between">
        <View>
          <View className="flex-row justify-between">
            <Text className="flex-1 pr-2 font-inter-bold text-base text-gray-800" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
            {item.description}
          </Text>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="mt-1 text-[10px] text-orange-500">
              {t('masseurs_detail.sales_count_item_service', { count: item.booking_count })}
            </Text>
          </View>
        </View>
        {/* Giá và Nút */}
        <View className="mt-2 flex-row items-end justify-between">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-inter-bold text-xs text-primary-color-1">
              {t('masseurs_detail.price_service_sub')}
            </Text>
            <Text className="font-inter-bold text-lg text-primary-color-1">
              {formatBalance(minPrice)}
            </Text>
            <Text className="font-inter-bold text-xs text-primary-color-1">
              {t('common.currency')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
