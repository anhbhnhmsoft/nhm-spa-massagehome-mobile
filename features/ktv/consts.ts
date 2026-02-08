import { EditConfigScheduleRequest, ServiceForm } from '@/features/ktv/types';

export const _DefaultValueFormService: ServiceForm = {
  name: {
    vi: '',
    en: '',
    cn: '',
  },
  description: {
    vi: '',
    en: '',
    cn: '',
  },
  category_id: '',
  is_active: true,
  image: {
    uri: '',
    type: '',
    name: '',
  },
};

export enum _KTVConfigSchedules {
  MONDAY = 2,
  TUESDAY = 3,
  WEDNESDAY = 4,
  THURSDAY = 5,
  FRIDAY = 6,
  SATURDAY = 7,
  SUNDAY = 8,
}

export const _KTVConfigSchedulesLabel = {
  [_KTVConfigSchedules.MONDAY]: 'enum.KTVConfigSchedulesLabel.MONDAY',
  [_KTVConfigSchedules.TUESDAY]: 'enum.KTVConfigSchedulesLabel.TUESDAY',
  [_KTVConfigSchedules.WEDNESDAY]: 'enum.KTVConfigSchedulesLabel.WEDNESDAY',
  [_KTVConfigSchedules.THURSDAY]: 'enum.KTVConfigSchedulesLabel.THURSDAY',
  [_KTVConfigSchedules.FRIDAY]: 'enum.KTVConfigSchedulesLabel.FRIDAY',
  [_KTVConfigSchedules.SATURDAY]: 'enum.KTVConfigSchedulesLabel.SATURDAY',
  [_KTVConfigSchedules.SUNDAY]: 'enum.KTVConfigSchedulesLabel.SUNDAY',
} as Readonly<{ [key in _KTVConfigSchedules]: string }>;

export const _DefaultValueFormConfigSchedule: EditConfigScheduleRequest = {
  working_schedule: [
    {
      day_key: _KTVConfigSchedules.MONDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.TUESDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.WEDNESDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.THURSDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.FRIDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.SATURDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
    {
      day_key: _KTVConfigSchedules.SUNDAY,
      start_time: '08:00',
      end_time: '18:00',
      active: true,
    },
  ],
  is_working: false,
};