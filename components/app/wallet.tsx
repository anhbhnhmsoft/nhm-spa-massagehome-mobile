import React, { FC, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Plus, Wallet, X, Trash, Zap } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import {
  useCreateInfoWithdraw,
  useRequestWithdraw,
  useWithdrawInfo,
} from '@/features/payment/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import SelectModal from '@/components/select-modal';
import { cn, formatBalance } from '@/lib/utils';
import { _QUICK_WITHDRAW_AMOUNTS } from '@/features/payment/consts';
import { ModalToast } from '@/components/toast-manger-modal';

// Modal Rút Tiền
type WithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
};
export const WithdrawModal = ({ isVisible, onClose }: WithdrawModalProps) => {
  const { t } = useTranslation();
  // modal tạo thông tin rút tiền ngân hàng
  const [showModalCreateInfo, setShowModalCreateInfo] = useState<boolean>(false);

  // id thông tin rút tiền ngân hàng được chọn
  const [idChoose, setIdChoose] = useState<string>('');

  const { queryListInfoWithdraw, deleteWithdrawInfoItem, isDeleting } = useWithdrawInfo(
    isVisible,
    onClose
  );

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      {/* Overlay: Bấm ra ngoài để đóng modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          {/* Modal Content Wrapper - Chặn sự kiện bấm xuyên qua */}
          <TouchableWithoutFeedback>
            <View className="w-full rounded-t-3xl bg-white shadow-2xl" style={{ height: '80%' }}>
              {/* Header Modal */}
              <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                <Text className="text-lg font-bold text-gray-800">
                  {t('payment.withdraw.title_modal')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                  }}
                  className="rounded-full bg-gray-100 p-1.5">
                  <X size={20} color={DefaultColor.slate[600]} />
                </TouchableOpacity>
              </View>

              {/* Body: List */}
              <View className="flex-1 px-5 pt-4">
                <FlatList
                  data={queryListInfoWithdraw.data || []}
                  refreshControl={
                    <RefreshControl
                      refreshing={queryListInfoWithdraw.isRefetching}
                      onRefresh={() => queryListInfoWithdraw.refetch()}
                    />
                  }
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const config = item.config;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        disabled={isDeleting}
                        onPress={() => {
                          setIdChoose(item.id);
                        }}
                        className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <View className="flex-1 flex-row items-center gap-1">
                          {/* Icon */}
                          <View
                            className={`h-10 w-10 items-center justify-center rounded-full bg-primary-color-2`}>
                            <Wallet size={20} color="white" />
                          </View>

                          {/* Info */}
                          <View className="ml-3 flex-1">
                            <Text className="font-inter-bold text-base text-gray-800">
                              {config.bank_name}
                            </Text>
                            <Text className="text-xs text-gray-500" numberOfLines={1}>
                              {config.bank_account} - {config.bank_holder}
                            </Text>
                          </View>
                        </View>
                        {/* Delete Button */}
                        <TouchableOpacity
                          className={'p-1'}
                          onPress={(e) => {
                            e.stopPropagation();
                            deleteWithdrawInfoItem(item.id);
                          }}>
                          {isDeleting ? (
                            <ActivityIndicator size="small" color={DefaultColor.slate[400]} />
                          ) : (
                            <Trash size={20} color={DefaultColor.red[600]} />
                          )}
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  ListEmptyComponent={() => (
                    <View className="items-center justify-center pt-10">
                      <Text className="text-sm text-gray-400">
                        {t('payment.withdraw.no_account')}
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Footer: Thêm mới */}
              <View className="safe-area-bottom border-t border-gray-100 p-5">
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl bg-primary-color-2 py-3.5"
                  onPress={() => setShowModalCreateInfo(true)}>
                  <Plus size={22} color="white" />
                  <Text className="ml-2 text-base font-bold text-white">
                    {t('payment.withdraw.add_new_account')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal Liên kết Ngân hàng */}
      <CreateInfoWithdrawModal
        isVisible={showModalCreateInfo}
        onClose={() => {
          setShowModalCreateInfo(false);
        }}
        onSuccess={() => {
          // Cập nhật lại danh sách thông tin rút tiền
          queryListInfoWithdraw.refetch();
          setShowModalCreateInfo(false);
        }}
      />

      {/* Modal Tạo Request Rút Tiền */}
      <CreateWithdrawTicketModal
        id={idChoose}
        setId={setIdChoose}
      />
    </ModalToast>
  );
};

