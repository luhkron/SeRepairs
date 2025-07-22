import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/reports/ReportIssueScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import WorkshopListScreen from '../screens/workshops/WorkshopListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Types
import { 
  RootStackParamList, 
  AuthStackParamList, 
  HomeStackParamList, 
  BottomTabParamList 
} from './types';

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

// Auth Stack Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{
        headerShown: true,
        title: 'Create Account',
        headerBackTitle: 'Back',
      }}
    />
  </AuthStack.Navigator>
);

// Home Stack Navigator
const HomeStackNavigator = () => {
  const theme = useTheme();
  
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitle: 'Back',
      }}
    >
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'My Reports',
        }}
      />
      <HomeStack.Screen 
        name="ReportDetail" 
        component={ReportDetailScreen} 
        options={({ route }) => ({
          title: `Report #${route.params.reportId.toString().padStart(4, '0')}`,
        })}
      />
      <HomeStack.Screen 
        name="ReportIssue" 
        component={ReportIssueScreen} 
        options={{
          title: 'New Report',
        }}
      />
      <HomeStack.Screen 
        name="WorkshopList" 
        component={WorkshopListScreen} 
        options={{
          title: 'Workshops',
        }}
      />
    </HomeStack.Navigator>
  );
};

// Bottom Tab Navigator
const BottomTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      })}
    >
      <BottomTab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen 
        name="Reports" 
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen 
        name="Scan" 
        component={ReportIssueScreen}
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" color={color} size={size * 1.2} />
          ),
          tabBarLabelStyle: {
            marginTop: 0,
          },
        }}
      />
      <BottomTab.Screen 
        name="Workshops" 
        component={WorkshopListScreen}
        options={{
          tabBarLabel: 'Workshops',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="garage" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    // Show a loading screen while checking auth state
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{
      dark: false, // We'll handle dark mode separately
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.error,
      },
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        
        {/* Modal screens that should appear above the tabs */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{
              headerShown: true,
              title: 'Settings',
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
