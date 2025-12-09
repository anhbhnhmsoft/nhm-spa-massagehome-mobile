import { useTranslation } from 'react-i18next';
import ErrorAPIServer from '@/lib/types';
import useToast from '@/features/app/hooks/use-toast';

const useErrorToast = () => {
  const {error} = useToast();
  const {t} = useTranslation();
  return (err: Error | ErrorAPIServer | any) => {
    if (err){
      if (err instanceof ErrorAPIServer) {
        if (err.validateError) {
          const validationErrors = err.validateError;
          const firstKey = Object.keys(validationErrors)[0];
          const firstValue = validationErrors[firstKey];
          error({
            message: firstValue[0],
          });
        } else if (err.message) {
          error({
            message: err.message,
          });
        }
      } else {
        error({
          message: t('common_error.unknown_error'),
        });
      }
    }
  };
}

export default useErrorToast;