import React, { useEffect, useMemo } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native core',
]);

// Load any resources or data that we need prior to rendering the app
async function loadResourcesAsync() {
  await Promise.all([
    // Load fonts
    Font.loadAsync({
      'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    }),
  ]);
}

// Handle loading errors
function handleLoadingError(error: Error) {
  // In a real app, you might want to provide a more user-friendly error message
  // and potentially log the error to an error reporting service
  console.warn('Error loading resources:', error);
}

// Main App Component
const App = () => {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await loadResourcesAsync();
      } catch (e) {
        handleLoadingError(e as Error);
      } finally {
        setLoadingComplete(true);
        await SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const paperTheme = useMemo(() => ({
    ...theme,
    // Add any theme overrides here
  }), []);

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor="transparent" 
              translucent 
            />
            <AppNavigator />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
