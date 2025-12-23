import { AddressItem, LocationPrimaryUser } from '@/features/location/types';
import { create } from 'zustand';

export interface IStoreLocation {
  item_address: AddressItem | null;
  location_user: LocationPrimaryUser | null;
  refresh_list: boolean;
  setItemAddress: (address: AddressItem | null) => void;
  setRefreshList: (refresh: boolean) => void;
  setLocationUser: (location: LocationPrimaryUser | null) => void;
}

const useStoreLocation = create<IStoreLocation>((set) => ({
  item_address: null,
  refresh_list: false,
  location_user: null,

  setItemAddress: (address) => set({ item_address: address }),
  setRefreshList: (refresh) => set({ refresh_list: refresh }),
  setLocationUser: (location) => set({ location_user: location }),
}));

export default useStoreLocation;
