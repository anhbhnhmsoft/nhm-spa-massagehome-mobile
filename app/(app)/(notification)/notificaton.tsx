import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next'; // Thường dùng để format date
import 'dayjs/locale/vi';

import HeaderBack from '@/components/header-back';
import { useNotificationScreen } from '@/features/notification/hook';
import Empty from '@/components/empty';
import NotificatonItem from '@/components/app/notification_card';

export default function NotificationScreen() {
  const { t } = useTranslation();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    handleReadNotification,
  } = useNotificationScreen();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderBack title={t('profile.notification')} />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
          position: 'relative',
        }}
        contentContainerStyle={{
          gap: 12,
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={null}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        renderItem={({ item }) => <NotificatonItem item={item} onRead={handleReadNotification} />}
        ListEmptyComponent={<Empty />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      />
    </SafeAreaView>
  );
}
