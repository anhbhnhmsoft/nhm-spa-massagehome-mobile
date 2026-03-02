import {
  useInfiniteListManageKTV,
} from '@/features/user/hooks/use-query';
import { useCallback, useEffect, useMemo, } from 'react';
import { useGetServiceList } from '@/features/service/hooks';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import { useApplicationStore } from '@/features/app/stores';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { KTVDetail } from '@/features/user/types';
import { goBack } from '@/lib/utils';
import { useUserServiceStore } from '@/features/user/stores';

export * from './use-get-list-ktv-homepage';
export * from './use-get-list-ktv';
export * from './use-go-detail-ktv';
export * from './use-detail-ktv';

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



