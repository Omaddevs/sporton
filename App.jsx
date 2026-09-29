import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// Webda butun ilova uchun Inter (sans-serif) shriftini ulaymiz; native'da tizim sans shrifti ishlatiladi
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('app-font')) {
  const link = document.createElement('link');
  link.id = 'app-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400..900&display=swap';
  document.head.appendChild(link);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
