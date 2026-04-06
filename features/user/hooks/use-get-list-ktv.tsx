import { useKTVSearchStore } from '@/features/user/stores';
import { useInfiniteListKTV } from '@/features/user/hooks/use-query';
import { useMemo } from 'react';

/**
 * Dùng để lấy list KTV theo filter
 */
export const useGetListKTV = () => {
  const params = useKTVSearchStore((state) => state.params);
  const setFilter = useKTVSearchStore((state) => state.setFilter);

  const query = useInfiniteListKTV(params);

  const data = useMemo(() => {
    return query.data?.pages?.flatMap((page) => page?.data?.data || []) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
    setFilter,
    params,
  };
};