import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { _PartnerFileType } from '@/features/user/const';
import { ApplyAgencyRequest } from '@/features/user/types';
import useToast from '@/features/app/hooks/use-toast';
import { useApplyAgencyRequest } from './use-mutation';
import { goBack } from '@/lib/utils';
import { countByType } from '@/features/user/utils';

const buildFormData = (data: ApplyAgencyRequest): FormData => {
  const formData = new FormData();
  formData.append('nickname', data.nickname);
  formData.append('address', data.address);
  formData.append('latitude', String(data.latitude));
  formData.append('longitude', String(data.longitude));
  if (data.file_uploads && data.file_uploads.length > 0) {
    data.file_uploads.forEach((item, index) => {
      formData.append(`file_uploads[${index}][type_upload]`, String(item.type_upload));

      if (item.file) {
        formData.append(`file_uploads[${index}][file]`, item.file as any);
      }
    });
  }
  return formData;
};

export const useRegisterAgency = () => {
  const { t } = useTranslation();

  // mutation apply partner
  const { mutate, isPending } = useApplyAgencyRequest();
  // toast
  const { error: errorToast, success: successToast } = useToast();

  // Form data
  const form = useForm<ApplyAgencyRequest>({
    defaultValues: {
      nickname: '',
      address: '',
      latitude:0,
      longitude: 0,
      file_uploads: [],
    },
    resolver: zodResolver(z.object({
      nickname: z
        .string(t('profile.partner_form.error.invalid_realname_length', { min: 4, max: 255 }))
        .min(4, t('profile.partner_form.error.invalid_realname_length', { min: 4, max: 255 }))
        .max(255, t('profile.partner_form.error.invalid_realname_length', { min: 4, max: 255 })),

      address: z.string().min(1, {
        error: t('profile.partner_form.error.invalid_address'),
      }),
      latitude: z.number(),
      longitude: z.number(),

      file_uploads: z.array(z.object({
        type_upload: z.enum(_PartnerFileType),
        file: z.object({
          uri: z.string().min(1, t('profile.partner_form.error_file_invalid')),
          name: z.string().min(1, t('profile.partner_form.error_file_invalid')),
          type: z.string().min(1, t('profile.partner_form.error_file_invalid')),
        }),
      })),
    }).superRefine((data, ctx) => {
      // xử lý file
      const files = data.file_uploads;
      //  CCCD  Mặt trước
      if (countByType(files, _PartnerFileType.IDENTITY_CARD_FRONT) !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['file_uploads', _PartnerFileType.IDENTITY_CARD_FRONT],
          message: t('profile.partner_form.error.invalid_cccd_front', { max: 1 }),
        });
      }
      // CCCD  Mặt sau
      if (countByType(files, _PartnerFileType.IDENTITY_CARD_BACK) !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['file_uploads', _PartnerFileType.IDENTITY_CARD_BACK],
          message: t('profile.partner_form.error.invalid_cccd_back', { max: 1 }),
        });
      }
    })),
  });


  // Xử lý submit form
  const onSubmit = (data: ApplyAgencyRequest) => {
    const formData = buildFormData(data);
    mutate(formData, {
      onSuccess: () => {
        successToast({ message: t('profile.partner_form.register_success') });
        goBack();
      },
      onError: (error) => {
        errorToast({ message: error.message });
      },
    });
  };

  return {
    form,
    onSubmit,
    loading: isPending || form.formState.isSubmitting,
  };
};
