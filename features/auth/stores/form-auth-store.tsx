import { create } from 'zustand';

export interface IFormAuthStore {
  phone_authenticate: string | null;

  last_sent_at: string | null;
  retry_after_seconds: number | null;

  updateState: (data: Partial<IFormAuthStore>) => void;

}

export const useFormAuthStore = create<IFormAuthStore>((set) => ({
  phone_authenticate: null,
  last_sent_at: null,
  retry_after_seconds: null,

  updateState: (data) => set(data),
}));
