import { useTranslation } from 'react-i18next';
import { useConfigScheduleQuery } from '@/features/ktv/hooks/use-query';
import useToast from '@/features/app/hooks/use-toast';
import { useApplicationStore } from '@/features/app/stores';
import { useUpdateConfigScheduleMutation } from '@/features/ktv/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { EditConfigScheduleRequest } from '@/features/ktv/types';
import { _DefaultValueFormConfigSchedule, _KTVConfigSchedules } from '@/features/ktv/consts';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { router } from 'expo-router';

export const useConfigSchedule = () => {
  const { t } = useTranslation();

  const query = useConfigScheduleQuery();

  const { error: errorToast, success } = useToast();

  const setLoading = useApplicationStore((state) => state.setLoading);

  const { mutate } = useUpdateConfigScheduleMutation();

  const form = useForm<EditConfigScheduleRequest>({
    defaultValues: _DefaultValueFormConfigSchedule,
    resolver: zodResolver(
      z.object({
        is_working: z.boolean(),
        working_schedule: z.array(
          z.object({
            day_key: z.enum(_KTVConfigSchedules, {
              error: t('config_schedule.error.invalid_day'),
            }),
            start_time: z.string().min(5),
            end_time: z.string().min(5),
            active: z.boolean(),
          })
            .refine(
              (data) => {
                // Nếu ngày đó TẮT (không làm) -> Không cần check -> Luôn đúng
                if (!data.active) return true;
                const start = dayjs(data.start_time, 'HH:mm');
                const end = dayjs(data.end_time, 'HH:mm');
                // Kiểm tra xem giờ bắt đầu và kết thúc có hợp lệ không
                if (!start.isValid() || !end.isValid()) return false;

                // Giờ bắt đầu không được trùng giờ kết thúc
                return !start.isSame(end);
              },
              {
                message: t('config_schedule.error.invalid_time_end'),
                path: ['end_time'],
              },
            ),
        ),
      }),
    ),
  });

  // Lấy dữ liệu cấu hình lịch làm việc khi component mount
  useEffect(() => {
    if (query.data) {
      const data = query.data;
      form.setValue('is_working', data.is_working);
      form.setValue('working_schedule', data.working_schedule);
    }
  }, [query.data]);

  // Xử lý lỗi khi gọi API
  useEffect(() => {
    if (query.isError) {
      errorToast({ message: t('config_schedule.error.something_went_wrong') });
      router.back();
    }
  }, [query.isError]);

  const onSubmit = form.handleSubmit((data: EditConfigScheduleRequest) => {
    setLoading(true);
    mutate(data, {
      onSuccess: (res) => {
        success({ message: res.message });
      },
      onError: (err) => {
        errorToast({ message: err.message });
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  });

  return {
    query,
    form,
    onSubmit,
    loadingSave: form.formState.isSubmitting,
  };
};