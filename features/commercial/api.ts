import { client } from '@/lib/axios-client';
import { BannerResponse } from '@/features/commercial/types';


const defaultUri = '/commercial';

const commercialApi = {
  // Lấy danh sách banner
  listBanners: async (): Promise<BannerResponse> => {
    const response = await client.get(`${defaultUri}/banners`);
    return response.data;
  }
}

export default commercialApi;
