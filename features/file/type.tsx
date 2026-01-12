import { ResponseDataSuccessType } from '@/lib/types';

export type TermOfUseResponse = ResponseDataSuccessType<{
  type: number;
  file: string;
  slug: string;
  note: string;
}>;
