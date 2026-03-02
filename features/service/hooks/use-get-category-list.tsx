import { CategoryListFilterPatch, CategoryListRequest } from '@/features/service/types';
import { useImmer } from 'use-immer';
import { useCallback, useMemo } from 'react';
import { useInfiniteCategoryList } from '@/features/service/hooks/use-query';

/**
 * Lấy danh sách danh mục dịch vụ
 * @param initialParams
 * @param isFeature
 */
export const useGetCategoryList = (
  initialParams: Omit<CategoryListRequest, 'filter'>,
  isFeature?: boolean
) => {
  // Sử dụng useImmer để quản lý params (chứa filter)
  const [params, setParams] = useImmer<CategoryListRequest>({
    ...initialParams,
    filter: {
      keyword: '',
      is_featured: isFeature === true ? true : undefined,
    },
  });
  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: CategoryListFilterPatch) => {
      setParams((draft) => {
        draft.page = 1;
        // Merge filter mới vào draft.filter
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams]
  );

  const query = useInfiniteCategoryList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
    params,
    setFilter,
  };
};