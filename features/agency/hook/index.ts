import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { _TimeFilter } from '@/features/agency/const';
import {
  useDashboardAgencyQuery,
  useGetProfileAgencyProfile,
  useListKtvPerformanceQuery,
} from '@/features/agency/hook/use-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditProfileAgencyMutation } from '@/features/agency/hook/use-mutaion';
import useToast from '@/features/app/hooks/use-toast';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { router } from 'expo-router';
import { goBack } from '@/lib/utils';

/**
 * Hook để quản lý dashboard của đại lý
 */
export const useDashboardAgency = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<_TimeFilter>(_TimeFilter.ALL);

  // 1. Thống kê Header
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useDashboardAgencyQuery(activeFilter);

  // 2. Danh sách KTV (Infinite Query)
  const {
    data: performanceData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPerformanceLoading,
    refetch: refetchPerformance,
    isRefetching,
  } = useListKtvPerformanceQuery(activeFilter);

  // 3. Xử lý dữ liệu
  const tabs = useMemo(() => Object.values(_TimeFilter), []);

  const listPerformanceKtv = useMemo(() => {
    return performanceData?.pages.flatMap((page) => page.data) || [];
  }, [performanceData]);

  // 4. Các hàm hành động
  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchPerformance()]);
  }, [refetchStats, refetchPerformance]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    t,
    tabs,
    activeFilter,
    setActiveFilter,
    statsData,
    isStatsLoading,
    listPerformanceKtv,
    isPerformanceLoading,
    isFetchingNextPage,
    isRefetching,
    onRefresh,
    handleLoadMore,
  };
};

/**
 * Hook dùng cho màn update profile  agecy
 */

export const useUpdateProfileAgency = () => {
  const { t } = useTranslation();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const query = useGetProfileAgencyProfile();
  const { mutate: mutateEditProfile } = useEditProfileAgencyMutation();
  const { success: toastSuccess } = useToast();
  const errorToast = useErrorToast();

  const updateAgencySchema = z
    .object({
      bio: z.object({
        vi: z.string().min(1, t('profile.error.bio_required')),
        en: z.string().min(1, t('profile.error.bio_required')),
        cn: z.string().min(1, t('profile.error.bio_required')),
      }),
      // Cho phép nhận string, null hoặc undefined
      old_pass: z.string().optional().nullable(),
      new_pass: z.string().optional().nullable(),
      lat: z.number(),
      lng: z.number(),
      address: z.string().min(1, t('profile.error.invalid_address')).max(255),
      gender: z.number(),
      date_of_birth: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      const hasNewPass = data.new_pass && data.new_pass.trim().length > 0;
      if (!hasNewPass) {
        return;
      }
      if (!data.old_pass || data.old_pass.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['old_pass'],
          message: t('auth.error.password_invalid'),
        });
      }

      // Kiểm tra độ dài mật khẩu mới
      if (data.new_pass && data.new_pass.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['new_pass'],
          message: t('profile.error.old_password_min'),
        });
      }
    });

  // Định nghĩa kiểu dữ liệu từ Schema
  type UpdateAgencyFormData = z.infer<typeof updateAgencySchema>;

  const form = useForm<UpdateAgencyFormData>({
    resolver: zodResolver(updateAgencySchema),
    defaultValues: {
      bio: { vi: '', en: '', cn: '' },
      lat: 0,
      lng: 0,
      address: '',
      gender: 1,
      date_of_birth: '',
    },
    mode: 'onSubmit',
  });
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;
  useEffect(() => {
    if (query.data) {
      const agencyData = query.data;
      reset({
        bio: {
          vi: agencyData.bio?.vi || '',
          en: agencyData.bio?.en || '',
          cn: agencyData.bio?.cn || '',
        },
        lat: agencyData.lat ? Number(agencyData.lat) : 0,
        lng: agencyData.lng ? Number(agencyData.lng) : 0,
        address: agencyData.address || '',
        gender: agencyData.gender,
        date_of_birth: agencyData.date_of_birth || '',
      });
    }
  }, [query.data, reset]);
  const onUpdate = (data: UpdateAgencyFormData) => {
    setLoading(true);
    const payload: any = {
      ...data,
    };

    mutateEditProfile(payload, {
      onSuccess: (res) => {
        toastSuccess({ message: res.message });
        query.refetch();
        goBack();
      },
      onError: (err) => {
        errorToast(err);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  return {
    form,
    onSubmit: handleSubmit(onUpdate),
    errors,
    isSubmitting,
    reset,
    isLoading: query.isLoading,
  };
};
