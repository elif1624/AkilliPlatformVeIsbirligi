import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// React Native Paper tema yapılandırması
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3b82f6',
    accent: '#0ea5e9',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
