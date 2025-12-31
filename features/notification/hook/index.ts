import { useCallback, useMemo } from 'react';
import { useNotificationQuery } from './use-query';
import { useReadNotificationMutation } from './use-mutation';
import useApplicationStore from '@/lib/store';

export const useNotificationScreen = () => {
  const setLoading = useApplicationStore((state) => state.setLoading);
  const query = useNotificationQuery();
  const useReadNotification = useReadNotificationMutation();
  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);
  const handleReadNotification = useCallback((id: string) => {
    setLoading(true);
    useReadNotification.mutate(id, {
      onSuccess: () => {
        query.refetch();
      },
      onError: (err) => {
        console.log(err);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  }, []);
  return { ...query, data, handleReadNotification };
};
