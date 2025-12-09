import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import {HeaderApp} from '@/components/header-app';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { useTranslation } from 'react-i18next';
import { KTVServiceCard } from '@/components/app/ktv-card';


export default function MasseursScreen() {
  const {t} = useTranslation();

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetListKTV({
    filter: {},
    page: 1,
    per_page: 5,
  });


  return (
    <View className="flex-1 bg-base-color-3">

      {/* --- HEADER --- */}
      <HeaderApp />

      {/* --- CONTENT --- */}
      <FlatList
        keyExtractor={(item, index) => `package-${item.id}-${index}`}
        data={data}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
          position: 'relative',
        }}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 100,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={null}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <View className="flex-row items-center gap-1 mb-4">
            <Text className="text-blue-600 font-inter-bold">{pagination?.meta?.total || 0}</Text>
            <Text className="text-slate-500 text-sm font-inter-medium">
              {t('services.total_masseurs')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        renderItem={({ item }) => <KTVServiceCard item={item} key={item.id} />}
        ListEmptyComponent={<Empty />}
      />
    </View>
  );
}

// const FilterBar = () => {
//   return (
//     <View className="bg-[#1d4ed8] pb-6 rounded-b-3xl -mt-4 z-10 pt-4">
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
//       >
//         {FILTERS.map((filter) => {
//           const isActive = activeFilter === filter.id;
//           return (
//             <TouchableOpacity
//               key={filter.id}
//               onPress={() => setActiveFilter(filter.id)}
//               className={`flex-row items-center rounded-full px-4 py-1.5 border ${
//                 isActive
//                   ? 'bg-white border-white'
//                   : 'bg-blue-800/30 border-blue-400/30'
//               }`}
//             >
//               <Text
//                 className={`text-xs font-medium ${
//                   isActive ? 'text-blue-700' : 'text-blue-100'
//                 }`}
//               >
//                 {filter.label}
//               </Text>
//               {filter.count && (
//                 <View className={`ml-1 rounded-full px-1.5 py-0.5 ${
//                   isActive ? 'bg-blue-100' : 'bg-blue-700'
//                 }`}>
//                   <Text className={`text-[9px] font-bold ${
//                     isActive ? 'text-blue-700' : 'text-white'
//                   }`}>
//                     {filter.count}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>
//     </View>
//   )
// }
