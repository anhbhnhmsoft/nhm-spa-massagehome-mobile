import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { _UserRole } from '@/features/auth/const';
import { useMutationApplyPartner } from '@/features/user/hooks/use-mutation';
import { useFileUpload } from '@/features/user/hooks/use-file-upload';
import { PartnerRegisterForm, PartnerRegisterSubmitData } from '@/features/user/types/partner-register';
import useApplicationStore from '@/lib/store';
import useAuthStore from '@/features/auth/store';

type UsePartnerRegisterFormOptions = {
  role: _UserRole;
  schema: z.ZodType<PartnerRegisterForm>;
  validateImages?: (galleryImages: string[]) => boolean;
  validateIdImages?: (idFront: string | null, idBack: string | null) => boolean;
  validateDegreeImages?: (degreeImages: string[]) => boolean;
  prepareFiles: (
    uploadFile: (uri: string, options?: { type?: number; isPublic?: boolean }) => Promise<{ file_path: string; is_public: boolean }>,
    galleryImages: string[],
    idFront?: string | null,
    idBack?: string | null,
    degreeImages?: string[]
  ) => Promise<Array<{ type: number; file_path: string; is_public: boolean }>>;
};

export const usePartnerRegisterForm = (options: UsePartnerRegisterFormOptions) => {
  const {
    role,
    schema,
    validateImages,
    validateIdImages,
    validateDegreeImages,
    prepareFiles,
  } = options;

  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const applyPartnerMutation = useMutationApplyPartner();
  const { uploadFile } = useFileUpload();

  const form = useForm<PartnerRegisterForm>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      city: '',
      location: '',
      bio: '',
    },
  });

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [degreeImages, setDegreeImages] = useState<string[]>([]);

  const handleSubmit = useCallback(
    async (data: PartnerRegisterForm) => {
      // Validate images
      if (validateImages && !validateImages(galleryImages)) {
        return;
      }

      if (validateIdImages && !validateIdImages(idFront, idBack)) {
        return;
      }

      if (validateDegreeImages && !validateDegreeImages(degreeImages)) {
        return;
      }

      try {
        setLoading(true);

        const files = await prepareFiles(
          uploadFile,
          galleryImages,
          idFront,
          idBack,
          degreeImages
        );

        const submitData: PartnerRegisterSubmitData = {
          name: data.name,
          role,
          reviewApplication: {
            agency_id:
              role === _UserRole.KTV && user?.referred_by_user_id
                ? user.referred_by_user_id
                : undefined,
            province_code: data.city,
            address: data.location,
            bio: data.bio,
          },
          files,
        };

        await applyPartnerMutation.mutateAsync(submitData);

        Alert.alert(
          t('profile.partner_form.alert_success_title'),
          t('profile.partner_form.alert_success_message')
        );
        router.back();
      } catch (error: any) {
        console.error('apply partner error', error);
        Alert.alert(
          t('profile.partner_form.alert_error_title'),
          t('profile.partner_form.alert_error_message')
        );
      } finally {
        setLoading(false);
      }
    },
    [
      galleryImages,
      idFront,
      idBack,
      degreeImages,
      role,
      user,
      uploadFile,
      applyPartnerMutation,
      setLoading,
      t,
      validateImages,
      validateIdImages,
      validateDegreeImages,
      prepareFiles,
    ]
  );

  return {
    form,
    galleryImages,
    setGalleryImages,
    idFront,
    setIdFront,
    idBack,
    setIdBack,
    degreeImages,
    setDegreeImages,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};

