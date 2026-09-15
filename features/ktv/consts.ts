import { TFunction } from 'i18next';
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

// Khớp App\Enums\KtvTechnique phía backend
export enum _KtvTechnique {
  ACUPRESSURE = 1,
  MASSAGE = 2,
  THERAPY = 3,
  STRETCHING = 4,
  AROMA_RELAX = 5,
}

// Dữ liệu cũ trong DB có thể còn lưu mã chuỗi
const _LegacyKtvTechniqueCodes: Record<string, _KtvTechnique> = {
  acupressure: _KtvTechnique.ACUPRESSURE,
  massage: _KtvTechnique.MASSAGE,
  therapy: _KtvTechnique.THERAPY,
  stretching: _KtvTechnique.STRETCHING,
  essential_oil: _KtvTechnique.AROMA_RELAX,
  aroma_relax: _KtvTechnique.AROMA_RELAX,
};

export const normalizeKtvTechniqueIds = (
  values?: (string | number)[] | null
): _KtvTechnique[] => {
  const ids = (values ?? [])
    .map((v) =>
      typeof v === 'string' && v in _LegacyKtvTechniqueCodes ? _LegacyKtvTechniqueCodes[v] : Number(v)
    )
    .filter((v): v is _KtvTechnique => Object.values(_KtvTechnique).includes(v));
  return Array.from(new Set(ids));
};

export const _KtvTechniqueLabels: Record<_KtvTechnique, string> = {
  [_KtvTechnique.ACUPRESSURE]: 'enum.KtvTechnique.acupressure',
  [_KtvTechnique.MASSAGE]: 'enum.KtvTechnique.massage',
  [_KtvTechnique.THERAPY]: 'enum.KtvTechnique.therapy',
  [_KtvTechnique.STRETCHING]: 'enum.KtvTechnique.stretching',
  [_KtvTechnique.AROMA_RELAX]: 'enum.KtvTechnique.aroma_relax',
};

export const _KtvTechniqueMap: Record<
  string | number,
  { labelKey: string; defaultLabel: string }
> = {
  1: { labelKey: 'enum.KtvTechnique.acupressure', defaultLabel: 'Ấn huyệt' },
  acupressure: { labelKey: 'enum.KtvTechnique.acupressure', defaultLabel: 'Ấn huyệt' },

  2: { labelKey: 'enum.KtvTechnique.massage', defaultLabel: 'Xoa bóp' },
  massage: { labelKey: 'enum.KtvTechnique.massage', defaultLabel: 'Xoa bóp' },

  3: { labelKey: 'enum.KtvTechnique.therapy', defaultLabel: 'Trị liệu chuyên sâu' },
  therapy: { labelKey: 'enum.KtvTechnique.therapy', defaultLabel: 'Trị liệu chuyên sâu' },

  4: { labelKey: 'enum.KtvTechnique.stretching', defaultLabel: 'Giãn cơ' },
  stretching: { labelKey: 'enum.KtvTechnique.stretching', defaultLabel: 'Giãn cơ' },

  5: { labelKey: 'enum.KtvTechnique.aroma_relax', defaultLabel: 'Thư giãn tinh dầu' },
  essential_oil: { labelKey: 'enum.KtvTechnique.aroma_relax', defaultLabel: 'Thư giãn tinh dầu' },
  aroma_relax: { labelKey: 'enum.KtvTechnique.aroma_relax', defaultLabel: 'Thư giãn tinh dầu' },
};

export const getKtvTechniqueLabel = (
  key: string | number,
  t: TFunction | ((k: string, defaultVal?: string) => string)
): string => {
  const item = _KtvTechniqueMap[key];
  if (item) {
    return (t as any)(item.labelKey, item.defaultLabel);
  }
  return (t as any)(`admin.ktv_technique.${key}`, String(key));
};


export enum _KtvServiceLocation {
  HOME = 'home',
  HOTEL = 'hotel',
}

export const _KtvServiceLocationLabels: Record<_KtvServiceLocation, string> = {
  [_KtvServiceLocation.HOME]: 'enum.KtvServiceLocation.home',
  [_KtvServiceLocation.HOTEL]: 'enum.KtvServiceLocation.hotel',
};