// Modal Liên kết Ngân hàng
type CreateInfoWithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};
const CreateInfoWithdrawModal: FC<CreateInfoWithdrawModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  // Khởi tạo React Hook Form
  const { form, loading, optionSelectBank, submitCreateWithdrawInfo } = useCreateInfoWithdraw(
    isVisible,
    onClose,
    onSuccess
  );

  // State quản lý dropdown chọn ngân hàng
  const [openSelectBank, setOpenSelectBank] = useState<boolean>(false);

  const { t } = useTranslation();

  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const bankName = watch('config.bank_name');

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        reset();
        setOpenSelectBank(false);
        onClose();
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay mờ, bấm vào để đóng */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end bg-black/50">
            {/* Nội dung Modal - Chặn sự kiện bấm xuyên qua */}
            <TouchableWithoutFeedback>
              <View className="h-[85%] w-full rounded-t-3xl bg-white shadow-2xl">
                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                  <Text className="text-xl font-bold text-gray-800">
                    {t('payment.withdraw.add_new_account')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                    }}
                    className="rounded-full bg-gray-100 p-2">
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {/* Form Body (Scrollable) */}
                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {/* BANK BIN + BANK NAME */}
                  <Controller
                    name="config.bank_bin"
                    control={control}
                    render={({ field: { value } }) => (
                      <View className={'mb-4'}>
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TouchableOpacity
                          onPress={() => setOpenSelectBank(true)}
                          className={cn(
                            'flex-row items-center rounded-xl border bg-gray-50 p-3.5',
                            errors.config?.bank_bin || errors.config?.bank_name
                              ? 'border-red-500'
                              : 'border-gray-200'
                          )}>
                          {bankName ? (
                            <Text className="font-bold text-gray-900">{bankName}</Text>
                          ) : (
                            <Text className="text-gray-400">{t('payment.bank')}</Text>
                          )}

                          <View className="flex-1 items-end">
                            <Ionicons name="chevron-down" size={20} color="#666" />
                          </View>
                        </TouchableOpacity>
                        <SelectModal
                          isVisible={openSelectBank}
                          value={value}
                          onClose={() => setOpenSelectBank(false)}
                          onSelect={(item) => {
                            setValue('config.bank_bin', item.value as string);
                            setValue('config.bank_name', item.label);
                          }}
                          data={optionSelectBank}
                        />
                        {(errors.config?.bank_bin || errors.config?.bank_name) && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {t('payment.error.bank_bin_or_name')}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* BANK ACCOUNT */}
                  <Controller
                    name="config.bank_account"
                    control={control}
                    render={({ field: { value, onBlur, onChange } }) => (
                      <View className="mb-4">
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank_account')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          className={cn(
                            'rounded-xl border bg-gray-50 p-3.5 text-base text-gray-800',
                            errors.config?.bank_account
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 focus:border-[#2B7BBE]'
                          )}
                          placeholder={t('payment.bank_account')}
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.config?.bank_account && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {errors.config.bank_account?.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* BANK HOLDER */}
                  <Controller
                    name="config.bank_holder"
                    control={control}
                    render={({ field: { value, onBlur, onChange } }) => (
                      <View className="mb-4">
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank_holder')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          className={cn(
                            'rounded-xl border bg-gray-50 p-3.5 text-base text-gray-800',
                            errors.config?.bank_holder
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 focus:border-[#2B7BBE]'
                          )}
                          placeholder={t('payment.bank_holder')}
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.config?.bank_holder && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {errors.config.bank_holder?.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                  <View className="h-10" />
                </ScrollView>
                {/* Footer: Submit Button */}
                <View className="safe-area-bottom border-t border-gray-100 bg-white p-5">
                  <TouchableOpacity
                    onPress={submitCreateWithdrawInfo}
                    disabled={loading}
                    className={cn(
                      'w-full flex-row items-center justify-center rounded-xl py-4',
                      loading ? 'bg-gray-400' : 'bg-primary-color-2'
                    )}>
                    {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                    <Text className="font-inter-bold text-lg text-white">
                      {loading ? t('common.loading') : t('payment.add_new_withdraw_info')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ModalToast>
  );
};

// Modal Tạo Thông tin Rút Tiền Ngân Hàng
type CreateWithdrawTicketModalProps = {
  id: string;
  setId: (id: string) => void;
};
const CreateWithdrawTicketModal = ({ id, setId }: CreateWithdrawTicketModalProps) => {
  const { t } = useTranslation();

  const { form, submitRequestWithdraw, loading, configPayment } = useRequestWithdraw(id, setId);

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedAmount = watch('amount');

  // Tính số tiền rút thực tế (số point * tỉ giá)
  const withdrawMoney = Math.floor(
    Number(watchedAmount) * Number(configPayment?.currency_exchange_rate)
  );

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={id !== ''}
      onRequestClose={() => {
        setId('');
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay mờ, bấm vào để đóng */}
        <TouchableWithoutFeedback
          onPress={() => {
            setId('');
          }}>
          <View className="flex-1 justify-end bg-black/50">
            {/* Nội dung Modal - Chặn sự kiện bấm xuyên qua */}
            <TouchableWithoutFeedback>
              <View className="h-[90%] w-full rounded-t-3xl bg-white shadow-2xl">
                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                  <Text className="font-inter-bold text-xl text-gray-800">
                    {t('payment.withdraw.title_modal_request')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setId('');
                    }}
                    className="rounded-full bg-gray-100 p-2">
                    <Ionicons name="close" size={24} color={DefaultColor.gray[600]} />
                  </TouchableOpacity>
                </View>
                {/* Form Body (Scrollable) */}
                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {/* Nhập số tiền */}
                  <View className="mb-6">
                    <Text className="mb-2 font-inter-bold text-gray-700">
                      {t('payment.withdraw.enter_withdraw_money')}
                    </Text>
                    <View
                      className={`flex-row items-center border-b-2 py-2 ${errors.amount ? 'border-red-500' : 'border-primary-color-2'}`}>
                      <Text className="mr-2 font-inter-bold text-base text-gray-400">
                        {t('common.currency')}
                      </Text>
                      <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value, onBlur } }) => (
                          <TextInput
                            className="flex-1 font-inter-bold text-3xl text-primary-color-2"
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={DefaultColor.gray[400]}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </View>
                    {errors.amount && (
                      <Text className="mt-1 text-xs text-red-500">{errors.amount.message}</Text>
                    )}

                    {/* Các nút chọn nhanh */}
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      {_QUICK_WITHDRAW_AMOUNTS.map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setValue('amount', item.toString())}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                          <Text className="font-inter-medium text-xs text-gray-600">
                            {formatBalance(item)} {t('common.currency')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Số tiền thực tế sẽ rút */}
                  <View className="mb-8 rounded-2xl bg-primary-color-2 p-5 pt-8 shadow-sm">
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="mb-1 font-inter-medium text-green-100">
                          {t('payment.received_points')}
                        </Text>
                        <View className="flex-row items-baseline gap-2">
                          <Text className="font-inter-bold text-4xl text-white">
                            {formatBalance(withdrawMoney || 0)}
                          </Text>
                          <Text className="font-inter-bold text-lg text-green-200">đ</Text>
                        </View>
                      </View>
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <Zap size={20} color="white" fill="white" />
                      </View>
                    </View>
                    <Text className="mt-2 rounded bg-black/10 py-1 text-center text-xs text-green-100/60">
                      {formatBalance(configPayment?.currency_exchange_rate || 0)}đ = 1{' '}
                      {t('common.currency')}
                    </Text>
                  </View>

                  {/* Ghi chú */}
                  <View className="mb-8">
                    <Text className="mb-2 font-bold text-gray-700">Ghi chú (Tùy chọn)</Text>
                    <Controller
                      control={control}
                      name="note"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="min-h-[100px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-base text-gray-800"
                          placeholder="Nhập nội dung ghi chú..."
                          multiline
                          textAlignVertical="top"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                </ScrollView>

                {/* Footer Submit */}
                <View className="safe-area-bottom border-t border-gray-100 bg-white p-5">
                  <TouchableOpacity
                    onPress={submitRequestWithdraw}
                    disabled={loading}
                    className={cn(
                      'w-full flex-row items-center justify-center rounded-xl py-4',
                      loading ? 'bg-gray-400' : 'bg-primary-color-2'
                    )}>
                    {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                    <Text className="font-inter-bold text-lg text-white">
                      {loading ? t('common.loading') : t('payment.request_withdraw')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ModalToast>
  );
};
