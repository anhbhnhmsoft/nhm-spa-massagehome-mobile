import React, { FC } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Sparkles, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react-native';
import { TFunction } from 'i18next';

interface CskhMatchingBannerProps {
  t: TFunction;
  onPress: () => void;
}

export const CskhMatchingBanner: FC<CskhMatchingBannerProps> = ({ t, onPress }) => {
  return (
    <View className="mt-4 mb-4 px-4">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="overflow-hidden rounded-2xl border border-primary-color-2/20 bg-gradient-to-r from-orange-50 to-amber-50/60 p-4 shadow-sm active:bg-orange-100/60"
        style={{
          backgroundColor: '#FFF7ED', // orange-50 fallback
        }}
      >
        {/* Top Header Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5 rounded-full bg-primary-color-2/15 px-2.5 py-1">
            <Icon as={Sparkles} size={13} className="text-primary-color-2" />
            <Text className="font-inter-bold text-[11px] tracking-wide text-primary-color-2 uppercase">
              {t('homepage.cskh_banner.badge', 'CSKH Matching')}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Icon as={ShieldCheck} size={14} className="text-emerald-600" />
            <Text className="font-inter-medium text-[11px] text-emerald-600">
              {t('homepage.cskh_banner.guarantee', 'Đảm bảo tay nghề')}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="font-inter-bold text-base text-slate-800 leading-snug">
              {t('homepage.cskh_banner.title', 'Không muốn tự tìm? Nhờ CSKH chọn KTV')}
            </Text>
            <Text className="mt-1 font-inter-regular text-xs text-slate-600 leading-relaxed" numberOfLines={2}>
              {t(
                'homepage.cskh_banner.desc',
                'Gửi yêu cầu theo kỹ thuật & khu vực. CSKH sẽ kết nối KTV phù hợp nhất cho bạn.'
              )}
            </Text>
          </View>

          {/* Right Icon Button */}
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-color-2 shadow-sm">
            <Icon as={ArrowRight} size={20} className="text-white" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
