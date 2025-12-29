import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { cn } from '@/lib/utils';
import { KTVConversationItem } from '@/features/chat/types';
import {Image} from "expo-image"
import DefaultColor from '@/components/styles/color';
import dayjs from 'dayjs';
import { useGetRoomChat } from '@/features/chat/hooks';

export const ChatItem = ({ item }: { item: KTVConversationItem }) => {
  const joinRoomChat = useGetRoomChat();
  return (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4"
      onPress={() => joinRoomChat({
        user_id: item.customer.id,
      }, "ktv")}
    >
      {/* 1. Avatar Area */}
      <View className="relative mr-3">
        {item.customer.avatar ? (
          <Image
            source={{ uri: item.customer.avatar }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 48,
              backgroundColor: DefaultColor.gray[200]
            }}
            contentFit="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <Text className="text-lg font-inter-medium text-white uppercase">
              {item.customer.name[0]}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Content Area */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center justify-between mb-1">
          {/* Name */}
          <Text
            className="text-base font-inter-medium text-gray-900"
            numberOfLines={1}
          >
            {item.customer.name}
          </Text>

          {/* Time */}
          <Text className={cn(
            "text-xs",
            item.unread_count > 0 ? "font-inter-bold text-primary-color-2" : "text-gray-400"
          )}>
            {item.latest_message ? dayjs(item.latest_message.created_at).format('HH:mm') : ""}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          {/* Last Message Preview */}
          <Text
            className={cn(
              "flex-1 text-sm mr-4",
              item.unread_count > 0 ? "font-inter-medium text-gray-900" : "text-gray-500"
            )}
            numberOfLines={1}
          >
            {item.latest_message ? item.latest_message.content : ""}
          </Text>

          {/* Status Indicator (Badge or Check) */}
          {item.unread_count > 0 && (
            // Unread Badge
            <View className="h-5 w-5 items-center justify-center rounded-full bg-primary-color-2">
              <Text className="text-[10px] font-inter-bold text-white">
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
