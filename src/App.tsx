import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from 'styled-components/native';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportIssueScreen from './src/screens/reports/ReportIssueScreen';
import ReportDetailScreen from './src/screens/reports/ReportDetailScreen';

// Theme
import theme from './src/theme';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default App;
