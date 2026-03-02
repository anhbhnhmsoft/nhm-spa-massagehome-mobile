import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

export interface AppBottomSheetProps {
  /** Nội dung bên trong Bottom Sheet */
  children: React.ReactNode;
  /** Các mốc chiều cao. Ví dụ: ['25%', '50%'] hoặc [200, 500] */
  snapPoints?: Array<string | number>;
  /** Bật true nếu nội dung bên trong dài và cần cuộn */
  isScrollable?: boolean;
  /** Cho phép vuốt xuống để đóng sheet không? (Mặc định: true) */
  enablePanDownToClose?: boolean;
  /** Hàm được gọi khi sheet đã đóng hoàn toàn */
  onDismiss?: () => void;
}

// 2. Gắn type cho forwardRef <Type của Ref, Type của Props>
const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>((props, ref) => {
  const {
    children,
    snapPoints: customSnapPoints,
    isScrollable = false,
    enablePanDownToClose = true,
    onDismiss,
  } = props;

  const snapPoints = useMemo(
    () => customSnapPoints || ['30%', '50%'],
    [customSnapPoints]
  );

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.6}
      />
    ),
    []
  );


  // Trả về component cuộn hoặc không cuộn
  const ContentWrapper = isScrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={enablePanDownToClose}
      onDismiss={onDismiss}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <ContentWrapper contentContainerStyle={styles.contentContainer}>
        {children}
      </ContentWrapper>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
  },
  indicator: {
    backgroundColor: '#DDDDDD',
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
});

export default AppBottomSheet;