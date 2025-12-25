import React, { useRef, useEffect } from 'react';
import { Text, Animated, StyleSheet, TouchableOpacity, ModalProps, Modal } from 'react-native';
import { create } from 'zustand';
import { AnimatePresence, MotiView } from 'moti';
import DefaultColor from '@/components/styles/color';

// Store Zustand để quản lý toast config
type ToastType = 'success' | 'error' | 'warn' | 'info';
type ToastParams = { title?: string; message: string };
interface ModalToastState {
  toastConfig: { type: ToastType; title?: string; message: string } | null;
  show: (type: ToastType, params: ToastParams) => void;
  hide: () => void; // Hàm này để reset store sau khi animation xong
}
export const useModalToastStore = create<ModalToastState>((set) => ({
  toastConfig: null,
  show: (type, params) => set({ toastConfig: { type, ...params } }),
  hide: () => set({ toastConfig: null }),
}));



// Modal Toast Manager
interface BaseModalProps extends ModalProps {
  children: React.ReactNode;
}
const getBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success': return DefaultColor.green[500];
    case 'error': return DefaultColor.red[500];
    case 'warn': return DefaultColor.yellow[500];
    case 'info': return DefaultColor.blue[500];
    default: return DefaultColor.gray[300];
  }
};

export const ModalToast = ({ children, visible, ...props }: BaseModalProps) => {
  // Lấy state từ Zustand
  const toastConfig = useModalToastStore((state) => state.toastConfig);
  const hide = useModalToastStore((state) => state.hide);

  // Logic tự động ẩn sau 2.5s khi toastConfig có giá trị
  useEffect(() => {
    let timer: number| null = null;
    if (toastConfig) {
      timer = setTimeout(() => {
        hide();
      }, 2500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [toastConfig, hide]);

  return (
    <Modal visible={visible} {...props}>
      {children}

      {/* AnimatePresence giúp chạy animation Exit khi toastConfig trở về null */}
      <AnimatePresence>
        {toastConfig && (
          <MotiView
            from={{
              opacity: 0,
              translateY: -100,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              translateY: -100,
              scale: 0.9
            }}
            transition={{
              type: 'spring',
              damping: 100,    // Độ nảy (càng thấp càng nảy)
              stiffness: 2000, // Độ cứng (càng cao càng nhanh)
            }}
            style={[
              styles.toastContainer,
              { backgroundColor: getBackgroundColor(toastConfig.type) }
            ]}
          >
            <TouchableOpacity onPress={hide} activeOpacity={0.9}>
              {toastConfig.title && <Text style={styles.title}>{toastConfig.title}</Text>}
              <Text style={styles.message}>{toastConfig.message}</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40, // Cách top an toàn một chút
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    zIndex: 99999,
    elevation: 10, // Shadow cho Android
    shadowColor: DefaultColor.gray[800], // Shadow cho iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
  }
});