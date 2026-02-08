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
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import useAuthStore from '@/features/auth/store';


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
    code: "custom",
    path: ['file_uploads', type],
    message,
  });
};

const buildApplyPartnerFormData = (data: ApplyPartnerRequest): FormData => {
  const fd = new FormData();

  fd.append('role', String(data.role));

  if (data.role === _UserRole.KTV) {
    fd.append('experience', String(data.experience));
    if (data.referrer_id) {
      fd.append('referrer_id', data.referrer_id);
    }
    if (data.is_leader){
      fd.append('is_leader', "1");
    }
    if (data.nickname) {
      fd.append('nickname', data.nickname);
    }
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

export const usePartnerRegisterForm = (forWho: "ktv" | "agency" | "leader-ktv") => {
  const { t } = useTranslation();
  // Lấy dữ liệu từ check review application
  const queryCheck = useQueryCheckApplyPartner();
  // mutation apply partner
  const { mutate, isPending } = useMutationApplyPartner();
  // toast
  const { error: errorToast, success: successToast} = useToast();

  // State để show/hide form
  const [showForm, setShowForm] = useState<boolean>(false);

  // Form data
  const form = useForm<ApplyPartnerRequest>({
    defaultValues: {
      role: _UserRole.KTV,
      nickname: '',
      referrer_id: '',
      bio: {
        vi: '',
        en: '',
        cn: '',
      },
      file_uploads: [],
    },
    resolver: zodResolver(z.object({
      role: z.literal(forWho === "agency" ? _UserRole.AGENCY : _UserRole.KTV),

      nickname: z.string().optional(),

      is_leader: z.boolean().optional(),

      referrer_id: z
        .string()
        .optional()
        .refine((val) => !val || val.trim() === '' || /^\d+$/.test(val.trim()), {
          message: t('profile.partner_form.error_agency_id_invalid'),
        }),

      experience: z.number()
        .max(60, t('profile.error.invalid_experience'))
        .optional(),

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
    }).superRefine((data, ctx) => {
        // xử lý file
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
        // Ảnh mặt chụp cùng CCCD
        if (countByType(files, _PartnerFileType.FACE_WITH_IDENTITY_CARD) !== 1) {
          addFileError(
            ctx,
            _PartnerFileType.FACE_WITH_IDENTITY_CARD,
            t('profile.partner_form.alert_missing_face_with_card_message')
          );
        }

        // Đối với KTV thì yêu cầu thêm các trường
        if (data.role === _UserRole.KTV) {
          // KTV yêu cầu thêm kinh nghiệm
          if (!data.experience || data.experience < 1) {
            ctx.addIssue({
              code: "custom",
              message: t('profile.error.invalid_experience'),
              path: ["experience"],
            });
          }

          // KTV yêu cầu thêm nickname
          if (!data.nickname || data.nickname.trim() === '' || data.nickname.length < 4 || data.nickname.length > 255) {
            ctx.addIssue({
              code: "custom",
              message: t('profile.partner_form.error_nickname_required'),
              path: ["nickname"],
            });
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
          if (galleryCount < 3 || galleryCount > 5) {
            addFileError(
              ctx,
              _PartnerFileType.KTV_IMAGE_DISPLAY,
              t('profile.partner_form.alert_images_display_message', { min: 3, max: 5 })
            );
          }
        }
      })),
  });

  // Xử lý lỗi submit form
  const onInvalidSubmit = (errors: any) => {
    const fileErrors = errors?.file_uploads;
    if (!fileErrors) return;

    // lấy lỗi đầu tiên
    const firstError = fileErrors.find((e: any) => e?.message);

    if (firstError?.message) {
      errorToast({ message: firstError.message });
    }
  };

  // Xử lý submit form
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

  // Lấy dữ liệu từ check review application
  useEffect(() => {
    // Nếu có thể apply, show form
    setShowForm(Boolean(queryCheck.data?.can_apply));
    if (queryCheck.isError) {
      errorToast({ message: t('profile.partner_form.error_check_application') });
    }
  }, [queryCheck.data, queryCheck.isError]);

  return {
    form,
    onSubmit,
    onInvalidSubmit,
    loading: isPending || form.formState.isSubmitting,
    reviewApplication: queryCheck.data?.review_application || null,
    showForm
  };
};
