import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StaffProvider } from './src/context/StaffContext';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StaffProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </StaffProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
