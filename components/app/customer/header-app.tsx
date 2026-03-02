import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { useApplicationStore } from '@/features/app/stores';
import DefaultColor from '@/components/styles/color';
import { ListLocationModal } from '@/components/app/location';
import { Search, X } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

type HeaderAppProps = {
  showSearch?: boolean;
  forSearch?: 'service' | 'massage';
  setTextSearch?: (text: string) => void;
  textSearch?: string;
};


export const HeaderApp = ({
                            showSearch = false,
                            forSearch,
                            setTextSearch,
                            textSearch,
                          }: HeaderAppProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const redirectAuth = useCheckAuthToRedirect();

  const locationUser = useApplicationStore((state) => state.location);

  return (
   <>
     <View className="bg-white px-4 pb-4  shadow-sm shadow-slate-200" style={{ paddingTop: insets.top + 10 }}>
       {/* === VỊ TRÍ & THÔNG BÁO === */}
       <View className="flex-row items-center justify-between mb-4 gap-2">
         {/* Nút Vị Trí */}
         <Pressable
           className="flex-row items-center flex-1"
           onPress={() => {
             redirectAuth(() => setShowLocationModal(true));
           }}
         >
           <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
             <Ionicons name="location" size={20} color={DefaultColor.base['primary-color-2']} />
           </View>
           <View className="ml-3 flex-1">
             <Text className="text-[11px] text-gray-400 font-inter-medium">
               {t('header_app.location')}
             </Text>
             <View className="flex-row items-center">
               <View className="flex-shrink">
                 <Text
                   className="text-[14px] font-inter-bold text-slate-900 mr-1"
                   numberOfLines={1}
                   ellipsizeMode="tail"
                 >
                   {locationUser?.address || t('header_app.need_location')}
                 </Text>
               </View>
               <Feather name="chevron-down" size={16} color={DefaultColor.base['primary-color-2']} />
             </View>
           </View>
         </Pressable>

         {/* Nút Thông Báo */}
         <TouchableOpacity
           onPress={() => {
             redirectAuth('/(app)/(notification)/notification');
           }}
           className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 relative"
         >
           <Ionicons name="notifications-outline" size={22} color={DefaultColor.base['primary-color-2']} />
         </TouchableOpacity>
       </View>
       {/* === PHẦN 2: THANH TÌM KIẾM (SEARCH BAR) === */}
       {showSearch && (
         <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 h-12">
           {/* Icon Search bên trái */}
           <Feather name="search" size={18} color={DefaultColor.slate['400']} />
           {/* Input nhập liệu */}
           <TextInput
             className="flex-1 ml-3 font-inter-medium text-[14px] text-slate-900"
             placeholder={
               forSearch === 'service'
                 ? t('header_app.search_placeholder_service')
                 : t('header_app.search_placeholder_massage')
             }
             placeholderTextColor={DefaultColor.slate['400']}
             value={textSearch}
             onChangeText={setTextSearch}
             returnKeyType="search"
             autoCapitalize="none"
             autoCorrect={false}
           />
           <View className="h-5 w-[1px] bg-slate-200 mx-2" />
         </View>
       )}
     </View>
     <ListLocationModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
   </>
  );
};