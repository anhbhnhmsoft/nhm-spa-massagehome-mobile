import {
  View,
  Text,
  ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import {
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react-native';
import {HeaderApp} from '@/components/header-app';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard from '@/components/app/category-card';
import { KTVHomePageCard } from '@/components/app/ktv-card';
import { CarouselBanner, ScrollCommit } from '@/components/app/carousel-homepage';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import DefaultColor from '@/components/styles/color';


export default function HomeScreen() {
  const { t } = useTranslation();

  const queryKTV = useGetListKTV();

  const queryCategory = useGetCategoryList({
    page: 1,
    per_page: 5,
  });
  const bannerQuery = useListBannerQuery();

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <HeaderApp />

      {/* --- CONTENT --- */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={queryKTV.isRefetching || queryCategory.isRefetching || bannerQuery.isRefetching}
            onRefresh={() => {
              queryKTV.refetch();
              queryCategory.refetch();
              bannerQuery.refetch();
            }}
            colors={[DefaultColor.base['primary-color-1']]}
            tintColor={DefaultColor.base['primary-color-1']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* --- Carousel Banner --- */}
        <CarouselBanner bannerQuery={bannerQuery} />
        {/* --- Các chứng thực --- */}
        <ScrollCommit />

        {/* --- Danh sách KTV (Horizontal Scroll) --- */}
        <View className="my-6">
          {/*Header KTV*/}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-inter-bold text-slate-800">
              {t('homepage.technician_suggest')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(tab)/masseurs')}>
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
            <TouchableOpacity onPress={() => router.push('/(app)/(tab)/services')}>
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


