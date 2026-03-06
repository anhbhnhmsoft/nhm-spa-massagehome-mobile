import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

export interface AppBottomSheetProps {
  children: React.ReactNode;
  /** Nếu truyền snapPoints thì dùng cố định, nếu không truyền sẽ tự động Fit Content */
  snapPoints?: Array<string | number>;
  isScrollable?: boolean;
  enablePanDownToClose?: boolean;
  onDismiss?: () => void;
  /** Bật tính năng tự động giãn theo nội dung (Mặc định: true nếu không có snapPoints) */
  dynamicSizing?: boolean;
}

const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>((props, ref) => {
  const {
    children,
    snapPoints: customSnapPoints,
    isScrollable = false,
    enablePanDownToClose = true,
    onDismiss,
    dynamicSizing = true,
  } = props;

  // Nếu có snapPoints thì dùng, nếu không thì để undefined để kích hoạt dynamic sizing
  const snapPoints = useMemo(
    () => customSnapPoints || undefined,
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

  const ContentWrapper = isScrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheetModal
      ref={ref}
      // Quan trọng: Nếu không có snapPoints, enableDynamicSizing phải là true
      enableDynamicSizing={!customSnapPoints && dynamicSizing}
      snapPoints={snapPoints}
      index={customSnapPoints ? 0 : undefined}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={enablePanDownToClose}
      onDismiss={onDismiss}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
      // Hỗ trợ bàn phím khi dùng Form
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="fillParent"
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
    paddingBottom: 40, // Tăng padding bottom để ko bị dính sát lề
  },
});

export default AppBottomSheet;