import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import AppText from '@/components/app-text';
import ProgressBar from '@/components/process-bar';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import { AuthGate } from '@/features/auth/gates/auth-gate';

const SplashScreen = () => {
  const {t} = useTranslation();

  return (
    <AuthGate redirectTo={"/(app)"} gateCases={['initial_app']}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>

          {/* Top Spacer */}
          <View style={styles.spacer} />

          {/* Brand Identity Section */}
          <View
            style={styles.brandSection}
          >
            {/* Logo Spa */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
              />
            </View>

            {/* Progress Bar Container */}
            <View style={styles.progressBarBackground}>
              <ProgressBar mode={"loop"} color={DefaultColor.base['primary-color-1']} />
            </View>
          </View>

          {/* Status Text Section */}
          <View style={styles.statusSection}>
            <AppText weight={"700"} style={styles.loadingText}>
              {t('common.loading')}
            </AppText>
          </View>

        </View>
      </SafeAreaView>
    </AuthGate>
  );
};

export default SplashScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
  },
  spacer: {
    height: 64,
  },
  brandSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoImage: {
      width: 120,
      height: 120,
  },
  progressBarBackground: {
    width: 192,
  },
  statusSection: {
    marginBottom: 48,
  },
  loadingText: {
    color: DefaultColor.base['primary-color-1'],
    fontSize: 18,
    letterSpacing: 2,
  },
});

