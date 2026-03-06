import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { _PartnerFileType } from '@/features/user/const';
import { ApplyTechnicalRequest } from '@/features/user/types';
import useToast from '@/features/app/hooks/use-toast';
import { useApplyTechnicalRequest } from './use-mutation';
import { goBack } from '@/lib/utils';
import { useEffect } from 'react';
import { countByType } from '@/features/user/utils';

const buildFormData = (data: ApplyTechnicalRequest): FormData => {
  const formData = new FormData();
  formData.append('nickname', data.nickname);
  formData.append('experience', String(data.experience));
  formData.append('bio', data.bio);
  formData.append('dob', data.dob);
  formData.append('is_leader', data.is_leader ? '1' : '0');
  if (data.referrer_id) {
    formData.append('referrer_id', String(data.referrer_id));
  }
  if (data.avatar) {
    formData.append('avatar', data.avatar as any);
  }
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


export const useRegisterTechnical = ({ isLeader, referrer_id }: {
  isLeader: boolean;
  referrer_id: string;
}) => {
  const { t } = useTranslation();

  // mutation apply partner
  const { mutate, isPending } = useApplyTechnicalRequest();
  // toast
  const { error: errorToast, success: successToast } = useToast();

  // Form data
  const form = useForm<ApplyTechnicalRequest>({
    defaultValues: {
      nickname: '',
      experience: 1,
      referrer_id: '',
      bio: '',
      file_uploads: [],
    },
    resolver: zodResolver(z.object({
      nickname: z
        .string(t('profile.partner_form.error.invalid_nickname_length', { min: 4, max: 255 }))
        .min(4, t('profile.partner_form.error.invalid_nickname_length', { min: 4, max: 255 }))
        .max(255, t('profile.partner_form.error.invalid_nickname_length', { min: 4, max: 255 })),
      referrer_id: z
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^\d+$/.test(val.trim()), {
          message: t('profile.partner_form.error_agency_id_invalid'),
        }),
      is_leader: z.boolean().optional(),

      experience: z.number(t('profile.partner_form.error.invalid_experience', { min: 1, max: 20 }))
        .min(1, t('profile.partner_form.error.invalid_experience', { min: 1, max: 20 }))
        .max(20, t('profile.partner_form.error.invalid_experience', { min: 1, max: 20 })),

      bio: z.string()
        .min(10, t('profile.partner_form.error.bio_required', { min: 10, max: 1000 }))
        .max(1000, t('profile.partner_form.error.bio_required', { min: 10, max: 1000 })),


      dob: z.string(t('profile.partner_form.error.invalid_dob'))
        .regex(/^\d{4}-\d{2}-\d{2}$/, t('profile.partner_form.error.invalid_dob')),

      avatar: z.any()
        .refine((file) => file != null, t('profile.partner_form.error.avatar_required')),

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
      // Ảnh mặt chụp cùng CCCD
      if (countByType(files, _PartnerFileType.FACE_WITH_IDENTITY_CARD) !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['file_uploads', _PartnerFileType.FACE_WITH_IDENTITY_CARD],
          message: t('profile.partner_form.error.invalid_face_with_id', { max: 1 }),
        });
      }
      // ảnh gallery
      const galleryCount = countByType(files, _PartnerFileType.KTV_IMAGE_DISPLAY);
      if (galleryCount < 3 || galleryCount > 5) {
        ctx.addIssue({
          code: 'custom',
          path: ['file_uploads', _PartnerFileType.KTV_IMAGE_DISPLAY],
          message: t('profile.partner_form.error.invalid_ktv_image_display', { min: 3, max: 5 }),
        });
      }
    })),
  });

  // Cập nhật giá trị is_leader khi thay đổi
  useEffect(() => {
    if (referrer_id && referrer_id.trim() !== '') {
      form.setValue('referrer_id', referrer_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    form.setValue('is_leader', isLeader);
  }, [isLeader, referrer_id]);


  // Xử lý submit form
  const onSubmit = (data: ApplyTechnicalRequest) => {
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
