import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View } from 'react-native';
import { Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { useImagePicker } from '@/features/app/hooks/use-image-picker';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { router } from 'expo-router';
import { _PartnerFileType, _ReviewApplicationStatus } from '@/features/user/const';
import { cn } from '@/lib/utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ContractFileType } from '@/features/file/const';
import { CheckSquare, MapPin, Square } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { _UserRole } from '@/features/auth/const';
import {
  CardPendingApplication,
  CardReasonRejectApplication,
  ImageRegisterPartnerSlot,
  ModalApplication,
} from '@/components/app/customer';
import { useCheckPartnerRegister, useRegisterAgency } from '@/features/user/hooks';
import { FormError, FormInput, FormLabel } from '@/components/ui/form-input';
import {
  addOrUpdateFile,
  getFilesByType,
  removeFileByType,
} from '@/features/user/utils';
import { ApplyTechnicalRequest } from '@/features/user/types';
import { Card } from '@/components/ui/card';
import { ListLocationModal } from '@/components/app/location';

// Lấy message lỗi File cho từng type cụ thể
const getErrorsFileType = (errors: FieldErrors<ApplyTechnicalRequest>, type: _PartnerFileType) => {
  const fileUploadErrors = (errors.file_uploads);
  if (fileUploadErrors) {
    return fileUploadErrors[type]?.message;
  }
};

export default function PartnerRegisterAgencyScreen() {
  const { t } = useTranslation();

  const { pickImage } = useImagePicker();

  const {
    showForm,
    reviewApplication,
  } = useCheckPartnerRegister();

  const {
    form,
    onSubmit,
    loading,
  } = useRegisterAgency();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const [showModalApplication, setShowModalApplication] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const {
    control,
    setValue,
    formState: { errors },
    handleSubmit,
  } = form;


  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <FocusAwareStatusBar hidden={true} />

      {/*Header*/}
      <HeaderBack title={'profile.partner_register.agency_title'} />

      {/* Status Pending */}
      {!showForm && (
        <CardPendingApplication
          t={t}
          data={reviewApplication}
          setShowModalApplication={setShowModalApplication}
        />
      )}

      {/*Form */}
      {showForm && (
        <View className="flex-1">
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            enableOnAndroid={true}
            scrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-4 pt-4">
              {/* Hiển thị lý do từ chối */}
              <CardReasonRejectApplication
                t={t}
                data={reviewApplication}
                setShowModalApplication={setShowModalApplication}
              />

              {/* Ảnh CCCD (trước và sau ) */}
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const idFrontFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_FRONT)[0];
                  const idBackFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_BACK)[0];
                  const errorIdFront = getErrorsFileType(errors, _PartnerFileType.IDENTITY_CARD_FRONT);
                  const errorIdBack = getErrorsFileType(errors, _PartnerFileType.IDENTITY_CARD_BACK);
                  return (
                    <View className="mb-2">
                      <FormLabel
                        label={t('profile.partner_form.id_cccd_title_exclude')}
                        required={true}
                      />
                      <View className="my-2 flex-row flex-wrap gap-3">
                        {/* CCCD FRONT */}
                        <ImageRegisterPartnerSlot
                          uri={idFrontFile?.file.uri || null}
                          label={t('profile.partner_form.id_cccd_front')}
                          onAdd={() =>
                            pickImage((file) => {
                              const newFilesArray = addOrUpdateFile(
                                value,
                                _PartnerFileType.IDENTITY_CARD_FRONT,
                                file,
                              );
                              onChange(newFilesArray);
                            })
                          }
                          onRemove={() => {
                            const newFilesArray = removeFileByType(
                              value,
                              _PartnerFileType.IDENTITY_CARD_FRONT,
                            );
                            onChange(newFilesArray);
                          }}
                        />
                        {/* CCCD BACK */}
                        <ImageRegisterPartnerSlot
                          uri={idBackFile?.file.uri || null}
                          label={t('profile.partner_form.id_cccd_back')}
                          onAdd={() =>
                            pickImage((file) => {
                              const newFilesArray = addOrUpdateFile(
                                value,
                                _PartnerFileType.IDENTITY_CARD_BACK,
                                file,
                              );
                              onChange(newFilesArray);
                            })
                          }
                          onRemove={() => {
                            const newFilesArray = removeFileByType(
                              value,
                              _PartnerFileType.IDENTITY_CARD_BACK,
                            );
                            onChange(newFilesArray);
                          }}
                        />
                      </View>
                      <View className="gap-2 flex-col">
                        <FormError error={errorIdFront} />
                        <FormError error={errorIdBack} />
                      </View>
                    </View>
                  );
                }}
              />


              {/* Tên hiển thị (tên thật của người dùng) */}
              <Controller
                control={control}
                name="nickname"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormInput
                      label={t('profile.partner_form.real_name')}
                      required
                      placeholder={t('profile.partner_form.real_name')}
                      value={value || ''}
                      onChangeText={onChange}
                      keyboardType="default"
                      error={errors.nickname?.message}
                    />
                  </View>
                )}
              />

              <View className="mt-4">
                <Controller
                  control={control}
                  name={'address'}
                  render={({ field: { value } }) => {
                    return (
                      <View className="mb-2">
                        <FormLabel
                          label={t('profile.partner_form.address')}
                          required
                        />
                        <View className="my-2">
                          <TouchableOpacity onPress={() => setShowLocationModal(true)}>
                            <Card className={'flex-row items-center'}>
                              <View className="mr-3 rounded-full bg-blue-100 p-2">
                                <Icon as={MapPin} size={20} className="text-blue-600" />
                              </View>
                              <View className="flex-1">
                                {value ? (
                                  <Text className="font-inter-medium text-sm leading-6 text-slate-800">
                                    {value}
                                  </Text>
                                ) : (
                                  <Text className="text-sm text-gray-400">
                                    {t('location.placeholder_address')}
                                  </Text>
                                )}
                              </View>
                            </Card>
                          </TouchableOpacity>
                          <ListLocationModal
                            visible={showLocationModal}
                            onClose={() => setShowLocationModal(false)}
                            onSelect={(location) => {
                              setValue('address', location.address);
                              setValue('latitude', Number(location.latitude));
                              setValue('longitude', Number(location.longitude));
                              setShowLocationModal(false);
                            }}
                          />
                        </View>
                        <View className="gap-2 flex-col">
                          <FormError error={errors?.address?.message} />
                          {(errors.latitude || errors.longitude) && (
                            <FormError error={t('profile.partner_form.error.invalid_address')} />
                          )}
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>

          {/* Footer */}
          <View className="border-t border-gray-100 bg-white p-4">
            {/* Đồng ý với Điều khoản và Chính sách */}
            <View className="mb-2 flex-row items-start gap-3">
              {/* Ô Checkbox */}
              <TouchableOpacity
                onPress={() => setIsAgreed(!isAgreed)}
                activeOpacity={0.7}
                className="mt-0.5">
                <Icon
                  as={isAgreed ? CheckSquare : Square}
                  size={22}
                  className={isAgreed ? 'text-primary-color-2' : 'text-gray-400'}
                />
              </TouchableOpacity>

              {/* Nội dung văn bản có chứa link */}
              <View className="flex-1">
                <Text className="font-inter-regular leading-5 text-gray-600">
                  {t('auth.i_agree_to')}{' '}
                  <Text
                    className="font-inter-bold text-primary-color-2 underline"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/term-or-use-pdf',
                        params: {
                          type: ContractFileType.POLICY_FOR_AGENCY.toString(),
                        },
                      })
                    }>
                    {t('auth.terms_and_conditions_register_agency')}
                  </Text>{' '}
                  {t('common.and')}{' '}
                  <Text
                    className="font-inter-bold text-primary-color-2 underline"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/term-or-use-pdf',
                        params: {
                          type: ContractFileType.POLICY_PRIVACY.toString(),
                        },
                      })
                    }>
                    {t('auth.privacy_policy')}
                  </Text>
                </Text>
              </View>
            </View>
            {/* Nút Đăng ký */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isAgreed || loading}
              className={cn(
                'items-center justify-center rounded-xl bg-primary-color-2 py-3.5 shadow-lg shadow-blue-200',
                !(!isAgreed || loading) ? 'bg-primary-color-2' : 'bg-slate-500',
              )}>
              <Text className="font-inter-bold text-base text-white">
                {loading ? t('common.loading') : t('profile.partner_form.button_submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal Đơn Đăng ký */}
      <ModalApplication
        t={t}
        isVisible={showModalApplication}
        onClose={() => setShowModalApplication(false)}
        data={reviewApplication}
      />
    </SafeAreaView>
  );
}
