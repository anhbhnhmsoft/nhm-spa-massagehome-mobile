import React, { FC } from 'react';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TFunction } from 'i18next';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import { useReview } from '@/features/service/hooks';
import { StarRatingInput } from '@/components/star-rating';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import {
  View,  TouchableOpacity,
  Switch, ActivityIndicator,
} from 'react-native';

type Props = {
  ref: React.Ref<BottomSheetModal>,
  t: TFunction,
  loading: boolean,
  handleClose: ReturnType<typeof useReview>['handleClose'],
  form: ReturnType<typeof useReview>['form'],
  onSubmit: ReturnType<typeof useReview>['onSubmit'],
}

export const ReviewServiceBottomSheet: FC<Props> = ({ ref, t, loading, handleClose, form, onSubmit }) => {

  const { control, handleSubmit, formState: { errors } } = form;

  return (
    <AppBottomSheet
      ref={ref}
      dynamicSizing={true}
      onDismiss={() => {
        handleClose();
      }}
    >
      <View className="bg-white rounded-3xl p-6 pb-24 shadow-xl">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-inter-bold text-gray-900">{t('services.review.title')}</Text>
        </View>

        {/* Rating Stars */}
        <Controller
          control={control}
          name="rating"
          render={({ field: { onChange, value } }) => (
            <StarRatingInput rating={value} onRatingChange={(val) => onChange(val)} />
          )}
        />

        {/* Comment Input */}
        <View className="mb-4">
          <Controller
            control={control}
            name="comment"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                placeholder={t('services.review.comment')}
                placeholderTextColor="#94A3B8"
                multiline
                onBlur={onBlur}
                numberOfLines={4}
                value={value}
                onChangeText={onChange}
                textAlignVertical="top"
                className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-5 font-inter-medium text-slate-800"
                style={{ fontSize: 16, includeFontPadding: false }}
              />

            )}
          />
          {errors.comment && <Text className="text-red-500 text-xs mt-1">{errors.comment.message}</Text>}
        </View>

        {/* Hidden Option (Ẩn danh) */}
        <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-xl mb-6">
          <View>
            <Text className="font-inter-semibold text-gray-800">{t('services.review.hidden')}</Text>
            <Text className="text-gray-500 text-xs">{t('services.review.hidden_description')}</Text>
          </View>
          <Controller
            control={control}
            name="hidden"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: DefaultColor.base['base-color-3'], true: DefaultColor.base['primary-color-2'] }}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className={cn(
            'py-4 rounded-2xl items-center',
            loading ? 'bg-gray-300' : 'bg-primary-color-2',
          )}
        >
          {loading ? (
            <ActivityIndicator color={DefaultColor.white} />
          ) : (
            <Text className="text-white font-inter-bold text-lg">{t('services.review.submit')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </AppBottomSheet>
  );
};