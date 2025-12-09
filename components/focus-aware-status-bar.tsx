import {useIsFocused} from '@react-navigation/native';
import * as React from 'react';
import {Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';

const FocusAwareStatusBar = ({hidden = false}: { hidden?: boolean }) => {
  const isFocused = useIsFocused();

  if (Platform.OS === 'web') return null;

  return isFocused ? <StatusBar hidden={hidden} style={"light"} /> : null;
};
export default FocusAwareStatusBar;