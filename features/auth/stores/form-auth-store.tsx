import { create } from 'zustand';
import { _TypeAuthenticate } from '@/features/auth/const';

export interface IFormAuthStore {
  username_authenticate: string | null;
  type_authenticate: _TypeAuthenticate | null;
  case_verify_otp: 'register' | 'forgot_password' | null;
  last_sent_at: string | null;
  retry_after_seconds: number | null;

  updateState: (data: Partial<IFormAuthStore>) => void;
  resetState: () => void;
}

export const useFormAuthStore = create<IFormAuthStore>((set) => ({
  username_authenticate: null,
  type_authenticate: null,
  case_verify_otp: null,
  last_sent_at: null,
  retry_after_seconds: null,

  updateState: (data) => set(data),
  resetState: () =>
    set({
      username_authenticate: null,
      type_authenticate: null,
      case_verify_otp: null,
      last_sent_at: null,
      retry_after_seconds: null,
    }),
}));
