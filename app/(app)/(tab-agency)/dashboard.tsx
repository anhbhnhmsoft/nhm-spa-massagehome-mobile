import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { HeaderAppAgency } from '@/components/app/agency/header-app';
import { DashboardHeader, TechnicianItem } from '@/components/app/agency/doashboad-card';
import { useDashboardAgency } from '@/features/agency/hook';

const DashboardScreen: React.FC = () => {
  const {
    t,
    tabs,
    activeFilter,
    setActiveFilter,
    statsData,
    isStatsLoading,
    listPerformanceKtv,
    isFetchingNextPage,
    isRefetching,
    onRefresh,
    handleLoadMore,
  } = useDashboardAgency();

  // Render Footer để hiển thị loading khi tải thêm trang
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return <View className="h-10" />;
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color="#044984" />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View className="flex-1 bg-white">
      <HeaderAppAgency />

      <FlatList
        data={listPerformanceKtv}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <TechnicianItem item={item} t={t} />}
        ListHeaderComponent={
          <DashboardHeader
            t={t}
            tabs={tabs}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            data={statsData}
            isLoading={isStatsLoading}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={['#044984']}
            tintColor={'#044984'}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default DashboardScreen;
