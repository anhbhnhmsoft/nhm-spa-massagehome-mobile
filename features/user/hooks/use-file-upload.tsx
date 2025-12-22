import { client } from '@/lib/axios-client';

export type FileUploadOptions = {
  type?: number;
  isPublic?: boolean;
};

export const useFileUpload = () => {
  const uploadFile = async (
    uri: string,
    options?: FileUploadOptions
  ): Promise<{ file_path: string; is_public: boolean }> => {
    const formData = new FormData();
    // @ts-ignore: React Native File type
    formData.append('file', {
      uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    if (typeof options?.type === 'number') {
      formData.append('type', String(options.type));
    }

    const isPublic = options?.isPublic ?? false;
    formData.append('is_public', String(isPublic ? 1 : 0));

    const response = await client.post('/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      file_path: response.data.data.file_path as string,
      is_public: isPublic,
    };
  };

  return { uploadFile };
};

