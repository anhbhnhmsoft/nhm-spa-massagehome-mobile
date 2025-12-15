import { ListKTVItem, ListKTVRequest } from '@/features/user/types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';


interface IUserServiceStore {
  ktv: ListKTVItem | null;

  setKtv: (ktv: ListKTVItem | null) => void;
}

const useUserServiceStore = create<IUserServiceStore>((set) => ({
  ktv: null,

  setKtv: (ktv) => set({ ktv }),
}));

export default useUserServiceStore;



const INITIAL_PARAMS: ListKTVRequest = {
  filter: {
    keyword: '',
  },
  page: 1,
  per_page: 10,
};

interface IKTVStore {
  params: ListKTVRequest;
  // Actions
  setFilter: (filterPatch: Partial<ListKTVRequest['filter']>) => void;
  setPage: (page: number) => void;
  resetParams: () => void;
}
export const useKTVStore = create<IKTVStore>()(
  immer((set) => ({
    params: INITIAL_PARAMS,
    setFilter: (filterPatch) =>
      set((draft) => {
        draft.params.page = 1;
        draft.params.filter = {
          ...draft.params.filter,
          ...filterPatch,
        };
      }),
    setPage: (page) =>
      set((draft) => {
        draft.params.page = page;
      }),
    resetParams: () =>
      set((draft) => {
        draft.params = INITIAL_PARAMS;
      }),
  }))
);