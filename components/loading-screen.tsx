import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import AppText from '@/components/app-text';
import ProgressBar from '@/components/process-bar';
import DefaultColor from '@/components/styles/color';

interface FullScreenLoadingProps {
  /** Trạng thái hiển thị của màn hình loading */
  visible: boolean;
  /** Câu thông báo hiển thị dưới loading (Mặc định: "Đang tải dữ liệu...") */
  text?: string;
  /** Loại hiệu ứng loading: dùng ProgressBar của bạn hoặc vòng xoay mặc định */
  type?: 'progressbar' | 'spinner';
}

const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
                                                               visible,
                                                               text = 'Đang tải dữ liệu...',
                                                               type = 'progressbar',
                                                             }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      // Ngăn chặn việc đóng Modal bằng nút Back vật lý trên Android
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.loadingBox}>
          {/* Hiển thị hiệu ứng loading */}
          {type === 'progressbar' ? (
            <View style={styles.progressBarContainer}>
              <ProgressBar mode="loop" height={6} color={DefaultColor.base['primary-color-1']} trackColor="#f0f0f0" />
            </View>
          ) : (
            <ActivityIndicator size="large" color="#3498db" />
          )}

          {/* Hiển thị Text bằng component AppText dùng chung */}
          <AppText weight="700" style={styles.loadingText}>
            {text}
          </AppText>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền tối mờ, che phủ toàn màn hình
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    // Đổ bóng cho Box (hoạt động trên cả iOS và Android)
    shadowColor: DefaultColor.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBarContainer: {
    width: 200,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: DefaultColor.black,
    textAlign: 'center',
  },
});

export default FullScreenLoading;