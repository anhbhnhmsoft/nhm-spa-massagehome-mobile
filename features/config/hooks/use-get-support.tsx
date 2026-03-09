import useConfigStore from '@/features/config/stores';
import { useState } from 'react';
import { useGetListSupportChanel } from '@/features/config/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useApplicationStore } from '@/features/app/stores';



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
      setVisible(true);
      getListSupportChanel(undefined, {
        onSuccess: (res) => {
          setSupportChanel(res.data);
        },
        onError: (err) => {
          handleError(err);
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