import { useGetCategoryList } from '@/features/service/hooks';
import React, { FC } from 'react';
import { TFunction } from 'i18next';
import {  View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useKTVSearchStore } from '@/features/user/stores';
import Empty from '@/components/empty';
import { CategoryCard } from '@/components/app/customer/category-card';


export const ListServiceHomePage: FC<{
  queryCategory: ReturnType<typeof useGetCategoryList>;
  t: TFunction;
}> = ({ queryCategory, t }) => {

  const setFilter = useKTVSearchStore((state) => state.setFilter);

  return (
    <View className="mb-10 mt-4 px-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-inter-bold text-base text-slate-800">{t('homepage.services')}</Text>
        <Link href={'/(app)/(customer)/(tab)/services'}>
          <Text className="font-inter-bold text-xs text-primary-color-2">
            {t('common.see_all')}
          </Text>
        </Link>
      </View>

      <View className="gap-3">
        {queryCategory.isLoading && queryCategory.isRefetching ? (
          <>
            <View className={'px-4'}>
              <View className="mr-4 flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <View className="gap-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </View>
              </View>
              <View className="mr-4 flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <View className="gap-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {queryCategory.data && queryCategory.data.length > 0 ? (
              queryCategory.data.map((item, index) =>
                <CategoryCard key={index} item={item} setFilter={setFilter} t={t}/>)
            ) : (
              <Empty />
            )}
          </>
        )}
      </View>
    </View>
  );
};



