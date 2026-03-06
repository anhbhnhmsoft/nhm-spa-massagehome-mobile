import {
  useInfiniteListManageKTV,
} from '@/features/user/hooks/use-query';
import { useMemo, } from 'react';

export * from './use-get-list-ktv-homepage';
export * from './use-get-list-ktv';
export * from './use-go-detail-ktv';
export * from './use-detail-ktv';
export * from './use-register-technical';
export * from './use-check-partner-register';
export * from './use-register-agency';



export const useGetListKTVManager = () => {
  const query = useInfiniteListManageKTV({
    filter: {},
    page: 1,
    per_page: 10,
  });

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



