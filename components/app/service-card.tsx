import {  ServiceItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import {  useMemo } from 'react';
import { cn, formatBalance } from '@/lib/utils';
import { useSetService } from '@/features/service/hooks';

/**
 * Component hiển thị thông tin dịch vụ (Card) ở màn chi tiết massager
 * @param item
 * @constructor
 */
export const ServiceCard = ({ item }: { item: ServiceItem }) => {
  const { t } = useTranslation();

  // tính giá thấp nhất trong options
  const minPrice = useMemo(() => {
    const min = item.options.reduce((acc, option) => Math.min(acc, Number(option.price)), Number(item.options[0].price));
    return min.toFixed(2);
  }, [item.options]);

  const setService = useSetService();

  return (
    <TouchableOpacity
      disabled={!item.is_active}
      onPress={() => setService(item.id)}
      className={cn(' p-5 rounded-2xl flex-row items-start justify-between gap-4', {
        'bg-slate-100': item.is_active,
        'bg-slate-200': !item.is_active,
      })}
    >
      <View className="flex-1 gap-2">
        <Text className="text-gray-500 text-sm font-inter-bold" numberOfLines={1}>{item.name}</Text>
        <View className="flex-row items-baseline">
          <Text className="text-gray-400 text-sm ml-1 font-inter-bold">{t('services.price_service_sub')}</Text>
          <Text className="text-2xl font-inter-bold text-primary-color-1">
            {formatBalance(minPrice)} đ
          </Text>
        </View>
      </View>

      {/* Status Badge + category */}
      <View className="gap-2">
        <View className={cn('self-end bg-emerald-100 px-2 py-1 rounded-lg', {
          'bg-emerald-100': item.is_active,
          'bg-red-100': !item.is_active,
        })}>
          <Text className={cn('text-emerald-700 font-inter-bold text-xs', {
            'text-emerald-700': item.is_active,
            'text-red-700': !item.is_active,
          })}>
            {item.is_active ? t('services.available') : t('services.unavailable')}
          </Text>
        </View>

        <View className={'self-start bg-slate-50 px-2 py-1 rounded-lg'}>
          <Text className={'text-primary-color-1 font-inter-bold text-xs'}>
            {item.category.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


