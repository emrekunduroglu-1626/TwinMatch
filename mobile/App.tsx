import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#111111',
    primary: '#FF6600',
    text: '#FFFFFF',
    border: '#222222',
  },
};

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Keychain/Keystore'dan oturum geri yükleme — başarısız olsa da uygulama açılır.
    bootstrap()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [bootstrap]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b1020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0ea5a4" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
