import React from 'react';
import {
  View, FlatList, RefreshControl,
} from 'react-native';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useGetKTVConversations } from '@/features/chat/hooks';
import { ChatItem } from '@/components/app/ktv/chat';
import Empty from '@/components/empty';


export default function ChatKTVScreen() {

  const {
    conversations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetKTVConversations();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-white">
      {/* --- HEADER --- */}
      <HeaderAppKTV />

      {/* --- CHAT LIST CONTAINER --- */}
      <View className="flex-1 mt-2">

        {/* --- CHAT LIST --- */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          style={{
            flex: 1,
            position: 'relative',
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={null}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          renderItem={({ item }) => <ChatItem item={item} />}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          ListEmptyComponent={<Empty />}
        />
      </View>
    </View>
  );
}
