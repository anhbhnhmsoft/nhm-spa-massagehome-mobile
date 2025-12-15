import { AddressItem } from '@/features/location/types';
import { create } from 'zustand';

export interface IStoreLocation {
  item_address: AddressItem | null;
  refresh_list: boolean;
  setItemAddress: (address: AddressItem | null) => void;
  setRefreshList: (refresh: boolean) => void;
}

const useStoreLocation = create<IStoreLocation>((set) => ({
  item_address: null,
  refresh_list: false,
  setItemAddress: (address) => set({ item_address: address }),
  setRefreshList: (refresh) => set({ refresh_list: refresh }),
}));

export default useStoreLocation;
