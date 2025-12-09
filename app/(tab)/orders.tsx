import { HeaderAppOrder } from '@/components/header-app';

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
import { Calendar, Clock, MapPin, Phone, FileText, Info } from 'lucide-react-native';


import { View, Text, TextInput, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';



const CustomerCard = ({ item }: { item: any }) => {
  // Logic màu sắc cho Tag
  const getTagStyle = (type: string) => {
    switch (type) {
      case 'VIP': return { bg: 'bg-orange-400', text: 'text-white', label: 'VIP' };
      case 'REGULAR': return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Thường xuyên' };
      case 'NEW': return { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Mới' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Khách' };
    }
  };

  const tagStyle = getTagStyle(item.type);

  return (
    <View className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">

      {/* 1. Header Card: Tag & Rank */}
      <View className="flex-row items-center justify-between mb-3">
        <View className={`${tagStyle.bg} px-3 py-1 rounded-full`}>
          <Text className={`${tagStyle.text} text-[10px] font-bold`}>{tagStyle.label}</Text>
        </View>
        <Text className="text-slate-400 text-xs font-bold">{item.rank}</Text>
      </View>

      {/* 2. Info: Avatar, Name, Price */}
      <View className="flex-row items-center mb-4">
        {/* Avatar */}
        <View className={`${item.avatarColor} h-12 w-12 rounded-full items-center justify-center mr-3`}>
          <Text className="text-white font-bold text-lg">{item.initial}</Text>
        </View>

        {/* Detail */}
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-base">{item.name}</Text>
          <Text className="text-slate-500 text-xs">{item.service}</Text>
        </View>

        {/* Price */}
        <Text className="text-blue-600 font-bold text-base">{item.price}</Text>
      </View>

      {/* 3. Time & Address Lines */}
      <View className="mb-4 gap-2">
        {/* Date line */}
        <View className="flex-row items-center">
          <View className="flex-row items-center w-1/2">
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
          <Text className="text-xs text-slate-600 flex-1" numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* 4. Action Buttons (3 nút dưới cùng) */}
      <View className="flex-row gap-2">
        <TouchableOpacity className="flex-1 bg-slate-100 py-2 rounded-lg items-center justify-center">
          <Text className="text-slate-600 text-xs font-bold">Ghi chú</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-[#1d4ed8] py-2 rounded-lg items-center justify-center">
          <Text className="text-white text-xs font-bold">Gọi điện</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-emerald-500 py-2 rounded-lg items-center justify-center">
          <Text className="text-white text-xs font-bold">Chi tiết</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default function OrdersScreen() {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <HeaderAppOrder />
      {/*/!* --- HEADER --- *!/*/}
      {/*<View*/}
      {/*  style={{ paddingTop: insets.top }}*/}
      {/*  className="bg-[#1d4ed8] px-4 pb-6 rounded-b-3xl z-10"*/}
      {/*>*/}
      {/*  <Text className="text-white text-xl font-bold mb-1 mt-2">Danh sách khách hàng</Text>*/}
      {/*  <Text className="text-blue-100 text-xs mb-4">Quản lý thông tin khách hàng của bạn</Text>*/}

      {/*  /!* Search Bar *!/*/}
      {/*</View>*/}

      {/* --- BODY --- */}
      <View className="flex-1 px-4 mt-4">

        {/* Sub-header info */}
        <View className="flex-row justify-between items-end mb-2">
          <View>
            <Text className="text-blue-600 text-xs font-bold mb-1">6 khách hàng</Text>
            <Text className="text-slate-800 text-base font-bold">Lịch hẹn sắp tới</Text>
          </View>
          <TouchableOpacity>
            <Text className="text-blue-600 text-xs font-medium">Xem tất cả</Text>
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