import {
  useInfiniteListReview,
  useQueryListCouponUser,
} from '@/features/service/hooks/use-query';
import {
  CouponUserListRequest,
  ListReviewRequest,
} from '@/features/service/types';
import { useCallback, useEffect, useMemo } from 'react';

import { useImmer } from 'use-immer';

export * from './use-get-category-list';
export * from './use-review';
export * from './use-list-review';
export * from './use-review-translation';


/**
 * Lấy danh sách coupon đã sử dụng của user
 * @param params
 * @param enabled
 */
export const useGetCouponUserList = (params: CouponUserListRequest, enabled?: boolean) => {
  const query = useQueryListCouponUser(params, enabled);

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
  };
};


