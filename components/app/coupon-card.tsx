import { CouponItem } from '@/features/service/types';
import dayjs from 'dayjs';
import { Pressable, View } from 'react-native';
import { cn, formatCurrency } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

type CouponCardBookingProps = {
  item: CouponItem;
  isSelected: boolean;
  onPress: () => void;
}

export const CouponCardBooking: FC<CouponCardBookingProps> = ({ item, isSelected, onPress }) => {
  const {t} = useTranslation();
  // Logic kiểm tra disable (Hết hạn hoặc Hết lượt)
  const isExpired = dayjs(item.end_at).isBefore(dayjs());
  const isSoldOut = item.used_count >= item.usage_limit;
  const isDisabled = isExpired || isSoldOut;

  // Logic hiển thị text giảm giá
  const discountDisplay = item.is_percentage
    ? `${Number(item.discount_value)}%`
    : formatCurrency(item.discount_value);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      className={cn(
        'mr-3 w-72 border rounded-xl flex-row overflow-hidden bg-white',
        // Style Active / Inactive / Disabled
        isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200',
        isDisabled ? 'opacity-50 bg-slate-100' : ''
      )}
    >
      {/* === CỘT TRÁI: GIÁ TRỊ GIẢM === */}
      <View className={cn(
        "w-24 items-center justify-center border-r border-dashed border-slate-300 p-2",
        isSelected ? "bg-blue-100" : "bg-slate-50"
      )}>
        <Text className="text-xl font-extrabold text-blue-600 text-center">
          {discountDisplay}
        </Text>
        <Text className="text-[10px] text-slate-500 font-inter-medium mt-1 uppercase">
          {t('common.discount')}
        </Text>
      </View>

      {/* === CỘT PHẢI: CHI TIẾT === */}
      <View className="flex-1 p-3 justify-center relative">

        {/* Label & Code */}
        <View className="flex-row justify-between items-start mb-1">
          <View className="flex-1 mr-2">
            <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>
              {item.label}
            </Text>
            <View className="self-start bg-slate-100 px-1.5 py-0.5 rounded mt-1">
              <Text className="text-[10px] font-mono text-slate-600 tracking-wider">
                {item.code}
              </Text>
            </View>
          </View>

          {/* Checkbox Icon */}
          <View className={cn(
            "w-5 h-5 rounded-full border items-center justify-center",
            isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300"
          )}>
            {isSelected && <Text className="text-white text-[10px] font-bold">✓</Text>}
          </View>
        </View>

        {/* Thông tin phụ */}
        <View className="mt-2 space-y-0.5">
          {item.is_percentage && Number(item.max_discount) > 0 && (
            <Text className="text-[10px] text-slate-500">
              {t('common.max_discount')}: <Text className="font-inter-medium text-slate-700">{formatCurrency(item.max_discount)}</Text>
            </Text>
          )}

          <Text className="text-[10px] text-slate-400">
            {t('common.expire_date')}: {dayjs(item.end_at).format('DD/MM/YYYY')}
          </Text>
        </View>

        {/* Watermark Disabled */}
        {isDisabled && (
          <View className="absolute inset-0 items-center justify-center bg-white/60">
            <Text className="text-red-500 font-inter-medium border-2 border-red-500 px-2 py-1 -rotate-12 rounded-md text-xs uppercase">
              {isSoldOut ? t('common.sold_out') : t('common.expired')}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};