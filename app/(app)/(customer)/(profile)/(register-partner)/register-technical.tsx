import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { useImagePicker } from '@/features/app/hooks/use-image-picker';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { _PartnerFileType, _ReviewApplicationStatus } from '@/features/user/const';
import { cn } from '@/lib/utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ContractFileType } from '@/features/file/const';
import { CheckSquare, Square } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import {
  CardPendingApplication,
  CardReasonRejectApplication,
  ImageRegisterPartnerSlot,
  ModalApplication,
} from '@/components/app/customer';
import { useCheckPartnerRegister, useRegisterTechnical } from '@/features/user/hooks';
import { FormError, FormInput, FormLabel } from '@/components/ui/form-input';
import {
  addOrUpdateFile,
  appendFile,
  getFilesByType,
  removeFileByType,
  removeSpecificFile,
  updateSpecificFile,
} from '@/features/user/utils';
import { ApplyTechnicalRequest } from '@/features/user/types';
import { FormDatePicker } from '@/components/ui/form-date-picker';

const getErrorsFileType = (errors: FieldErrors<ApplyTechnicalRequest>, type: _PartnerFileType) => {
  const fileUploadErrors = errors.file_uploads;
  if (fileUploadErrors) {
    return fileUploadErrors[type]?.message;
  }
};

