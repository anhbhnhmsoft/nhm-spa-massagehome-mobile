import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999999,
  },
  outerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleRing: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#2B7BBE',
    borderTopColor: 'rgba(156, 163, 175, 0.4)',
    borderRightColor: 'rgba(156, 163, 175, 0.4)',
  },
  middleRing: {
    borderWidth: 2.5,
    borderColor: '#2B7BBE',
    borderTopColor: 'rgba(156, 163, 175, 0.3)',
    borderLeftColor: 'rgba(156, 163, 175, 0.3)',
  },
  innerRing: {
    borderWidth: 2,
    borderColor: '#2B7BBE',
    borderBottomColor: 'rgba(156, 163, 175, 0.3)',
    borderRightColor: 'rgba(156, 163, 175, 0.3)',
  },
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const FullScreenLoading = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      {/* Vòng tròn ngoài cùng */}
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 3000,
          easing: Easing.linear,
          loop: true,
        }}
        style={styles.outerCircle}
      >
        <View style={styles.circleRing} />
      </MotiView>

      {/* Vòng tròn giữa */}
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '-360deg' }}
        transition={{
          type: 'timing',
          duration: 2500,
          easing: Easing.linear,
          loop: true,
        }}
        style={styles.middleCircle}
      >
        <View style={[styles.circleRing, styles.middleRing]} />
      </MotiView>

      {/* Vòng tròn trong */}
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 2000,
          easing: Easing.linear,
          loop: true,
        }}
        style={styles.innerCircle}
      >
        <View style={[styles.circleRing, styles.innerRing]} />
      </MotiView>

      {/* Logo ở giữa với hiệu ứng pulse nhẹ */}
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1.2 }}
        transition={{
          type: 'timing',
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          loop: true,
        }}
        style={styles.logoContainer}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 60, height: 60 }}
          resizeMode="contain"
        />
      </MotiView>
    </View>
  );
};

export default FullScreenLoading;
