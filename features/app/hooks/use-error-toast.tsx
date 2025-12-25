import { useTranslation } from 'react-i18next';
import ErrorAPIServer from '@/lib/types';
import useToast from '@/features/app/hooks/use-toast';
import { getMessageError } from '@/lib/utils';

const useErrorToast = () => {
  const {error} = useToast(false);
  const {t} = useTranslation();
  return (err: Error | ErrorAPIServer | any) => {
    const message = getMessageError(err, t);
    if (!message) {
      return;
    }
    error({
      message,
    });
  };
}

export default useErrorToast;