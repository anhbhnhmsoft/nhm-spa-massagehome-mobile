import React, { useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { HeaderApp, HeaderAppKTV } from '@/components/header-app';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar'; // Nhớ import đúng đường dẫn
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard, { CategorySkeletonCard } from '@/components/app/category-card';
import { Text } from '@/components/ui/text';
import useDebounce from '@/features/app/hooks/use-debounce';
import { ServiceItem } from '@/features/service/types';
import { MyServiceCard } from '@/components/app/service-card';

export const MASSAGE_SERVICE_MOCK: ServiceItem[] = [
  {
    id: 'ms-001',
    name: 'Massage toàn thân Thái',
    category_id: 'massage',
    bookings_count: 320,
    is_active: false,
    image_url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35',
    description: 'Massage truyền thống Thái giúp thư giãn cơ thể và giảm căng thẳng',
    category: {
      id: 'massage',
      name: 'Massage & Spa',
    },
    provider: {
      id: 'spa-01',
      name: 'Thai Relax Spa',
    },
    options: [
      {
        id: 'opt-ms-001',
        price: '350000',
        duration: 60,
      },
      {
        id: 'opt-ms-002',
        price: '500000',
        duration: 90,
      },
    ],
  },
  {
    id: 'ms-002',
    name: 'Massage đá nóng',
    category_id: 'massage',
    bookings_count: 280,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1556228724-4c4c8c1c3b73',
    description: 'Sử dụng đá nóng giúp lưu thông khí huyết và thư giãn sâu',
    category: {
      id: 'massage',
      name: 'Massage & Spa',
    },
    provider: {
      id: 'spa-02',
      name: 'Golden Lotus Spa',
    },
    options: [
      {
        id: 'opt-ms-003',
        price: '400000',
        duration: 60,
      },
    ],
  },
  {
    id: 'ms-003',
    name: 'Massage cổ vai gáy',
    category_id: 'massage',
    bookings_count: 410,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1629909615184-74f495363b67',
    description: 'Giảm đau mỏi cổ vai gáy cho dân văn phòng',
    category: {
      id: 'massage',
      name: 'Massage trị liệu',
    },
    provider: {
      id: 'spa-03',
      name: 'Heal Care Spa',
    },
    options: [
      {
        id: 'opt-ms-004',
        price: '180000',
        duration: 30,
      },
      {
        id: 'opt-ms-005',
        price: '280000',
        duration: 45,
      },
    ],
  },
  {
    id: 'ms-004',
    name: 'Massage tinh dầu thư giãn',
    category_id: 'massage',
    bookings_count: 365,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
    description: 'Massage với tinh dầu thiên nhiên giúp thư giãn tinh thần',
    category: {
      id: 'massage',
      name: 'Massage thư giãn',
    },
    provider: {
      id: 'spa-04',
      name: 'Zen Spa',
    },
    options: [
      {
        id: 'opt-ms-006',
        price: '300000',
        duration: 60,
      },
      {
        id: 'opt-ms-007',
        price: '450000',
        duration: 90,
      },
    ],
  },
  {
    id: 'ms-005',
    name: 'Massage chân & bấm huyệt',
    category_id: 'massage',
    bookings_count: 290,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c',
    description: 'Bấm huyệt chân giúp lưu thông khí huyết và ngủ ngon hơn',
    category: {
      id: 'massage',
      name: 'Massage trị liệu',
    },
    provider: {
      id: 'spa-05',
      name: 'Foot Care Spa',
    },
    options: [
      {
        id: 'opt-ms-008',
        price: '200000',
        duration: 40,
      },
    ],
  },
];

export default function ServicesScreen() {
  const { t } = useTranslation();
  // 1. State lưu text hiển thị trên Header (để input không bị lag/giật)
  const [keyword, setKeyword] = useState('');
  // 2. Lấy danh sách category với hook
  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    setFilter,
  } = useGetCategoryList({
    page: 1,
    per_page: 10,
  });

  const debouncedSearch = useDebounce(
    (text: string) => {
      setFilter({ keyword: text });
    },
    500,
    []
  );

  return (
    <View className="flex-1 bg-base-color-3">
      <FocusAwareStatusBar />

      {/* --- HEADER --- */}
      <HeaderAppKTV
        showSearch={true}
        forSearch={'service'}
        textSearch={keyword}
        setTextSearch={(text: string) => {
          // Cập nhật state UI ngay lập tức (để người dùng thấy chữ mình gõ)
          setKeyword(text);
          // Gọi hàm debounce để set filter sau 500ms (không gọi liên tục khi người dùng gõ)
          if (text && text.length > 2) {
            debouncedSearch(text);
          }
          if (text.trim().length === 0) {
            setFilter({ keyword: '' });
          }
        }}
      />

      {/* --- CONTENT --- */}
      <View className="flex-1 p-4">
        {isLoading || isRefetching ? (
          Array.from({ length: 6 }).map((_, index) => (
            <CategorySkeletonCard key={`package-skeleton-${index}`} />
          ))
        ) : (
          <FlatList
            keyExtractor={(item, index) => `package-${item.id}-${index}`}
            data={MASSAGE_SERVICE_MOCK}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{
              flex: 1,
              position: 'relative',
            }}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 100,
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={null}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListHeaderComponent={
              <View className="mb-4 flex-row items-center gap-1">
                <Text className="font-inter-bold text-blue-600">
                  {pagination?.meta?.total || 0}
                </Text>
                <Text className="font-inter-medium text-sm text-slate-500">
                  {t('services.total_services')}
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            renderItem={({ item }) => <MyServiceCard item={item} key={item.id} />}
            ListEmptyComponent={<Empty />}
          />
        )}
      </View>
    </View>
  );
}
