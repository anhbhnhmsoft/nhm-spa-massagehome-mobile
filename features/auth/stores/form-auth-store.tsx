import { create } from 'zustand';

export interface IFormAuthStore {
  phone_authenticate: string | null;
  case_verify_otp: "register" | "forgot_password" | null;
  last_sent_at: string | null;
  retry_after_seconds: number | null;

  updateState: (data: Partial<IFormAuthStore>) => void;
  resetState: () => void;
}

export const useFormAuthStore = create<IFormAuthStore>((set) => ({
  phone_authenticate: null,
  case_verify_otp: null,
  last_sent_at: null,
  retry_after_seconds: null,

  updateState: (data) => set(data),
  resetState: () => set({
    phone_authenticate: null,
    case_verify_otp: null,
    last_sent_at: null,
    retry_after_seconds: null,
  }),
}));
