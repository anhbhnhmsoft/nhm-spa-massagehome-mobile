import React from 'react';
import {
  Modal, View,  TextInput, TouchableOpacity,
  Switch, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { X } from 'lucide-react-native';
import { StarRatingInput } from '@/components/star-rating';
import { useReviewModal } from '@/features/service/hooks';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import DefaultColor from '@/components/styles/color';
import {Text} from '@/components/ui/text';
import { useTranslation } from 'react-i18next';


interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serviceBookingId: string;
}

export const ReviewModal = ({ isVisible, onClose, onSuccess, serviceBookingId }: ReviewModalProps) => {
  const {t} = useTranslation();
  const { form, onSubmit, loading } = useReviewModal(serviceBookingId, onSuccess);
  const { control, handleSubmit, formState: { errors } } = form;


  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-inter-bold text-gray-900">{t('services.review.title')}</Text>
              <TouchableOpacity onPress={onClose}><X size={24} color={DefaultColor.gray['900']} /></TouchableOpacity>
            </View>

            {/* Rating Stars */}
            <Text className="text-center font-inter-medium text-gray-700 mb-2">{t('services.review.rating')}</Text>
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
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 min-h-[100px]"
                    placeholder={t('services.review.comment')}
                    multiline
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    textAlignVertical="top"
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
                loading ? 'bg-gray-300' : 'bg-primary-color-2'
              )}
            >
              {loading ? (
                <ActivityIndicator color={DefaultColor.white} />
              ) : (
                <Text className="text-white font-inter-bold text-lg">{t('services.review.submit')}</Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
