import { ServiceForm } from '@/features/ktv/types';

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
  options: [],
}