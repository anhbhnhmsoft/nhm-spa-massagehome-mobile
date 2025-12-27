import { create } from 'zustand';
import { ServiceDetailItem } from '@/features/ktv/types';
import { ServiceItem } from '@/features/service/types';


interface IKtvStore {
  reload_list_service: boolean;
  service_edit: ServiceDetailItem | null;
  service_detail: ServiceItem | null;

  setReloadListService: (reload: boolean) => void;
  setServiceEdit: (service: ServiceDetailItem | null) => void,
  setServiceDetail: (service: ServiceItem | null) => void,
}

export const useKtvStore = create<IKtvStore>((set) => ({
  reload_list_service: false,
  service_edit: null,
  service_detail: null,

  setReloadListService: (reload) => set({ reload_list_service: reload }),
  setServiceEdit: (service) => set({ service_edit: service }),
  setServiceDetail: (service) => set({ service_detail: service }),
}));
