import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>booking_details</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
