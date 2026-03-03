// Lấy danh sách dịch vụ
import { useKtvStore } from '@/features/ktv/stores';
import { useAllCategoriesQuery } from '@/features/ktv/hooks/use-query';
import { useEffect } from 'react';

export const useListServices = () => {
  const reloadListService = useKtvStore((state) => state.reload_list_service);
  const setReloadListService = useKtvStore((state) => state.setReloadListService);

  const query = useAllCategoriesQuery();

  // Lấy lại danh sách dịch vụ khi reloadListService thay đổi
  useEffect(() => {
    if (reloadListService) {
      query.refetch();
      setReloadListService(false);
    }
  }, [reloadListService, setReloadListService]);

  return query;
};