import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Gift,
  History,
  List,
  Globe,
  User,
  Info,
  LogOut,
} from 'lucide-react-native';
import GradientBackground from '@/components/styles/gradient-background'; // Hàm format tiền

const APPOINTMENTS = [
  {
    id: '1',
    rank: '#1',
    service: 'Massage Chân',
    technician: 'Trần Thị B',
    price: '350,000đ',
    date: '20/11/2024',
    time: '14:00 (60 phút)',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '2',
    rank: '#2',
    service: 'Massage Toàn thân',
    technician: 'Trần Thị B',
    price: '500,000đ',
    date: '22/11/2024',
    time: '10:00 (90 phút)',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    image: 'https://i.pravatar.cc/150?img=9',
  },
];

const AppointmentCard = ({ item }: { item: any }) => {
  return (
    <View className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      {/* Header: Tag + Rank */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="rounded-full bg-yellow-100 px-3 py-1">
          <Text className="text-[10px] font-bold text-yellow-700">Chờ xác nhận</Text>
        </View>
        <Text className="text-xs font-bold text-slate-400">{item.rank}</Text>
      </View>

      {/* Info */}
      <View className="mb-4 flex-row items-center">
        <Image source={{ uri: item.image }} className="mr-3 h-12 w-12 rounded-full bg-slate-200" />
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800">{item.service}</Text>
          <Text className="text-xs text-slate-500">{item.technician}</Text>
        </View>
        <Text className="text-base font-bold text-blue-600">{item.price}</Text>
      </View>

      {/* Time & Address */}
      <View className="mb-4 gap-2">
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
        <View className="flex-row items-start">
          <MapPin size={14} color="#64748b" className="mr-1.5 mt-0.5" />
          <Text className="flex-1 text-xs text-slate-600" numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* Buttons: Hủy, Tạm hoãn, Xác nhận */}
      <View className="flex-row gap-2">
        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
          <Text className="text-xs font-bold text-slate-600">Hủy lịch</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-yellow-400 py-2">
          <Text className="text-xs font-bold text-slate-900">Tạm hoãn</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center justify-center rounded-lg bg-emerald-500 py-2">
          <Text className="text-xs font-bold text-white">Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MenuItem = ({ icon: Icon, title, rightElement, isLast }: any) => (
  <TouchableOpacity
    className={`flex-row items-center py-4 ${!isLast ? 'border-b border-slate-50' : ''}`}>
    {/* Icon bên trái có nền xám tròn */}
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-slate-100">
      <Icon size={18} color="#475569" />
    </View>

    <Text className="flex-1 text-sm font-semibold text-slate-700">{title}</Text>

    {/* Phần bên phải (cờ, text...) */}
    {rightElement && <View className="mr-2">{rightElement}</View>}

    <ChevronRight size={18} color="#cbd5e1" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-base-color-3">
      <StatusBar barStyle="light-content" />

      {/* 1. Header Background Màu Xanh */}
      <GradientBackground className="absolute left-0 top-0 z-0 h-48 w-full" direction="horizontal" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Spacer để đẩy nội dung xuống dưới Statusbar */}
        <View className="h-16" />

        {/* 2. PROFILE CARD (Đè lên nền xanh) */}
        <View className="mx-4 mb-6 rounded-2xl bg-white p-4 shadow-sm">
          {/* User Info */}
          <View className="mb-4 flex-row items-center">
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              className="mr-3 h-14 w-14 rounded-full bg-slate-200"
            />
            <View>
              <Text className="text-lg font-bold text-slate-800">123 456 7899</Text>
              <Text className="text-sm text-slate-500">Nguyễn Văn A</Text>
            </View>
          </View>

          {/* Banner Đăng ký KTV (Màu Cam) */}
          <TouchableOpacity className="mb-3 flex-row items-center justify-between rounded-xl bg-orange-500 p-3">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-white p-1">
                <Star size={14} color="#f97316" fill="#f97316" />
              </View>
              <Text className="text-sm font-bold text-white">Đăng ký trở thành KTV</Text>
            </View>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>

          {/* Banner Giới thiệu (Màu Xám Xanh) */}
          <TouchableOpacity className="flex-row items-center justify-between rounded-xl bg-slate-100 p-3">
            <View className="mr-2 flex-1 flex-row items-center gap-2">
              <View className="rounded-lg bg-[#1d4ed8] p-1.5">
                <Gift size={14} color="white" />
              </View>
              <Text className="flex-1 text-[11px] font-medium leading-4 text-slate-600">
                Nhận 30% hoàn tiền từ đơn thành công đầu tiên của người được giới thiệu
              </Text>
            </View>
            <ChevronRight size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 3. LỊCH HẸN SẮP TỚI */}
        <View className="mb-6 px-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-800">Lịch hẹn sắp tới</Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-blue-600">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {APPOINTMENTS.map((item) => (
            <AppointmentCard key={item.id} item={item} />
          ))}
        </View>

        {/* 4. MENU LIST */}
        <View className="mx-4 mb-6 rounded-2xl bg-white px-4 py-2 shadow-sm">
          <MenuItem icon={History} title="Lịch sử hoạt động" />
          <MenuItem icon={List} title="Danh sách khách hàng" />

          <MenuItem
            icon={Globe}
            title="Ngôn ngữ"
            rightElement={
              <View className="flex-row items-center gap-1">
                {/* Cờ giả lập bằng View tròn đỏ, thực tế dùng ảnh */}
                <View className="h-4 w-4 items-center justify-center rounded-full bg-red-600">
                  <View className="h-1.5 w-1.5 bg-yellow-400" />
                </View>
                <Text className="text-xs text-slate-500">Tiếng Việt</Text>
              </View>
            }
          />

          <MenuItem icon={User} title="Thông tin cá nhân" />
          <MenuItem icon={Info} title="Thông tin về ứng dụng" />
          <MenuItem icon={LogOut} title="Đăng xuất" isLast />
        </View>

        {/* Footer Version */}
        <Text className="mb-6 text-center text-xs text-slate-400">Phiên bản 1.0.0</Text>
      </ScrollView>
    </View>
  );
}
