import { Toast } from 'toastify-react-native';
import { useCallback } from "react";
import { ToastShowParams } from "toastify-react-native/utils/interfaces";
import { useModalToastStore } from '@/components/toast-manger-modal';

type SetMessage = {
  title?: string,
  message: string,
}

type ToastOptions = Omit<ToastShowParams, 'type' | 'text1' | 'text2'>;

const defaultAppOptions: ToastOptions = {
  position: 'top',
  visibilityTime: 3000,
  autoHide: true,
  onPress: () => Toast.hide(),
};

const useToast = (forModal: boolean = false) => {
  // 2. Lấy hàm show từ Zustand Store
  // Zustand hook có thể dùng ở bất cứ đâu (trong/ngoài modal đều được)
  const showModalToast = useModalToastStore((state) => state.show);

  const show = useCallback((type: 'success' | 'error' | 'warn' | 'info', set: SetMessage) => {
    if (forModal) {
      // LOGIC CHO MODAL
      showModalToast(type, set);
    } else {
      // LOGIC CHO APP
      Toast.show({
        type: type,
        text1: set.title,
        text2: set.message,
        ...defaultAppOptions
      });
    }
  }, [forModal, showModalToast]);

  return {
    success: (set: SetMessage) => show('success', set),
    error: (set: SetMessage) => show('error', set),
    warning: (set: SetMessage) => show('warn', set),
    info: (set: SetMessage) => show('info', set),
  };
}

export default useToast;