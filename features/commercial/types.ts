import { ResponseDataSuccessType } from '@/lib/types';


export type BannerItem = {
  id: string;
  image_url: string;
}

export type BannerResponse = ResponseDataSuccessType<BannerItem[]>;