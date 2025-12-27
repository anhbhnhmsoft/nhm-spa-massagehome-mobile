import { TouchableOpacity, View } from 'react-native';
import { ArrowRight, Check, Pause, Pencil, Star, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ServiceItem } from '@/features/service/types';
import {Text} from "@/components/ui/text";
import {Image} from "expo-image";
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import { useSetService } from '@/features/ktv/hooks';


export const ServiceCard = ({ item, onEdit, onDelete, onDetail }: {
  item: ServiceItem;
  onEdit: ReturnType<typeof useSetService>['editService'];
  onDelete: ReturnType<typeof useSetService>['deleteService'];
  onDetail: ReturnType<typeof useSetService>['detailService'];
}) => {
  const {t} = useTranslation();
  return (
    <TouchableOpacity
      className="flex-row rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
      onPress={() => onDetail(item.id)}
    >
      {/* 1. Left: Image & Status Badge */}
      <View className="relative mr-3">
        <Image
          source={{ uri: item.image_url || '' }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: DefaultColor.gray[200]
          }}
          contentFit="cover"
        />
        {/* Status Badge */}
        <View className="absolute -left-1 -top-1 rounded-full border-2 border-white bg-white">
          {!item.is_active ? (
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
        {/* Header: Title & Actions */}
        <View className="flex-row items-start justify-between">
          <Text className="mr-2 flex-1 text-base font-inter-bold text-gray-800" numberOfLines={2}>
            {item.name}
          </Text>

          <View className="flex-row gap-2">
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => onEdit(item.id)}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Pencil size={14} color={DefaultColor.gray[600]} />
            </TouchableOpacity>
            {/* Delete Button */}
            {item.bookings_count === 0 && (
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                className="h-8 w-8 items-center justify-center rounded-full bg-transparent">
                <Trash2 size={16} color={DefaultColor.gray[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Booking Count */}
        <Text className="text-xs text-gray-500">{item.bookings_count} {t('ktv.services.bookings_count')}</Text>

        {/* Footer: Rating & Link */}
        <View className="mt-1 flex-row items-center justify-between">
          {/* Rating Area */}
          <View className="flex-row items-center gap-1">
            <Star
              size={10}
              color={item.avg_rating > 0 ? DefaultColor.yellow[400] : DefaultColor.gray[400]}
              fill={item.avg_rating > 0 ? DefaultColor.yellow[400] : 'transparent'}
            />
            <Text className="text-xs font-inter-medium text-gray-600">
              {item.avg_rating > 0 ? item.avg_rating : '-'} ({item.avg_rating || 0})
            </Text>
          </View>

          {/* View Review Link */}
          <TouchableOpacity className="flex-row items-center gap-0.5">
            <Text className="text-xs font-inter-medium text-primary-color-2">{t('ktv.services.see_reviews')}</Text>
            <ArrowRight size={12} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};