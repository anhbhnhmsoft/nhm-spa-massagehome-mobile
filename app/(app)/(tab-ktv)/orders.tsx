import { Calendar, Clock, MapPin, Phone, FileText, Info } from 'lucide-react-native';

import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import GradientBackground from '@/components/styles/gradient-background';
import React from 'react';
import { _BookingStatusMap } from '@/features/service/const';

const CUSTOMERS = [
  {
    id: '1',
    rank: '#1',
    name: 'Trần Thị Lan',
    service: 'Massage Toàn thân',
    price: '11.520đ',
    date: '15/11/2024',
    time: '14:00 (90 phút)',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    type: 'VIP', // VIP: Cam
    avatarColor: 'bg-pink-500',
    initial: 'L',
  },
  {
    id: '2',
    rank: '#2',
    name: 'Nguyễn Văn Minh',
    service: 'Massage Thái',
    price: '5.640đ',
    date: '14/11/2024',
    time: '16:00 (60 phút)',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    type: 'VIP',
    avatarColor: 'bg-blue-500',
    initial: 'M',
  },
  {
    id: '3',
    rank: '#3',
    name: 'Phạm Thị Hương',
    service: 'Massage Chân',
    price: '5.760đ',
    date: '13/11/2024',
    time: '10:00 (45 phút)',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    type: 'REGULAR', // Thường xuyên: Xanh dương nhạt
    avatarColor: 'bg-pink-500',
    initial: 'H',
  },
  {
    id: '4',
    rank: '#4',
    name: 'Lê Văn Tùng',
    service: 'Massage Thụy Điển',
    price: '3.840đ',
    date: '12/11/2024',
    time: '18:00 (50 phút)',
    address: '321 Đường GHI, Quận 7, TP.HCM',
    type: 'REGULAR',
    avatarColor: 'bg-blue-500',
    initial: 'T',
  },
  {
    id: '5',
    rank: '#5',
    name: 'Vũ Thị Mai',
    service: 'Massage Mặt',
    price: '960đ',
    date: '10/11/2024',
    time: '15:00 (30 phút)',
    address: '654 Đường JKL, Quận 10, TP.HCM',
    type: 'NEW', // Mới: Xanh lá
    avatarColor: 'bg-pink-500',
    initial: 'M',
  },
];

const CustomerCard = ({ item }: { item: any }) => {
  // Logic màu sắc cho Tag
  const getTagStyle = (type: string) => {
    switch (type) {
      case 'VIP':
        return { bg: 'bg-orange-400', text: 'text-white', label: 'VIP' };
      case 'REGULAR':
        return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Thường xuyên' };
      case 'NEW':
        return { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Mới' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Khách' };
    }
  };

  const tagStyle = getTagStyle(item.type);

  return (
    <View className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* 1. Header Card: Tag & Rank */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className={`${tagStyle.bg} rounded-full px-3 py-1`}>
          <Text className={`${tagStyle.text} text-[10px] font-bold`}>{tagStyle.label}</Text>
        </View>
        <Text className="text-xs font-bold text-slate-400">{item.rank}</Text>
      </View>

      {/* 2. Info: Avatar, Name, Price */}
      <View className="mb-4 flex-row items-center">
        {/* Avatar */}
        <View
          className={`${item.avatarColor} mr-3 h-12 w-12 items-center justify-center rounded-full`}>
          <Text className="text-lg font-bold text-white">{item.initial}</Text>
        </View>

        {/* Detail */}
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800">{item.name}</Text>
          <Text className="text-xs text-slate-500">{item.service}</Text>
        </View>

        {/* Price */}
        <Text className="text-base font-bold text-blue-600">{item.price}</Text>
      </View>

      {/* 3. Time & Address Lines */}
      <View className="mb-4 gap-2">
        {/* Date line */}
        <View className="flex-row items-center">
          <View className="w-1/2 flex-row items-center">
            <Calendar size={14} color="#64748b" className="mr-1.5" />
            <Text className="text-xs text-slate-600">{item.date}</Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#64748b" className="mr-1.5" />
            <Text className="text-xs text-slate-600">{item.time}</Text>
          </View>
        </View>

        {/* Address line */}
        <View className="flex-row items-start">
          <MapPin size={14} color="#64748b" className="mr-1.5 mt-0.5" />
          <Text className="flex-1 text-xs text-slate-600" numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* 4. Action Buttons (3 nút dưới cùng) */}
      <View className="flex-row gap-2">
        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
          <Text className="text-xs font-bold text-slate-600">Ghi chú</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-[#1d4ed8] py-2">
          <Text className="text-xs font-bold text-white">Gọi điện</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-emerald-500 py-2">
          <Text className="text-xs font-bold text-white">Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <GradientBackground
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 24,
          zIndex: 10,
        }}
        className="z-10 px-4 pb-6 shadow-sm">
        <Text className="mb-1 mt-2 font-inter-bold text-xl text-white">
          {t('header_app.title_orders')}
        </Text>
        <Text className="mb-4 font-inter-medium text-xs text-blue-100">
          {t('header_app.orders_description')}
        </Text>

        {/* --- FILTER BAR --- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {Object.values(_BookingStatusMap).map((value, index) => {
            return (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center rounded-full border px-4 py-1.5 ${
                  false ? 'border-white bg-white' : 'border-blue-400/30 bg-blue-800/30'
                }`}>
                <Text
                  className={`text-xs font-medium ${false ? 'text-blue-700' : 'text-blue-100'}`}>
                  {t(value)}
                </Text>
                {/*{filter.count && (*/}
                {/*  <View*/}
                {/*    className={`ml-1 rounded-full px-1.5 py-0.5 ${*/}
                {/*      isActive ? 'bg-blue-100' : 'bg-blue-700'*/}
                {/*    }`}>*/}
                {/*    <Text*/}
                {/*      className={`text-[9px] font-bold ${*/}
                {/*        isActive ? 'text-blue-700' : 'text-white'*/}
                {/*      }`}>*/}
                {/*      {filter.count}*/}
                {/*    </Text>*/}
                {/*  </View>*/}
                {/*)}*/}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </GradientBackground>

      {/* --- BODY --- */}
      <View className="mt-4 flex-1 px-4">
        {/* Sub-header info */}
        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="mb-1 text-xs font-bold text-blue-600">6 khách hàng</Text>
            <Text className="text-base font-bold text-slate-800">Lịch hẹn sắp tới</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-xs font-medium text-blue-600">Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={CUSTOMERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CustomerCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </View>
  );
}
