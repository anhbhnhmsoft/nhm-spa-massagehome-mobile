import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Circle,
  ArrowDown,
  Zap,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { _PAYMENT_METHODS, _PaymentType, _QUICK_AMOUNTS } from '@/features/payment/consts';
import { cn, formatBalance } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useDeposit } from '@/features/payment/hooks';
import { Controller } from 'react-hook-form';
import { CheckQRPaymentModal } from '@/components/app/payment';
import HeaderBack from '@/components/header-back';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

// --- CONFIG TỶ GIÁ & DATA ---

export default function DepositScreen() {
  const { t } = useTranslation();

  const { configPayment, form, submitDeposit } = useDeposit();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Watch giá trị để update giao diện (đổi màu border, tính point...)
  const watchedAmount = watch('amount');
  const watchedPayment = watch('payment_type');

  // Logic tính toán quy đổi
  const receivedPoints = Math.floor(
    Number(watchedAmount) / Number(configPayment?.currency_exchange_rate)
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        {/* --- HEADER --- */}
        <HeaderBack title={'payment.deposit_title'} />

        {/* --- SCROLL VIEW --- */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          enableOnAndroid={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-5 pt-2">
            {/* --- KHỐI NHẬP TIỀN  --- */}
            <View className="z-10 rounded-2xl bg-white p-5 shadow-sm">
              <Text className="mb-3 font-inter-medium text-gray-500">
                {t('payment.deposit_label_input')}
              </Text>

              <View className="mb-4 flex-row items-center border-b border-gray-100 pb-2">
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value } }) => (
                    <View
                      className={cn(
                        'flex-row items-center border-b pb-2',
                        errors.amount ? 'border-red-500' : 'border-gray-200'
                      )}>
                      <TextInput
                        className="flex-1 text-3xl font-bold text-gray-900"
                        placeholder="0"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                      <Text className="font-inter-bold text-xl text-gray-400">đ</Text>
                    </View>
                  )}
                />
                {/* Hiển thị lỗi Amount */}
                {errors.amount && (
                  <Text className="mt-2 text-xs text-red-500">{errors.amount.message}</Text>
                )}
              </View>

              {/* --- NÚT NHẬP SỐ TIỀN CÓ SẴN --- */}
              <View className="flex-row flex-wrap gap-2">
                {_QUICK_AMOUNTS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setValue('amount', item.toString())}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                    <Text className="font-inter-medium text-xs text-gray-600">
                      {formatBalance(item)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* --- MŨI TÊN LIÊN KẾT --- */}
            <View className="relative z-20 -my-4 items-center">
              <View className="rounded-full bg-blue-200 p-1.5">
                <View className="rounded-full bg-white p-1.5 shadow-sm">
                  <ArrowDown size={20} color="#2B7BBE" strokeWidth={2.5} />
                </View>
              </View>
            </View>

            {/* --- KHỐI QUY ĐỔI (OUTPUT) --- */}
            <View className="mb-8 rounded-2xl bg-primary-color-2 p-5 pt-8 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="mb-1 font-medium text-green-100">
                    {t('payment.received_points')}
                  </Text>
                  <View className="flex-row items-baseline gap-2">
                    <Text className="font-inter-bold text-4xl text-white">
                      {formatBalance(receivedPoints)}
                    </Text>
                    <Text className="font-inter-bold text-lg text-green-200">
                      {t('common.currency')}
                    </Text>
                  </View>
                </View>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Zap size={20} color="white" fill="white" />
                </View>
              </View>
              <Text className="mt-2 rounded bg-black/10 py-1 text-center text-xs text-green-100/60">
                {formatBalance(configPayment?.currency_exchange_rate)}đ = 1 {t('common.currency')}
              </Text>
            </View>

            {/* --- 3. PHƯƠNG THỨC THANH TOÁN --- */}
            <Text className="mb-4 font-inter-bold text-lg text-gray-900">
              {t('payment.payment_methods')}
            </Text>
            <Controller
              control={control}
              name="payment_type"
              render={({ field: { onChange, value } }) => (
                <View className="mb-24 gap-3">
                  {_PAYMENT_METHODS.map((method, index) => {
                    const isSelected = value === method.id;

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => onChange(method.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.methodContainer,
                          isSelected ? styles.methodSelected : styles.methodUnselected,
                        ]}>
                        {/* ICON AREA */}
                        <View
                          style={[
                            styles.iconContainer,
                            isSelected ? styles.iconBgSelected : styles.iconBgUnselected,
                          ]}>
                          {method.id === _PaymentType.QR_BANKING && (
                            <QrCode size={24} color={isSelected ? 'white' : '#6B7280'} />
                          )}
                          {method.id === _PaymentType.ZALO_PAY && (
                            <Image
                              source={require('@/assets/icon/zalopay.jpeg')}
                              style={{ width: 24, height: 24, borderRadius: 12 }}
                            />
                          )}
                          {method.id === _PaymentType.MOMO_PAY && (
                            <Image
                              source={require('@/assets/icon/momopay.png')}
                              style={{ width: 24, height: 24, borderRadius: 12 }}
                            />
                          )}
                        </View>

                        {/* TEXT AREA */}
                        <View style={styles.textContainer}>
                          <View style={styles.row}>
                            <Text
                              style={[
                                styles.methodTitle,
                                isSelected ? styles.textSelected : styles.textUnselected,
                              ]}>
                              {t(method.name)}
                            </Text>
                          </View>
                          <Text style={styles.methodDesc}>{t(method.desc)}</Text>
                        </View>

                        {/* CHECKBOX AREA */}
                        {isSelected ? (
                          <CheckCircle2 size={22} color={COLORS.primary} />
                        ) : (
                          <Circle size={22} color="#D1D5DB" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {errors.payment_type && (
                    <Text className="mt-2 text-red-500">{errors.payment_type.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* --- BOTTOM BUTTON --- */}
          <View className="absolute bottom-0 w-full border-t border-gray-100 bg-white p-5 shadow-lg">
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-gray-500">{t('payment.total_payment')}:</Text>
              <Text className="font-inter-bold text-lg text-gray-900">
                {watchedAmount ? formatBalance(watchedAmount) : '0'} đ
              </Text>
            </View>
            <TouchableOpacity
              className={`items-center justify-center rounded-full py-3.5 ${
                watchedAmount && Number(watchedAmount) > 0 && watchedPayment
                  ? 'bg-primary-color-2'
                  : 'bg-gray-300'
              }`}
              onPress={handleSubmit(submitDeposit)}
              disabled={!watchedAmount || Number(watchedAmount) <= 0 || !watchedPayment}>
              <Text className="font-inter-bold text-base text-white">
                {t('payment.confirm_payment')}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>

      {/* --- QR PAYMENT MODAL --- */}
      <CheckQRPaymentModal />
    </>
  );
}

// Định nghĩa màu sắc (lấy theo mã màu bạn đang dùng)
const COLORS = {
  primary: '#2B7BBE', // primary-color-1
  blue100: '#DBEAFE', // blue-100 (màu nền khi chọn)
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray500: '#6B7280',
  gray900: '#111827',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  // Container tổng của từng dòng phương thức
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    padding: 16, // p-4
    backgroundColor: COLORS.white,
    marginBottom: 12, // gap-3 (khoảng cách giữa các item)
  },
  // Trạng thái được chọn
  methodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blue100,
  },
  // Trạng thái không chọn (có shadow nhẹ)
  methodUnselected: {
    borderColor: COLORS.white,
    // Shadow-sm implementation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Vùng chứa Icon (tròn tròn bên trái)
  iconContainer: {
    marginRight: 12, // mr-3
    height: 40, // h-10
    width: 40, // w-10
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // rounded-full
  },
  iconBgSelected: {
    backgroundColor: COLORS.primary,
  },
  iconBgUnselected: {
    backgroundColor: COLORS.gray100,
  },

  // Phần text ở giữa
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold', // font-inter-bold
    fontWeight: '700', // Fallback nếu font chưa load
  },
  textSelected: {
    color: COLORS.primary,
  },
  textUnselected: {
    color: COLORS.gray900,
  },
  methodDesc: {
    marginTop: 2, // mt-0.5
    fontSize: 12, // text-xs
    color: COLORS.gray500,
  },
});
