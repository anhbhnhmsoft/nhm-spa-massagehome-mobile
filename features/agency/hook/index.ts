import { useMemo } from 'react';
import { useListKtvQuery } from './use-query';
import { t } from 'i18next';

export const useHomeAgency = () => {
  const query = useListKtvQuery();
  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);
  return { ...query, data, totalKtv: query.data?.pages[0].data.meta.total || 0 };
};
