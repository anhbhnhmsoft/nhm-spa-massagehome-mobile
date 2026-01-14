import { create } from 'zustand';
import { UserReferral } from '@/features/affiliate/types';

type ReferralStore = {
  user_referral?: UserReferral;
  setUserReferral: (data: UserReferral) => void;
  clearUserReferral: () => void;
};

export const useReferralStore = create<ReferralStore>((set) => ({
  user_referral: undefined,

  setUserReferral: (data) =>
    set(() => ({
      user_referral: data,
    })),

  clearUserReferral: () =>
    set(() => ({
      user_referral: undefined,
    })),
}));
