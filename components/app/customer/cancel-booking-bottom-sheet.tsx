import React, { FC, useState } from 'react';
import {
  Keyboard,
  Text,
  TouchableOpacity, TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TFunction } from 'i18next';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import { cn } from '@/lib/utils';

type Props = {
  ref: React.Ref<BottomSheetModal>,
  onDismiss: () => void,
  t: TFunction,
  handleSubmit: (reason: string) => void,
  loading: boolean,
}

export const CancelBookingBottomSheet: FC<Props> = ({ ref, onDismiss, t, handleSubmit, loading }) => {
  const [reason, setReason] = useState('');

  return (
    <AppBottomSheet
      ref={ref}
      dynamicSizing={true}
      onDismiss={() =>{
        setReason('');
        onDismiss();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="w-full p-8 pb-12">

          {/* Header: Icon & Text */}
          <View className="mb-6 mt-4 items-center">
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50">
              <AlertCircle color="#EF4444" size={32} />
            </View>
            <Text className="text-center font-inter-bold text-2xl text-slate-900">
              {t('booking.cancel_reasons')}
            </Text>
            <Text className="mt-2 px-6 text-center font-inter-regular leading-5 text-slate-500">
              {t('booking.cancel_pending_note')}
            </Text>
          </View>

          {/* Input Area */}
          <View className="mb-8">
            <BottomSheetTextInput
              placeholder={t('booking.enter_cancel_reason')}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
              className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-5 font-inter-medium text-slate-800"
              style={{ fontSize: 16, includeFontPadding: false }}
            />
          </View>

          {/* Action Buttons */}
          <View className="mb-4 flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleSubmit(reason)}
              disabled={loading || reason.trim().length === 0}
              activeOpacity={0.8}
              className={cn(`flex-1 items-center justify-center rounded-2xl border py-4`,
                reason.trim().length === 0
                  ? 'border-slate-200 bg-slate-200'
                  : 'border-red-600 bg-red-500',
              )}>
              <Text className="font-inter-bold text-base text-white">
                {loading ? t('common.loading') : t('booking.confirm_cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </AppBottomSheet>
  );
};