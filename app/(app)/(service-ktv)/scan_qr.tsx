import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScanQRCodeKtv } from '@/features/ktv/hooks';

export default function ScanQrScreen() {
  const router = useRouter();
  const [torch, setTorch] = useState(false);
  const { t } = useTranslation();
  const { isScanning, startScan, stopScan, onBarcodeScanned, hasPermission } = useScanQRCodeKtv();
  useEffect(() => {
    startScan();
    return () => stopScan();
  }, []);

  if (hasPermission === null) return <View className="flex-1 bg-black" />;
  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-6">
        <Text className="text-center text-white">{t('permission.camera.message')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject} // Đảm bảo full màn hình
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={isScanning ? onBarcodeScanned : undefined}
      />

      {/* Overlay UI */}
      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <X color="white" size={24} />
          </TouchableOpacity>

          <Text className="font-inter-bold text-lg text-white">{t('qr_scan.scan_qr')}</Text>

          <TouchableOpacity
            onPress={() => setTorch(!torch)}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
            {torch ? <Zap color="#fbbf24" size={24} /> : <ZapOff color="white" size={24} />}
          </TouchableOpacity>
        </View>

        {/* Khung quét trung tâm */}
        <View className="flex-1 items-center justify-center">
          <View className="h-64 w-64 items-center justify-center">
            {/* Góc khung quét (Tùy chọn trang trí) */}
            <View style={styles.scannerFrame} />

            <Text className="absolute -bottom-16 w-64 text-center font-inter-medium text-white/80">
              {t('qr_scan.scan_title')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff80',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
});
