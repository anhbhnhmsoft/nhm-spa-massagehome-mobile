import { useTranslation } from 'react-i18next';
import { useDeposit } from '@/features/payment/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { cn, formatBalance } from '@/lib/utils';
import { _PAYMENT_METHODS, _PaymentType, _QUICK_AMOUNTS } from '@/features/payment/consts';
import { CheckCircle2, Circle, QrCode } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useEffect, useState } from 'react';
import { _UserRole } from '@/features/auth/const';

export default function Deposit({ useFor }: { useFor: _UserRole }) {
  const { t } = useTranslation();

  const [exchangePriceCny, setExchangePriceCny] = useState<number>(0);

  const { configPayment, form, submitDeposit } = useDeposit(useFor);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedAmount = watch('amount');
  const watchedPayment = watch('payment_type');

  useEffect(() => {
    if (
      configPayment?.exchange_rate_vnd_cny &&
      (watchedPayment === _PaymentType.WECHAT_PAY || watchedPayment === _PaymentType.ALI_PAY)
    ) {
      const priceCny = Number(watchedAmount) / Number(configPayment?.exchange_rate_vnd_cny);
      setExchangePriceCny(priceCny);
    } else {
      setExchangePriceCny(0);
    }
  }, [configPayment?.exchange_rate_vnd_cny, watchedAmount, watchedPayment]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title={'payment.deposit_title'} />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        enableOnAndroid={true}
        scrollEnabled={true}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pt-2">
          <View className="z-10 mb-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Text className="mb-3 font-inter-medium text-gray-500">
              {t('payment.deposit_label_input')}
            </Text>
            <View className={'mb-4'}>
              <View className="flex-row items-center border-b border-gray-100 pb-2">
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
                        className="flex-1 font-inter-bold text-3xl text-gray-900"
                        placeholder="0"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                      <Text className="font-inter-bold text-xl text-gray-400">đ</Text>
                    </View>
                  )}
                />
              </View>
              {errors.amount ? (
                <Text className="mt-2 text-xs text-red-500">{errors.amount.message}</Text>
              ) : null}
            </View>

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

            {(watchedPayment === _PaymentType.WECHAT_PAY ||
              watchedPayment === _PaymentType.ALI_PAY) && (
              <Text className="mt-2 text-xs text-gray-500">
                {t('payment.exchange_rate_wechat_pay', {
                  priceCny: formatBalance(exchangePriceCny),
                })}
              </Text>
            )}
          </View>

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
                  let disabled = false;

                  if (method.id === _PaymentType.QR_BANKING) {
                    disabled = !configPayment?.allow_payment?.qrcode;
                  } else if (method.id === _PaymentType.ZALO_PAY) {
                    disabled = !configPayment?.allow_payment?.zalopay;
                  } else if (method.id === _PaymentType.WECHAT_PAY) {
                    disabled = !configPayment?.allow_payment?.wechatpay;
                  } else if (method.id === _PaymentType.ALI_PAY) {
                    disabled = !configPayment?.allow_payment?.alipay;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onChange(method.id)}
                      activeOpacity={0.7}
                      disabled={disabled}
                      style={[
                        styles.methodContainer,
                        isSelected ? styles.methodSelected : styles.methodUnselected,
                        disabled ? styles.methodDisabled : {},
                      ]}>
                      {disabled ? (
                        <View className="absolute bottom-0 left-0 right-0 top-0 z-10 flex-1 items-center justify-center rounded-xl bg-black/40">
                          <View className="rounded-2xl bg-white px-2 py-1">
                            <Text className="font-inter-bold text-xs text-red-500">
                              {t('payment.method_disabled')}
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      <View
                        style={[
                          styles.iconContainer,
                          isSelected ? styles.iconBgSelected : styles.iconBgUnselected,
                        ]}>
                        {method.id === _PaymentType.QR_BANKING ? (
                          <QrCode
                            size={24}
                            color={isSelected ? 'white' : DefaultColor.gray['400']}
                          />
                        ) : null}
                        {method.id === _PaymentType.ZALO_PAY ? (
                          <Image
                            source={require('@/assets/icon/zalopay.jpeg')}
                            style={{ width: 24, height: 24, borderRadius: 12 }}
                          />
                        ) : null}
                        {method.id === _PaymentType.WECHAT_PAY ? (
                          <Image
                            source={require('@/assets/icon/wechat.png')}
                            style={{ width: 24, height: 24, borderRadius: 12 }}
                          />
                        ) : null}
                        {method.id === _PaymentType.ALI_PAY ? (
                          <Image
                            source={require('@/assets/icon/alipay.png')}
                            style={{ width: 24, height: 24, borderRadius: 12 }}
                          />
                        ) : null}
                      </View>

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
                        <Text
                          style={[
                            styles.methodDesc,
                            isSelected
                              ? { color: DefaultColor.gray['100'] }
                              : { color: DefaultColor.gray['500'] },
                          ]}>
                          {t(method.desc)}
                        </Text>
                      </View>

                      {isSelected ? (
                        <CheckCircle2 size={22} color={DefaultColor.base['primary-color-1']} />
                      ) : (
                        <Circle size={22} color={DefaultColor.gray['300']} />
                      )}
                    </TouchableOpacity>
                  );
                })}
                {errors.payment_type ? (
                  <Text className="mt-2 text-red-500">{errors.payment_type.message}</Text>
                ) : null}
              </View>
            )}
          />
        </View>
      </KeyboardAwareScrollView>

      <View className="absolute bottom-0 w-full border-t border-gray-100 bg-white p-5 shadow-lg">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">{t('payment.total_payment')}:</Text>
          <View className="flex-row items-center justify-center gap-2">
            {(watchedPayment === _PaymentType.WECHAT_PAY ||
              watchedPayment === _PaymentType.ALI_PAY) && (
              <Text className="mt-2 text-xs text-gray-500">
                ({formatBalance(exchangePriceCny)} CNY)
              </Text>
            )}
            <Text className="font-inter-bold text-lg text-gray-900">
              {watchedAmount ? formatBalance(watchedAmount) : '0'} {t('common.currency')}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className={`items-center justify-center rounded-full py-4 ${
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    backgroundColor: DefaultColor.white,
    marginBottom: 12,
  },
  methodSelected: {
    borderColor: DefaultColor.base['primary-color-1'],
    backgroundColor: DefaultColor.base['primary-color-2'],
  },
  methodUnselected: {
    borderColor: DefaultColor.white,
    ...Platform.select({
      ios: {
        shadowColor: DefaultColor.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  methodDisabled: {
    backgroundColor: DefaultColor.gray['200'],
  },
  iconContainer: {
    marginRight: 12,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  iconBgSelected: {
    backgroundColor: DefaultColor.base['primary-color-1'],
  },
  iconBgUnselected: {
    backgroundColor: DefaultColor.gray['200'],
  },
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
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
  },
  textSelected: {
    color: DefaultColor.gray['100'],
  },
  textUnselected: {
    color: DefaultColor.gray['900'],
  },
  methodDesc: {
    marginTop: 2,
    fontSize: 12,
  },
});
