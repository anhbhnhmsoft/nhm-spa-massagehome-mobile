import { FieldErrors, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { _UserRole } from '@/features/auth/const';
import { _PartnerFileType, _ReviewApplicationStatus } from '../const';
import { ApplyPartnerRequest } from '../types';
import useToast from '@/features/app/hooks/use-toast';
import { useMutationApplyPartner } from './use-mutation';
import { goBack } from '@/lib/utils';
import { useQueryCheckApplyPartner } from '@/features/user/hooks/use-query';
import { useEffect } from 'react';
import { router } from 'expo-router';


const countByType = (files: { type_upload: _PartnerFileType }[], type: _PartnerFileType) =>
  files.filter((f) => f.type_upload === type).length;

/**
 * Lọc danh sách file_uploads theo từng loại ảnh (_PartnerFileType)
 */
export const getFilesByType = (
  files: ApplyPartnerRequest['file_uploads'],
  type: _PartnerFileType
) => files.filter((f) => f.type_upload === type);

const addFileError = (ctx: z.RefinementCtx, type: _PartnerFileType, message: string) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['file_uploads', type],
    message,
  });
};

const buildApplyPartnerFormData = (data: ApplyPartnerRequest): FormData => {
  const fd = new FormData();
  fd.append('role', String(data.role));
  fd.append('province_code', data.province_code);
  if (data.nickname) {
    fd.append('nickname', data.nickname);
  }
  fd.append('address', data.address);
  fd.append('experience', String(data.experience));
  if (data.referrer_id) {
    fd.append('referrer_id', data.referrer_id);
  }
  if (data.is_leader){
    fd.append('is_leader', "1");
  }

  if (data.latitude) {
    fd.append('latitude', data.latitude);
  }

  if (data.longitude) {
    fd.append('longitude', data.longitude);
  }

  // ===== BIO (MULTI LANG) =====
  fd.append('bio[vi]', data.bio.vi);

  if (data.bio.en) {
    fd.append('bio[en]', data.bio.en);
  }

  if (data.bio.cn) {
    fd.append('bio[cn]', data.bio.cn);
  }

  // ===== FILE UPLOADS =====
  data.file_uploads.forEach((item, index) => {
    fd.append(`file_uploads[${index}][type_upload]`, String(item.type_upload));

    fd.append(`file_uploads[${index}][file]`, {
      uri: item.file.uri, // vd: file:///data/user/0/...
      name: item.file.name, // vd: cccd_front.jpg
      type: item.file.type, // vd: image/jpeg
    } as any);
  });

  return fd;
};

