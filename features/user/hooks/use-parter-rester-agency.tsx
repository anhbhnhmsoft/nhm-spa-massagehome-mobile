import { useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { _UserRole } from '@/features/auth/const';
import useApplicationStore from '@/lib/store';
import useAuthStore from '@/features/auth/store';
import { _PartnerFileType } from '../const';
import { ApplyPartnerRequest } from '../types';
import useToast from '@/features/app/hooks/use-toast';
import { useMutationApplyPartner } from './use-mutation';
import { router } from 'expo-router';

const FileSchema = z.object({
  uri: z.string().min(1, 'Thiếu uri ảnh'),
  name: z.string().min(1, 'Thiếu tên file'),
  type: z.string().min(1, 'Thiếu mime type'),
});

const FileUploadSchema = z.object({
  type_upload: z.enum(_PartnerFileType),
  file: FileSchema,
});

const countByType = (files: { type_upload: _PartnerFileType }[], type: _PartnerFileType) =>
  files.filter((f) => f.type_upload === type).length;

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
  fd.append('address', data.address);
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

export const usePartnerRegisterAgency = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { mutate } = useMutationApplyPartner();
  const { error: errorToast, success: successToast } = useToast();
  // hàm validate và xử lý form đăng ký đối tác
  const schemas = z
    .object({
      role: z.union([z.literal(_UserRole.KTV), z.literal(_UserRole.AGENCY)]),

      province_code: z.string().min(1, t('profile.partner_form.error_city_required')),
      address: z.string().min(1, t('profile.partner_form.error_location_required')),

      latitude: z.string().min(1, t('profile.partner_form.error_location_required')),

      longitude: z.string().min(1, t('profile.partner_form.error_location_required')),

      bio: z.object({
        vi: z.string().min(20, t('profile.error.bio_required')),
        en: z.string().optional(),
        cn: z.string().optional(),
      }),

      file_uploads: z.array(FileUploadSchema),
    })
    .superRefine((data, ctx) => {
      const files = data.file_uploads;
      //    Mặt trước
      if (countByType(files, _PartnerFileType.IDENTITY_CARD_FRONT) !== 1) {
        addFileError(
          ctx,
          _PartnerFileType.IDENTITY_CARD_FRONT,
          t('profile.partner_form.alert_missing_id_message')
        );
      }

      // Mặt sau
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
    });

  type PartnerFormValues = z.infer<typeof schemas>;

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(schemas) as any,
    defaultValues: {
      role: _UserRole.AGENCY,
      province_code: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      bio: {
        vi: '',
        en: '',
        cn: '',
      },
      file_uploads: [],
    },
    mode: 'onSubmit',
  });

  const onInvalidSubmit = (errors: any) => {
    const fileErrors = errors?.file_uploads;
    if (!fileErrors) return;
    const firstError = fileErrors.find((e: any) => e?.message);

    if (firstError?.message) {
      errorToast({ message: firstError.message });
    }
  };
  const onSubmit = useCallback(async (data: any) => {
    setLoading(true);
    const formData = buildApplyPartnerFormData(data);
    mutate(formData, {
      onSuccess: (res) => {
        setLoading(false);
        successToast({ message: t('profile.partner_form.register_success') });
        router.back();
      },
      onError: (error) => {
        setLoading(false);
        errorToast({ message: error.message });
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  }, []);

  return {
    form,
    onSubmit,
    onInvalidSubmit,
  };
};