export default function PartnerRegisterIndividualScreen() {
  const { t } = useTranslation();

  const { referrer_id, isLeader } = useLocalSearchParams<{
    referrer_id?: string;
    isLeader?: '1' | '0';
  }>();

  const { pickImage, loadingKey, isAnyLoading } = useImagePicker();

  const { showForm, reviewApplication } = useCheckPartnerRegister();

  const { form, onSubmit, loading } = useRegisterTechnical({
    isLeader: isLeader === '1',
    referrer_id: referrer_id || '',
  });

  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [showModalApplication, setShowModalApplication] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = form;

  const title = useMemo(() => {
    if (isLeader === '1') return 'profile.partner_form.title_technician_leader';
    return 'profile.partner_form.title';
  }, [isLeader]);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title={title} />

      {!showForm && (
        <CardPendingApplication
          t={t}
          data={reviewApplication}
          setShowModalApplication={setShowModalApplication}
        />
      )}

      {showForm && (
        <View className="flex-1">
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            enableOnAndroid={true}
            scrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}>
            <View className="flex-1 px-4 pt-4">
              <CardReasonRejectApplication
                t={t}
                data={reviewApplication}
                setShowModalApplication={setShowModalApplication}
              />

              {/* Ảnh CCCD */}
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const idFrontFile = getFilesByType(
                    value,
                    _PartnerFileType.IDENTITY_CARD_FRONT
                  )[0];
                  const idBackFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_BACK)[0];
                  const faceIdFile = getFilesByType(
                    value,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD
                  )[0];
                  const errorIdFront = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_FRONT
                  );
                  const errorIdBack = getErrorsFileType(
                    errors,
                    _PartnerFileType.IDENTITY_CARD_BACK
                  );
                  const errorFaceId = getErrorsFileType(
                    errors,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD
                  );

                  return (
                    <View className="mb-2">
                      <FormLabel label={t('profile.partner_form.id_cccd_title')} required={true} />
                      <View className="my-2 flex-row flex-wrap gap-3">
                        {/* CCCD FRONT */}
                        <ImageRegisterPartnerSlot
                          uri={idFrontFile?.file.uri || null}
                          label={t('profile.partner_form.id_cccd_front')}
                          isLoading={loadingKey === 'cccd_front'} // ✅
                          disabled={isAnyLoading} // ✅
                          onAdd={() =>
                            pickImage('cccd_front', (file) => {
                              onChange(
                                addOrUpdateFile(value, _PartnerFileType.IDENTITY_CARD_FRONT, file)
                              );
                            })
                          }
                          onRemove={() =>
                            onChange(removeFileByType(value, _PartnerFileType.IDENTITY_CARD_FRONT))
                          }
                        />
                        {/* CCCD BACK */}
                        <ImageRegisterPartnerSlot
                          uri={idBackFile?.file.uri || null}
                          label={t('profile.partner_form.id_cccd_back')}
                          isLoading={loadingKey === 'cccd_back'} // ✅
                          disabled={isAnyLoading} // ✅
                          onAdd={() =>
                            pickImage('cccd_back', (file) => {
                              onChange(
                                addOrUpdateFile(value, _PartnerFileType.IDENTITY_CARD_BACK, file)
                              );
                            })
                          }
                          onRemove={() =>
                            onChange(removeFileByType(value, _PartnerFileType.IDENTITY_CARD_BACK))
                          }
                        />
                        {/* Ảnh chụp cùng CCCD */}
                        <ImageRegisterPartnerSlot
                          uri={faceIdFile?.file.uri || null}
                          label={t('profile.partner_form.face_with_id')}
                          isLoading={loadingKey === 'face_id'} // ✅
                          disabled={isAnyLoading} // ✅
                          onAdd={() =>
                            pickImage('face_id', (file) => {
                              onChange(
                                addOrUpdateFile(
                                  value,
                                  _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                                  file
                                )
                              );
                            })
                          }
                          onRemove={() =>
                            onChange(
                              removeFileByType(value, _PartnerFileType.FACE_WITH_IDENTITY_CARD)
                            )
                          }
                        />
                      </View>
                      <View className="flex-col gap-2">
                        <FormError error={errorIdFront} />
                        <FormError error={errorIdBack} />
                        <FormError error={errorFaceId} />
                      </View>
                    </View>
                  );
                }}
              />

              {/* List ảnh KTV_IMAGE_DISPLAY */}
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const imageDisplayFiles = getFilesByType(
                    value,
                    _PartnerFileType.KTV_IMAGE_DISPLAY
                  );
                  const errorsFile = getErrorsFileType(errors, _PartnerFileType.KTV_IMAGE_DISPLAY);

                  return (
                    <View className="mb-2">
                      <FormLabel
                        label={t('profile.partner_form.images_title')}
                        description={t('profile.partner_form.images_min_note')}
                        required
                      />
                      <Text className="mb-1 text-xs text-red-500">
                        {t('profile.partner_form.images_warning')}
                      </Text>
                      <View className="my-2 flex-row flex-wrap gap-3">
                        {imageDisplayFiles.map((item, index) => (
                          <ImageRegisterPartnerSlot
                            key={item.file.uri + item.type_upload}
                            uri={item.file.uri}
                            label={t('profile.partner_form.add_photo')}
                            isLoading={loadingKey === `ktv_${item.type_upload}`} // ✅
                            disabled={isAnyLoading} // ✅
                            onAdd={() =>
                              pickImage(`ktv_${item.type_upload}`, (fileInfo) => {
                                onChange(updateSpecificFile(value, item, fileInfo));
                              })
                            }
                            onRemove={() => onChange(removeSpecificFile(value, item))}
                          />
                        ))}
                        {imageDisplayFiles.length < 5 && (
                          <ImageRegisterPartnerSlot
                            uri={null}
                            label={t('profile.partner_form.add_photo')}
                            isLoading={loadingKey === 'ktv_new'} // ✅
                            disabled={isAnyLoading} // ✅
                            onAdd={() =>
                              pickImage('ktv_new', (newFileInfo) => {
                                onChange(
                                  appendFile(value, _PartnerFileType.KTV_IMAGE_DISPLAY, newFileInfo)
                                );
                              })
                            }
                          />
                        )}
                        <FormError error={errorsFile} />
                      </View>
                    </View>
                  );
                }}
              />

              {/* Ảnh đại diện */}
              <Controller
                control={control}
                name="avatar"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormLabel label={t('profile.partner_form.avatar')} required />
                    <View className="my-2">
                      <ImageRegisterPartnerSlot
                        uri={value?.uri || null}
                        label={t('profile.partner_form.avatar')}
                        isLoading={loadingKey === 'avatar'} // ✅
                        disabled={isAnyLoading} // ✅
                        onAdd={() => pickImage('avatar', (newFileInfo) => onChange(newFileInfo))}
                      />
                      <FormError error={errors.avatar?.message} />
                    </View>
                  </View>
                )}
              />

              {/* Tên hiển thị */}
              <Controller
                control={control}
                name="nickname"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormInput
                      label={t('common.nickname')}
                      required
                      placeholder={t('profile.partner_form.field_nickname_placeholder')}
                      value={value || ''}
                      onChangeText={onChange}
                      keyboardType="default"
                      error={errors.nickname?.message}
                    />
                  </View>
                )}
              />

              {/* Ngày sinh */}
              <Controller
                control={control}
                name="dob"
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const dateValue = value ? new Date(value) : undefined;
                  return (
                    <View className="mb-2">
                      <FormDatePicker
                        label={t('profile.partner_form.field_dob_label')}
                        required={true}
                        value={dateValue}
                        error={error?.message}
                        onChange={(selectedDate) => {
                          onChange(selectedDate.toISOString().split('T')[0]);
                        }}
                      />
                    </View>
                  );
                }}
              />

              {/* Mã giới thiệu */}
              <Controller
                control={control}
                name="referrer_id"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormInput
                      label={t('profile.partner_form.follow_agency_label')}
                      placeholder={t('profile.partner_form.follow_agency_label')}
                      value={value || ''}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      error={errors.referrer_id?.message}
                      editable={!referrer_id}
                    />
                  </View>
                )}
              />

              {/* Kinh nghiệm */}
              <Controller
                control={control}
                name="experience"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormInput
                      label={t('common.years_of_experience')}
                      required
                      placeholder={t('common.years_of_experience')}
                      value={value !== undefined && value !== null ? String(value) : ''}
                      onChangeText={(text) => {
                        const val = Number(text);
                        onChange(Number.isNaN(val) ? 0 : val);
                      }}
                      keyboardType="numeric"
                      error={errors.experience?.message}
                    />
                  </View>
                )}
              />

              {/* Giới thiệu */}
              <Controller
                control={control}
                name="bio"
                render={({ field: { value, onChange } }) => (
                  <View className="mb-2">
                    <FormInput
                      label={t('profile.partner_form.field_bio_label')}
                      required
                      isTextArea
                      placeholder={t('profile.partner_form.field_bio_label')}
                      value={value || ''}
                      onChangeText={onChange}
                      keyboardType="default"
                      error={errors.bio?.message}
                    />
                  </View>
                )}
              />
            </View>
          </KeyboardAwareScrollView>

          {/* Footer */}
          <View className="border-t border-gray-100 bg-white p-4">
            <View className="mb-2 flex-row items-start gap-3">
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
              <View className="flex-1">
                <Text className="font-inter-regular leading-5 text-gray-600">
                  {t('auth.i_agree_to')}{' '}
                  <Text
                    className="font-inter-bold text-primary-color-2 underline"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/term-or-use-pdf',
                        params: { type: ContractFileType.POLICY_FOR_KTV.toString() },
                      })
                    }>
                    {t('auth.terms_and_conditions_register_technical')}
                  </Text>{' '}
                  {t('common.and')}{' '}
                  <Text
                    className="font-inter-bold text-primary-color-2 underline"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/term-or-use-pdf',
                        params: { type: ContractFileType.POLICY_PRIVACY.toString() },
                      })
                    }>
                    {t('auth.privacy_policy')}
                  </Text>
                </Text>
              </View>
            </View>

            {/* ✅ Nút submit cũng disable khi đang xử lý ảnh */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={!isAgreed || loading || isAnyLoading}
              className={cn(
                'items-center justify-center rounded-xl py-3.5 shadow-lg shadow-blue-200',
                !isAgreed || loading || isAnyLoading ? 'bg-slate-500' : 'bg-primary-color-2'
              )}>
              <Text className="font-inter-bold text-base text-white">
                {loading ? t('common.loading') : t('profile.partner_form.button_submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ModalApplication
        t={t}
        isVisible={showModalApplication}
        onClose={() => setShowModalApplication(false)}
        data={reviewApplication}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});