export const usePartnerRegisterForm = () => {
  const { t } = useTranslation();
  const { mutate, isPending } = useMutationApplyPartner();
  const { error: errorToast, success: successToast, info: infoToast } = useToast();

  const form = useForm<ApplyPartnerRequest>({
    defaultValues: {
      role: _UserRole.KTV,
      nickname: '',
      referrer_id: '',
      province_code: '',
      address: '',
      latitude: '',
      longitude: '',
      experience: 0,
      bio: {
        vi: '',
        en: '',
        cn: '',
      },
      file_uploads: [],
    },
    resolver: zodResolver(z.object({
      role: z.union([z.literal(_UserRole.KTV), z.literal(_UserRole.AGENCY)]),

      nickname: z.string().optional(),

      is_leader: z.boolean().optional(),

      referrer_id: z
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^\d+$/.test(val.trim()), {
          message: t('profile.partner_form.error_agency_id_invalid'),
        }),

      province_code: z.string().min(1, t('profile.partner_form.error_city_required')),

      experience: z.number()
        .min(1, t('profile.error.invalid_experience'))
        .max(60, t('profile.error.invalid_experience')),


      address: z.string().min(1, t('profile.partner_form.error_location_required')),

      latitude: z.string().min(1, t('profile.partner_form.error_location_required')),

      longitude: z.string().min(1, t('profile.partner_form.error_location_required')),

      bio: z.object({
        vi: z.string().min(10, t('profile.partner_form.error_bio_required', { min: 10 })),
        en: z.string().optional(),
        cn: z.string().optional(),
      }),

      file_uploads: z.array(z.object({
        type_upload: z.enum(_PartnerFileType),
        file: z.object({
          uri: z.string().min(1, t('profile.partner_form.error_file_invalid')),
          name: z.string().min(1, t('profile.partner_form.error_file_invalid')),
          type: z.string().min(1, t('profile.partner_form.error_file_invalid')),
        }),
      })),
    })
      .superRefine((data, ctx) => {
        const files = data.file_uploads;
        //  CCCD  Mặt trước
        if (countByType(files, _PartnerFileType.IDENTITY_CARD_FRONT) !== 1) {
          addFileError(
            ctx,
            _PartnerFileType.IDENTITY_CARD_FRONT,
            t('profile.partner_form.alert_missing_id_message')
          );
        }
        // CCCD  Mặt sau
        if (countByType(files, _PartnerFileType.IDENTITY_CARD_BACK) !== 1) {
          addFileError(
            ctx,
            _PartnerFileType.IDENTITY_CARD_BACK,
            t('profile.partner_form.alert_missing_id_message')
          );
        }
        // CCCD và mặt
        if (countByType(files, _PartnerFileType.FACE_WITH_IDENTITY_CARD) !== 1) {
          addFileError(
            ctx,
            _PartnerFileType.FACE_WITH_IDENTITY_CARD,
            t('profile.partner_form.alert_missing_face_with_card_message')
          );
        }
        // ảnh bẳng cấp
        if (countByType(files, _PartnerFileType.LICENSE) !== 1) {
          addFileError(
            ctx,
            _PartnerFileType.LICENSE,
            t('profile.partner_form.alert_missing_degrees_message')
          );
        }

        // ảnh gallery
        const galleryCount = countByType(files, _PartnerFileType.KTV_IMAGE_DISPLAY);

        if (galleryCount < 3) {
          addFileError(
            ctx,
            _PartnerFileType.KTV_IMAGE_DISPLAY,
            t('profile.partner_form.alert_images_display_message', { min: 3, max: 5 })
          );
        }

        if (galleryCount > 5) {
          addFileError(
            ctx,
            _PartnerFileType.KTV_IMAGE_DISPLAY,
            t('profile.partner_form.alert_images_display_message', { min: 3, max: 5 })
          );
        }
      })),
  });

  const queryCheck = useQueryCheckApplyPartner();

  useEffect(() => {
    if (queryCheck.error) {
      errorToast({ message: t('profile.partner_form.error_check_apply_partner') });
    }
    else if (queryCheck.data){
      const data = queryCheck.data;
      if (!data.can_apply){
        switch (data.apply_status){
          case _ReviewApplicationStatus.PENDING:
            infoToast({ message: t('profile.partner_form.info_apply_pending') });
            break;
          case _ReviewApplicationStatus.APPROVED:
            infoToast({ message: t('profile.partner_form.info_apply_approved') });
            break;
          case _ReviewApplicationStatus.REJECTED:
            errorToast({ message: t('profile.partner_form.info_apply_rejected') });
            break;
        }
        goBack();
      }
    }
  }, [queryCheck.data, queryCheck.error, t]);


  const onInvalidSubmit = (errors: any) => {
    const fileErrors = errors?.file_uploads;
    if (!fileErrors) return;

    // lấy lỗi đầu tiên
    const firstError = fileErrors.find((e: any) => e?.message);

    if (firstError?.message) {
      errorToast({ message: firstError.message });
    }
  };

  const onSubmit = async (data: ApplyPartnerRequest) => {
    const formData = buildApplyPartnerFormData(data);
    mutate(formData, {
      onSuccess: () => {
        successToast({ message: t('profile.partner_form.register_success') });
        goBack();
      },
      onError: (error) => {
        errorToast({ message: error.message });
      },
    });
  }

  return {
    form,
    onSubmit,
    onInvalidSubmit,
    loading: isPending || form.formState.isSubmitting
  };
};
