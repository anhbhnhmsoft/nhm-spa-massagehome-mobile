import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { useListServices } from '@/features/ktv/hooks';
import { ServiceCardSkeleton } from '@/components/app/ktv';
import { ServiceCard } from '@/components/app/ktv/service';
import { CategoryServiceItem } from '@/features/ktv/types';
import { ServicesBottomSheet } from '@/components/app/ktv/service-bottom-sheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function ServiceListScreen() {
  const { data, refetch, isRefetching, isLoading } =
    useListServices();

  const { t } = useTranslation();

  const bottomPadding = getTabBarHeight() + 20;
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const [detail, setDetail] = useState<CategoryServiceItem | null>(null);

  const onDetail = useCallback((item: CategoryServiceItem) => {
    setDetail(item);
    bottomSheetRef.current?.present();
  }, []);


  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <HeaderAppKTV />

      {/* List Content */}
      <View className="flex-1 p-4">
        {isLoading || isRefetching ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ServiceCardSkeleton key={`service-skeleton-${index}`} />
          ))
        ) : (
          <FlatList
            keyExtractor={(item, index) => `service-${item.id}-${index}`}
            data={data}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{
              flex: 1,
              position: 'relative',
            }}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: bottomPadding,
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={null}
            renderItem={({ item }) => (
              <ServiceCard
                item={item}
                onDetail={onDetail}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            ListEmptyComponent={() => (
              <View className="flex items-center justify-center gap-4">
                <Text className="font-inter-medium text-base text-gray-400">
                  {t('ktv.services.no_service')}
                </Text>
              </View>
            )}
          />
        )}
      </View>
      <ServicesBottomSheet
        ref={bottomSheetRef}
        t={t}
        detail={detail}
        onDismiss={() => {
          setDetail(null);
          bottomSheetRef.current?.dismiss();
        }} />
    </View>
  );
}
