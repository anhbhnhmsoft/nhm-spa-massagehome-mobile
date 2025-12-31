import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import HeaderBack from '@/components/header-back';
import { useTermOfUseQuery } from '@/features/auth/hooks/use-query';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermOrUsePdf() {
  const { data, isLoading } = useTermOfUseQuery();
  const [pdfLoading, setPdfLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const source = {
    uri: data?.data?.file,
    cache: true,
  };

  // Loading API
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-base-color-2">
        <ActivityIndicator size="large" color="#044984" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <HeaderBack />

      <Pdf
        source={source}
        trustAllCerts={false}
        style={{ flex: 1, backgroundColor: 'white' }}
        onLoadComplete={() => setPdfLoading(false)}
        onError={(error) => {
          console.log(error);
          setPdfLoading(false);
        }}
      />

      {pdfLoading && (
        <View className="absolute inset-0 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#2B7BBE" />
        </View>
      )}
    </View>
  );
}
