import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { useImagePicker } from '@/features/app/hooks/use-image-picker';
import { getFilesByType, usePartnerRegisterForm } from '@/features/user/hooks/use-partner-register-form';
import { ImageSlot } from '@/components/app/partner-register/image-slot';
import { InputField } from '@/components/app/partner-register/input-field';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { _PartnerFileType, _ReviewApplicationStatus } from '@/features/user/const';
import { cn } from '@/lib/utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ContractFileType } from '@/features/file/const';
import { CheckSquare, Square } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { _UserRole } from '@/features/auth/const';
import { LanguageTextArea } from '@/components/app/language-text-area';
import ModalApplication from '@/components/app/partner-register/modal-application';

export default function PartnerRegisterIndividualScreen() {
  const { t } = useTranslation();

  const { referrer_id, forWho } = useLocalSearchParams<{
    referrer_id?: string,
    forWho?: 'ktv' | 'agency' | 'leader-ktv'
  }>();

  const { pickImage } = useImagePicker();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const {
    form,
    onSubmit,
    onInvalidSubmit,
    loading,
    reviewApplication,
    showForm,
  } = usePartnerRegisterForm(forWho || 'ktv');

  const [showModalCancel, setShowModalCancel] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = form;

  // Xử lý các tham số truyền vào
  useEffect(() => {
    if (referrer_id) {
      form.setValue('referrer_id', referrer_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (forWho == 'agency') {
      form.setValue('role', _UserRole.AGENCY);
    } else {
      form.setValue('role', _UserRole.KTV);
      if (forWho == 'leader-ktv') {
        form.setValue('is_leader', true);
      }
    }
  }, [referrer_id, forWho, reviewApplication]);

  // Tên tiêu đề header
  const titleHeader = useMemo(() => {
    switch (forWho) {
      case 'leader-ktv':
        return 'profile.partner_form.title_technician_leader';
      case 'agency':
        return 'profile.partner_register.agency_title';
      case 'ktv':
      default:
        return 'profile.partner_form.title';
    }
  }, [forWho]);

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <FocusAwareStatusBar hidden={true} />

      {/*Header*/}
      <HeaderBack title={titleHeader} />

      {/* Status Pending */}
      {!showForm && reviewApplication && reviewApplication?.status == _ReviewApplicationStatus.PENDING && (
        <View className="flex-1 justify-center items-center gap-2 p-4">
          <Text className="font-inter-bold text-base text-center text-primary-color-2">
            {/* KTV */}
            {reviewApplication?.role == _UserRole.KTV && !reviewApplication?.is_leader && t('profile.partner_form.status_pending_for_ktv')}
            {/* KTV Leader */}
            {reviewApplication?.role == _UserRole.KTV && reviewApplication?.is_leader && t('profile.partner_form.status_pending_for_ktv_leader')}
            {/* Agency */}
            {reviewApplication?.role == _UserRole.AGENCY && t('profile.partner_form.status_pending_for_agency')}
          </Text>
          <TouchableOpacity
            onPress={() => setShowModalCancel(true)}
            className={'items-center justify-center rounded-xl bg-primary-color-2 px-3 py-2 shadow-blue-200'}
          >
            <Text className="font-inter-bold text-base text-white">
              {t('profile.partner_form.show_application')}
            </Text>
          </TouchableOpacity>
        </View>
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
            showsVerticalScrollIndicator={false}>

            <View className="flex-1 px-4 pt-4">
              {/* Hiển thị lý do từ chối */}
              {reviewApplication?.status === _ReviewApplicationStatus.REJECTED && (
                <View className="mb-2 items-start gap-3 p-4 border border-gray-200">
                  <Text className="font-inter-bold text-base text-red-500">
                    {t('profile.partner_form.cancel_reason_title')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowModalCancel(true)}
                    className={'items-center justify-center rounded-xl bg-primary-color-2 px-3 py-1 shadow-blue-200'}
                  >
                    <Text className="font-inter-bold text-sm text-white">
                      {t('profile.partner_form.show_application')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Ảnh căn cước công dân (trước và sau) */}
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const idFrontFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_FRONT)[0];

                  const idBackFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_BACK)[0];

                  return (
                    <View>
                      <Text className="my-2 font-inter-bold text-base text-slate-900">
                        {t('profile.partner_form.id_title')} <Text className="text-red-500">*</Text>
                      </Text>
                      <View className="mb-4 flex-row flex-wrap gap-3">
                        {/* CCCD FRONT */}
                        <ImageSlot
                          uri={idFrontFile?.file.uri || null}
                          token={idFrontFile?.file.token || undefined}
                          label={t('profile.partner_form.id_front')}
                          onAdd={() =>
                            pickImage((uri) => {
                              // remove old front if exists
                              const filtered = value.filter(
                                (f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_FRONT,
                              );

                              onChange([
                                ...filtered,
                                {
                                  type_upload: _PartnerFileType.IDENTITY_CARD_FRONT,
                                  file: {
                                    uri,
                                    name: 'id_front.jpg',
                                    type: 'image/jpeg',
                                  },
                                },
                              ]);
                            })
                          }
                          onRemove={() =>
                            onChange(
                              value.filter((f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_FRONT),
                            )
                          }
                        />

                        {/* CCCD BACK */}
                        <ImageSlot
                          uri={idBackFile?.file.uri || null}
                          token={idBackFile?.file.token || undefined}
                          label={t('profile.partner_form.id_back')}
                          onAdd={() =>
                            pickImage((uri) => {
                              const filtered = value.filter(
                                (f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_BACK,
                              );

                              onChange([
                                ...filtered,
                                {
                                  type_upload: _PartnerFileType.IDENTITY_CARD_BACK,
                                  file: {
                                    uri,
                                    name: 'id_back.jpg',
                                    type: 'image/jpeg',
                                  },
                                },
                              ]);
                            })
                          }
                          onRemove={() =>
                            onChange(
                              value.filter((f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_BACK),
                            )
                          }
                        />
                      </View>
                    </View>
                  );
                }}
              />

              {/* Ảnh khuôn  mặt + cccd */}
              <Controller
                control={control}
                name="file_uploads"
                render={({ field: { value = [], onChange } }) => {
                  const faceWithCardFile = getFilesByType(
                    value,
                    _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                  )[0];

                  return (
                    <View>
                      <Text className="my-2 font-inter-bold text-base text-slate-900">
                        {t('profile.partner_form.face_with_id')} <Text className="text-red-500">*</Text>
                      </Text>
                      <ImageSlot
                        uri={faceWithCardFile?.file.uri || null}
                        token={faceWithCardFile?.file.token || undefined}
                        label={t('profile.partner_form.add_photo')}
                        onAdd={() =>
                          pickImage((uri) => {
                            const filtered = value.filter(
                              (f) => f.type_upload !== _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                            );

                            onChange([
                              ...filtered,
                              {
                                type_upload: _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                                file: {
                                  uri,
                                  name: 'face_with_card.jpg',
                                  type: 'image/jpeg',
                                },
                              },
                            ]);
                          })
                        }
                        onRemove={() =>
                          onChange(
                            value.filter(
                              (f) => f.type_upload !== _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                            ),
                          )
                        }
                      />
                    </View>
                  );
                }}
              />

              {/* Dành cho KTV và Leader KTV */}
              {forWho == 'ktv' || forWho == 'leader-ktv' ? (
                <>
                  {/* List ảnh KTV_IMAGE_DISPLAY */}
                  <Controller
                    control={control}
                    name="file_uploads"
                    render={({ field: { value = [], onChange } }) => {
                      const licenseFiles = getFilesByType(value, _PartnerFileType.KTV_IMAGE_DISPLAY);

                      return (
                        <View>
                          <Text className="my-2 font-inter-bold text-base text-slate-900">
                            {t('profile.partner_form.images_title')} <Text className="text-red-500">*</Text>
                          </Text>
                          <View className="mb-2 flex-row flex-wrap gap-3">
                            {licenseFiles.map((item, index) => (
                              <ImageSlot
                                key={item.file.uri + index}
                                uri={item.file.uri}
                                label={t('common.degree')}
                                onAdd={() =>
                                  pickImage((newUri) => {
                                    const updated = value.map((f) =>
                                      f === item
                                        ? {
                                          ...f,
                                          file: {
                                            ...f.file,
                                            uri: newUri,
                                          },
                                        }
                                        : f,
                                    );
                                    onChange(updated);
                                  })
                                }
                                onRemove={() => {
                                  onChange(value.filter((_, i) => value[i] !== item));
                                }}
                              />
                            ))}
                            {/* ADD NEW LICENSE IMAGE */}
                            {licenseFiles.length < 5 &&
                              <ImageSlot
                                uri={null}
                                label={t('profile.partner_form.add_photo')}
                                onAdd={() =>
                                  pickImage((uri) =>
                                    onChange([
                                      ...value,
                                      {
                                        type_upload: _PartnerFileType.KTV_IMAGE_DISPLAY,
                                        file: {
                                          uri,
                                          name: 'degree.jpg',
                                          type: 'image/jpeg',
                                        },
                                      },
                                    ]),
                                  )
                                }
                              />}
                          </View>
                          {/* Note */}
                          <Text className="mb-1 text-xs text-gray-500">
                            {t('profile.partner_form.images_min_note')}
                          </Text>

                          <Text className="mb-1 text-xs text-red-500">
                            {t('profile.partner_form.images_warning')}
                          </Text>
                        </View>
                      );
                    }}
                  />
                  {/* Bằng cấp */}
                  <Controller
                    control={control}
                    name="file_uploads"
                    render={({ field: { value = [], onChange } }) => {
                      const faceWithCardFile = getFilesByType(
                        value,
                        _PartnerFileType.LICENSE,
                      )[0];

                      return (
                        <View>
                          <Text className="my-2 font-inter-bold text-base text-slate-900">
                            {t('profile.partner_form.degrees_title')} <Text className="text-red-500">*</Text>
                          </Text>
                          <ImageSlot
                            uri={faceWithCardFile?.file.uri || null}
                            token={faceWithCardFile?.file.token || undefined}
                            disabled={reviewApplication?.status == _ReviewApplicationStatus.PENDING}
                            label={t('profile.partner_form.add_photo')}
                            onAdd={() =>
                              pickImage((uri) => {
                                const filtered = value.filter(
                                  (f) => f.type_upload !== _PartnerFileType.LICENSE,
                                );
                                onChange([
                                  ...filtered,
                                  {
                                    type_upload: _PartnerFileType.LICENSE,
                                    file: {
                                      uri,
                                      name: 'face_with_card.jpg',
                                      type: 'image/jpeg',
                                    },
                                  },
                                ]);
                              })
                            }
                            onRemove={() =>
                              onChange(
                                value.filter(
                                  (f) => f.type_upload !== _PartnerFileType.LICENSE,
                                ),
                              )
                            }
                          />
                        </View>
                      );
                    }}
                  />

                  {/* Mã giới thiệu */}
                  <View className="mb-4 mt-2">
                    <Text className="my-2 font-inter-bold text-base text-slate-900">
                      {t('profile.partner_form.follow_agency_label')}
                    </Text>
                    <InputField
                      control={control}
                      name="referrer_id"
                      placeholder={t('profile.partner_form.follow_agency_placeholder')}
                      keyboardType="numeric"
                      error={errors.referrer_id?.message}
                      editable={!referrer_id}
                    />
                  </View>

                  {/* Tên hiển thị */}
                  <View className="mb-4">
                    <Text className="my-2 font-inter-bold text-base text-slate-900">
                      {t('common.nickname')} <Text className="text-red-500">*</Text>
                    </Text>
                    <InputField
                      control={control}
                      name="nickname"
                      placeholder={t('profile.partner_form.field_nickname_placeholder')}
                      keyboardType="default"
                      error={errors.nickname?.message}
                    />
                  </View>

                  {/* Kinh nghiệm */}
                  <View className="mb-4">
                    <Text className="mb-1 font-inter-bold text-base text-slate-900">
                      {t('common.years_of_experience')} <Text className="text-red-500">*</Text>
                    </Text>
                    <InputField
                      control={control}
                      name="experience"
                      placeholder={t('profile.partner_form.field_experience_placeholder')}
                      keyboardType="numeric"
                      error={errors.experience?.message}
                    />
                  </View>
                </>
              ) : null}


              {/* Giới thiệu */}
              <View className="mb-4">
                <Text className="my-2 font-inter-bold text-base text-slate-900">
                  {t('profile.partner_form.field_bio_label')} <Text className="text-red-500">*</Text>
                </Text>
                {/* Giới thiệu (Việt) */}
                <Controller
                  control={control}
                  name="bio.vi"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="VI"
                      placeholder="Mô tả kinh nghiệm, kỹ năng chuyên môn (Tiếng Việt)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Giới thiệu (Eng) */}
                <Controller
                  control={control}
                  name="bio.en"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="EN"
                      placeholder="Describe your experience and skills (English)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Giới thiệu (Trung) */}
                <Controller
                  control={control}
                  name="bio.cn"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="CN"
                      placeholder="描述您的经验和技能 (中文)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>

          {/* Đồng ý với Điều khoản và Chính sách */}
          <View className="border-t border-gray-100 bg-white p-4">
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
                        pathname: '/(app)/(profile)/term-or-use-pdf',
                        params: {
                          type: forWho === "ktv" || forWho === "leader-ktv" ? ContractFileType.POLICY_FOR_KTV.toString() : ContractFileType.POLICY_FOR_AGENCY.toString(),
                        },
                      })
                    }>
                    {t('auth.terms_and_conditions')}
                  </Text>{' '}
                  {t('common.and')}{' '}
                  <Text
                    className="font-inter-bold text-primary-color-2 underline"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/(profile)/term-or-use-pdf',
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
            <TouchableOpacity
              onPress={handleSubmit(onSubmit, onInvalidSubmit)}
              disabled={!isAgreed || loading}
              className={cn(
                'items-center justify-center rounded-xl bg-primary-color-2 py-3.5 shadow-lg shadow-blue-200',
                !(!isAgreed || loading) ? 'bg-primary-color-2' : 'bg-[#E0E0E0]',
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
        isVisible={showModalCancel}
        onClose={() => setShowModalCancel(false)}
        data={reviewApplication}
      />
    </SafeAreaView>
  );
}





