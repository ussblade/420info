import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './themes';
import { TabNavigator } from './navigation/TabNavigator';

function ThemedApp() {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.statusBar === 'light',
        colors: {
          primary: theme.primary,
          background: theme.bg,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.accent,
        },
        fonts: {
          regular: { fontFamily: theme.fontBody, fontWeight: '400' },
          medium: { fontFamily: theme.fontBody, fontWeight: '500' },
          bold: { fontFamily: theme.fontDisplay, fontWeight: '700' },
          heavy: { fontFamily: theme.fontDisplay, fontWeight: '900' },
        },
      }}
    >
      <StatusBar style={theme.statusBar} backgroundColor={theme.headerBg} />
      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
