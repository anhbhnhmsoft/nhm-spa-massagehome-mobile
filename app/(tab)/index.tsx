import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react-native';
import {HeaderApp} from '@/components/header-app';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import GradientImageBackground from '@/components/styles/gradient-image-background';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard from '@/components/app/category-card';
import { KTVHomePageCard } from '@/components/app/ktv-card';

/**
 * Các tính năng nổi bật
 */
const FEATURES = [
  {
    id: 1,
    icon: 'CheckCircle',
    title: 'homepage.features.verify',
    sub: 'homepage.features.verify_sub',
    color: 'text-green-500',
    bg: 'bg-green-100',
  },
  {
    id: 2,
    icon: 'ShieldCheck',
    title: 'homepage.features.service',
    sub: 'homepage.features.service_sub',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  {
    id: 3,
    icon: 'RefreshCw',
    title: 'homepage.features.cancel',
    sub: 'homepage.features.cancel_sub',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
  },
  {
    id: 4,
    icon: 'Award',
    title: 'homepage.features.award',
    sub: 'homepage.features.award_sub',
    color: 'text-orange-500',
    bg: 'bg-orange-100',
  },
];

export default function HomeScreen() {
  const { t } = useTranslation();

  const queryKTV = useGetListKTV({
    filter: {},
    page: 1,
    per_page: 5,
  });

  const queryCategory = useGetCategoryList({
    filter: {},
    page: 1,
    per_page: 5,
  });

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <HeaderApp />

      {/* --- CONTENT --- */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* --- BANNER --- */}
        <View className="mb-6 gap-4">
          <TouchableOpacity
            onPress={() => {
              router.push('/(tab)/services');
            }}>
            <GradientImageBackground
              className="h-48 w-full justify-center rounded-2xl"
              direction={'diagonal'}
              gradientOpacity={0.6}
              imageSource={require('@/assets/images/bg-1.png')}>
              <View className="flex-1 justify-between p-6">
                <View>
                  <Text className="mb-2 text-3xl font-bold text-white shadow-sm">
                    {t('homepage.hero_title')}
                  </Text>
                  <Text className="text-base font-medium text-white/90">
                    {t('homepage.hero_description')}
                  </Text>
                </View>

                {/* Nút mũi tên */}
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <ArrowRight size={20} color="white" />
                </View>
              </View>
            </GradientImageBackground>
          </TouchableOpacity>
        </View>

        {/* --- Các tính năng nổi bật (Grid) --- */}
        <View className="mb-6 flex-row flex-wrap justify-between">
          {FEATURES.map((item, index) => (
            <View
              key={index}
              className="mb-4 w-[48%] items-center rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <View
                className={`h-10 w-10 ${item.bg} mb-2 items-center justify-center rounded-full`}>
                {getIcon(item.icon, item.color)}
              </View>
              <Text className="mb-1 text-center font-inter-bold text-slate-800">
                {t(item.title)}
              </Text>
              <Text className="text-center text-xs text-slate-400">{t(item.sub)}</Text>
            </View>
          ))}
        </View>

        {/* --- Danh sách KTV (Horizontal Scroll) --- */}
        <View className="mb-6">
          {/*Header KTV*/}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-inter-bold text-slate-800">
              {t('homepage.technician_suggest')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tab)/masseurs')}>
              <Text className="text-sm font-medium text-blue-600">{t('common.see_all')}</Text>
            </TouchableOpacity>
          </View>
          {/*Danh sách KTV*/}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
            {queryKTV.isLoading && queryKTV.isRefetching ? (
              <LoadingSkeleton />
            ) : (
              <>
                {queryKTV.data && queryKTV.data.length > 0 ? (
                  queryKTV.data.map((item, index) => <KTVHomePageCard key={index} item={item} />)
                ) : (
                  <Empty />
                )}
              </>
            )}
          </ScrollView>
        </View>

        {/* --- CATEGORY (Vertical List) --- */}
        <View className="mb-6">
          {/*Header Category*/}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-inter-bold text-slate-800">{t('homepage.services')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tab)/services')}>
              <Text className="text-sm font-medium text-blue-600">{t('common.see_all')}</Text>
            </TouchableOpacity>
          </View>
          {/*Danh sách Category*/}
          <View className="mb-6 gap-3">
            {queryCategory.isLoading && queryCategory.isRefetching ? (
              <LoadingSkeleton />
            ) : (
              <>
                {queryCategory.data && queryCategory.data.length > 0 ? (
                  queryCategory.data.map((item, index) => <CategoryCard key={index} item={item} />)
                ) : (
                  <Empty />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * ---- Components ----
 */

// Hàm helper để render icon động dựa trên tên (cho phần Features)
const getIcon = (name: string, color: string) => {
  const props = {
    size: 24,
    color:
      color.replace('text-', '').replace('-500', '') === 'green'
        ? '#22c55e'
        : color.includes('blue')
          ? '#3b82f6'
          : color.includes('emerald')
            ? '#10b981'
            : '#f97316',
  };

  switch (name) {
    case 'CheckCircle':
      return <CheckCircle {...props} color="#22c55e" />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} color="#3b82f6" />;
    case 'RefreshCw':
      return <RefreshCw {...props} color="#10b981" />;
    case 'Award':
      return <Award {...props} color="#f97316" />;
    default:
      return <CheckCircle {...props} />;
  }
};

// Loading skeleton
const LoadingSkeleton = () => (
  <View className="flex flex-row items-center gap-4">
    <View className="flex flex-row items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <View className="gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </View>
    </View>
    <View className="flex flex-row items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <View className="gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </View>
    </View>
  </View>
);


