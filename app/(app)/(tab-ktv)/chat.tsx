import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCheck } from 'lucide-react-native';
import clsx from 'clsx';

// types.ts
export interface ChatSession {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isSentByMe?: boolean; // Để hiện dấu check đã xem
}

// mockData.ts
export const MOCK_CHATS: ChatSession[] = [
  {
    id: '1',
    name: 'Chị Lan (VIP)',
    avatar: 'https://i.pravatar.cc/150?img=5', // Ảnh phụ nữ
    message: 'Cảm ơn em, buổi trị liệu hôm nay rất tuyệt...',
    time: '10:30 AM',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Khách hàng mới',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&q=80', // Ảnh gradient/trừu tượng
    message: 'Bạn ơi cho mình hỏi giá gói massage body...',
    time: 'Hôm qua',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Chị Mai',
    avatar: 'https://i.pravatar.cc/150?img=9',
    message: 'Em kiểm tra giúp chị lịch hẹn ngày mai nhé',
    time: 'Thứ 2',
    unreadCount: 0,
    isOnline: false,
    isSentByMe: true, // Đã xem
  },
  {
    id: '4',
    name: 'Anh Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=11',
    message: 'Hẹn gặp em 3h chiều nay nha.',
    time: 'Thứ 6',
    unreadCount: 1,
    isOnline: false,
  },
];


export default function ChatListScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Lọc danh sách theo Tab
  const filteredData = useMemo(() => {
    if (activeTab === 'unread') {
      return MOCK_CHATS.filter(chat => chat.unreadCount > 0);
    }
    return MOCK_CHATS;
  }, [activeTab]);

  // Đếm tổng số chưa đọc để hiển thị trên Tab
  const totalUnread = MOCK_CHATS.filter(c => c.unreadCount > 0).length;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1" edges={['top']}>

        {/* --- CHAT LIST --- */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem item={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

      </SafeAreaView>
    </View>
  );
}

// --- SUB-COMPONENT: CHAT ITEM ---
const ChatItem = ({ item }: { item: ChatSession }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4 active:bg-gray-50"
    >
      {/* 1. Avatar Area */}
      <View className="relative mr-3">
        <Image
          source={{ uri: item.avatar }}
          className="h-12 w-12 rounded-full bg-gray-200"
        />
        {/* Online Status Dot */}
        {item.isOnline && (
          <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        )}
      </View>

      {/* 2. Content Area */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center justify-between mb-1">
          {/* Name */}
          <Text
            className="text-base font-bold text-gray-900"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* Time */}
          <Text className={clsx(
            "text-xs",
            item.unreadCount > 0 ? "font-bold text-blue-600" : "text-gray-400"
          )}>
            {item.time}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          {/* Last Message Preview */}
          <Text
            className={clsx(
              "flex-1 text-sm mr-4",
              item.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-500"
            )}
            numberOfLines={1}
          >
            {item.message}
          </Text>

          {/* Status Indicator (Badge or Check) */}
          {item.unreadCount > 0 ? (
            // Unread Badge
            <View className="h-5 w-5 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-[10px] font-bold text-white">
                {item.unreadCount}
              </Text>
            </View>
          ) : (
            // Read Status (Sent by me)
            item.isSentByMe && (
              <CheckCheck size={16} color="#2563EB" /> // Blue double check
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};