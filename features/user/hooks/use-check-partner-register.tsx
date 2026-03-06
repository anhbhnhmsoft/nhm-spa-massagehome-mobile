import { useQueryCheckApplyPartner } from '@/features/user/hooks/use-query';
import { useEffect, useState } from 'react';
import useToast from '@/features/app/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { goBack } from '@/lib/utils';
import { useApplicationStore } from '@/features/app/stores';


export const useCheckPartnerRegister = () => {
  const {t} = useTranslation();
  const queryCheck = useQueryCheckApplyPartner();
  const [showForm, setShowForm] = useState<boolean>(false);
  const { error: errorToast} = useToast();

  // Lấy dữ liệu từ check review application
  useEffect(() => {
    // Nếu có thể apply, show form
    setShowForm(Boolean(queryCheck.data?.can_apply));

    if (queryCheck.isError) {
      errorToast({ message: t('profile.partner_form.error_check_application') });
      goBack();
    }
  }, [queryCheck.data, queryCheck.isError, t]);

  return {
    showForm,
    reviewApplication: queryCheck.data?.review_application || null,
  };
}