import { useMemo } from 'react';
import { useListKtvQuery } from './use-query';

export const useHomeAgency = () => {
  const query = useListKtvQuery();
  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);
  return { ...query, data };
};
