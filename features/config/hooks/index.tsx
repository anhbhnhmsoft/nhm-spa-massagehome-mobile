import useConfigStore from '@/features/config/stores';
import { useState } from 'react';
import { useGetListSupportChanel } from '@/features/config/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useApplicationStore from '@/lib/store';


export const useGetSupport = () => {
  const supportChanel = useConfigStore(state => state.support_chanel);
  const setSupportChanel = useConfigStore(state => state.setSupportChanel);
  const [visible, setVisible] = useState(false);
  const { mutate: getListSupportChanel } = useGetListSupportChanel();
  const handleError = useErrorToast();
  const setLoading = useApplicationStore(state => state.setLoading);

  const openSupportModal = () => {
    if (supportChanel){
      setVisible(true);
    }
    else{
      setLoading(true);
      getListSupportChanel(undefined, {
        onSuccess: (res) => {
          setSupportChanel(res.data);
          setVisible(true);
        },
        onError: (err) => {
          handleError(err);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  const closeSupportModal = () => {
    setVisible(false);
  };

  return {
    supportChanel,
    visible,
    openSupportModal,
    closeSupportModal,
  };
};
