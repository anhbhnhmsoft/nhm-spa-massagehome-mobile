import { TouchableOpacity, View } from 'react-native';
import {  Check, Pause } from 'lucide-react-native';
import React from 'react';
import {Text} from "@/components/ui/text";
import {Image} from "expo-image";
import { useTranslation } from 'react-i18next';
import { CategoryServiceItem } from '@/features/ktv/types';


export const ServiceCard = ({ item, onDetail }: {
  item: CategoryServiceItem;
  onDetail: (item: CategoryServiceItem) => void;
}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      className="flex-row rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
      onPress={() => onDetail(item)}
    >
      {/* 1. Left: Image & Status Badge */}
      <View className="relative mr-3">
        <Image
          source={{ uri: item.image_url || '' }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: '#E5E7EB' // DefaultColor.gray[200]
          }}
          contentFit="cover"
        />
        {/* Status Badge */}
        <View className="absolute -left-1 -top-1 rounded-full border-2 border-white">
          {!item.is_registered ? (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-slate-400">
              <Pause size={10} color="white" fill="white" />
            </View>
          ) : (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <Check size={12} color="white" strokeWidth={4} />
            </View>
          )}
        </View>
      </View>

      {/* 2. Right: Content */}
      <View className="flex-1 justify-between py-0.5">
        <View>
          {/* Header: Title */}
          <View className="flex-row items-start justify-between">
            <Text className="mr-2 flex-1 text-base font-inter-bold text-gray-800" numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {/* Description: Thêm vào đây */}
          <Text
            className="mt-1 text-xs font-inter-medium text-gray-500"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};