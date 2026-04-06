import { useInfiniteListKTV } from '@/features/user/hooks/use-query';
import { useMemo } from 'react';

/**
 * Dùng để get list KTV trong màn homepage customer
 * Sắp xếp theo đánh giá trung bình giảm dần
 */
export const useGetListKTVHomepage = () => {
  const query = useInfiniteListKTV({
    filter: {},
    // Sắp xếp theo đánh giá trung bình giảm dần
    sort_by: 'reviews_received_avg_rating',
    direction: 'asc',
    page: 1,
    per_page: 6,
  });
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
  };
};
