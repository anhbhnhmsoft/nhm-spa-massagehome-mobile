import { ServiceItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useMemo } from 'react';
import { cn, formatBalance } from '@/lib/utils';
import { useSetService } from '@/features/service/hooks';
import DefaultColor from '../styles/color';
import {
  moderateScale,
  responsiveFont,
  responsiveIcon,
  responsiveSpacing,
  verticalScale,
} from '@/lib/utils/responsive';
import { UserStar } from 'lucide-react-native';

/**
 * Component hiển thị thông tin dịch vụ (Card) ở màn chi tiết massager
 * @param item
 * @constructor
 */
export const ServiceCard = ({ item }: { item: ServiceItem }) => {
  const { t } = useTranslation();

  // tính giá thấp nhất trong options
  const minPrice = useMemo(() => {
    const min = item.options.reduce(
      (acc, option) => Math.min(acc, Number(option.price)),
      Number(item.options[0].price)
    );
    return min.toFixed(2);
  }, [item.options]);

  const setService = useSetService();

  return (
    <TouchableOpacity
      disabled={!item.is_active}
      onPress={() => setService(item.id)}
      className={cn('flex-row items-start justify-between gap-4 rounded-2xl p-5', {
        'bg-slate-100': item.is_active,
        'bg-slate-200': !item.is_active,
      })}>
      <View className="flex-1 gap-2">
        <Text className="font-inter-bold text-sm text-gray-500" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-baseline">
          <Text className="ml-1 font-inter-bold text-sm text-gray-400">
            {t('services.price_service_sub')}
          </Text>
          <Text className="font-inter-bold text-2xl text-primary-color-1">
            {formatBalance(minPrice)} đ
          </Text>
        </View>
      </View>

      {/* Status Badge + category */}
      <View className="gap-2">
        <View
          className={cn('self-end rounded-lg bg-emerald-100 px-2 py-1', {
            'bg-emerald-100': item.is_active,
            'bg-red-100': !item.is_active,
          })}>
          <Text
            className={cn('font-inter-bold text-xs text-emerald-700', {
              'text-emerald-700': item.is_active,
              'text-red-700': !item.is_active,
            })}>
            {item.is_active ? t('services.available') : t('services.unavailable')}
          </Text>
        </View>

        <View className={'self-start rounded-lg bg-slate-50 px-2 py-1'}>
          <Text className={'font-inter-bold text-xs text-primary-color-1'}>
            {item.category.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Component hiển thị thông tin dịch vụ (Card) ở màn dịch vụ của tôi
 *
 * @param item
 * @constructor
 */
export const MyServiceCard = ({ item }: { item: ServiceItem }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <Image
        source={{
          uri: item.image_url || 'https://images.unsplash.com/photo-1600334129128-685c5582fd35',
        }}
        style={styles.image}
      />
      <View style={styles.containerContent}>
        <View>
          <Text className="font-inter-bold text-sm text-gray-500" numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.containerCategory}>
            <View style={styles.category}>
              <Text style={{ fontSize: 10, color: DefaultColor.primary[2] }}>
                {item.category.name}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <UserStar size={responsiveIcon(16)} color={DefaultColor.primary[3]} />
            <Text
              style={{
                fontSize: responsiveFont(12),
                color: DefaultColor.primary[3],
                fontWeight: '600',
                marginLeft: responsiveSpacing(5),
              }}>
              {item.bookings_count}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <TouchableOpacity style={styles.button}>
            <Text
              style={{
                fontSize: responsiveFont(12),
                color: DefaultColor.base[2],
                fontWeight: '600',
              }}>
              Xem chi tiết
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[styles.status, { backgroundColor: item.is_active ? DefaultColor.note[3] : 'red' }]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DefaultColor.base[2],
    flexDirection: 'row',
    padding: responsiveSpacing(12),
    borderRadius: moderateScale(20),
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Shadow cho Android
    elevation: 2,
  },
  image: {
    width: verticalScale(130),
    height: verticalScale(130),
    borderRadius: moderateScale(20),
  },
  containerContent: {
    flex: 1,
    marginLeft: responsiveSpacing(12),
    paddingTop: responsiveSpacing(10),
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: 'rgba(43, 123, 190, 0.1)',
    paddingHorizontal: responsiveSpacing(10),
    borderRadius: 999,
  },
  containerCategory: {
    flexDirection: 'row',
    marginTop: 5,
  },
  status: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DefaultColor.note[3],
  },
  button: {
    backgroundColor: DefaultColor.note[3],
    paddingHorizontal: responsiveSpacing(10),
    borderRadius: moderateScale(6),
  },
});
