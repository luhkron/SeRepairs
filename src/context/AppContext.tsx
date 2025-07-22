import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { useAuth } from './AuthContext';
import { isIOS } from '../utils/helpers';

type ThemeMode = 'light' | 'dark' | 'system';

type AppContextType = {
  // Theme
  themeMode: ThemeMode;
  isDarkMode: boolean;
  toggleTheme: (mode?: ThemeMode) => void;
  
  // Notifications
  notificationPermission: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  
  // Location
  locationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location.LocationObject | null>;
  
  // App State
  appState: AppStateStatus;
  isForeground: boolean;
  isOnline: boolean;
  
  // Device Info
  deviceInfo: {
    platform: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'default';
    osVersion: string | null;
    deviceName: string | null;
    isTablet: boolean;
    isEmulator: boolean;
  };
  
  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Error Handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // App Version
  appVersion: string;
  buildNumber: string;
};

// Create context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Configure notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Permission states
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  
  // App state
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isForeground, setIsForeground] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Loading and error states
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Device info
  const [deviceInfo, setDeviceInfo] = useState({
    platform: Platform.OS as 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'default',
    osVersion: Platform.Version ? String(Platform.Version) : null,
    deviceName: null as string | null,
    isTablet: false,
    isEmulator: false,
  });
  
  // App version
  const appVersion = '1.0.0';
  const buildNumber = '1';
  
  // Load initial data
  useEffect(() => {
    loadInitialData();
    setupAppStateListener();
    setupNetworkListener();
    
    return () => {
      // Cleanup listeners if needed
    };
  }, [isAuthenticated]);
  
  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load theme preference from storage
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }
      
      // Check notification permission
      const { status: notifStatus } = await Notifications.getPermissionsAsync();
      setNotificationPermission(notifStatus === 'granted');
      
      // Check location permission
      const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');
      
      // Load device info
      const deviceName = await (async () => {
        if (isIOS()) {
          return await Device.getDeviceTypeAsync().then(type => {
            const types = {
              [Device.DeviceType.PHONE]: 'iPhone',
              [Device.DeviceType.TABLET]: 'iPad',
              [Device.DeviceType.DESKTOP]: 'Mac',
              [Device.DeviceType.TV]: 'Apple TV',
              [Device.DeviceType.UNKNOWN]: 'Unknown Device',
            };
            return types[type] || 'Unknown Device';
          });
        } else {
          return Device.modelName || 'Android Device';
        }
      })();
      
      setDeviceInfo({
        ...deviceInfo,
        deviceName,
        isTablet: await Device.isDeviceType(Device.DeviceType.TABLET),
        isEmulator: !Device.isDevice,
      });
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load app data');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up app state listener
  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  };
  
  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    setAppState(nextAppState);
    setIsForeground(nextAppState === 'active');
    
    // Handle specific state changes
    if (nextAppState === 'active') {
      // App has come to the foreground
      // You can add any logic that needs to run when the app becomes active
    } else if (nextAppState === 'background') {
      // App has gone to the background
    }
  };
  
  // Set up network listener
  const setupNetworkListener = () => {
    // In a real app, you would use NetInfo from @react-native-community/netinfo
    // For this example, we'll simulate it
    const handleConnectivityChange = (isConnected: boolean) => {
      setIsOnline(isConnected);
      if (!isConnected) {
        setError('No internet connection');
      }
    };
    
    // Simulate network connectivity changes
    const interval = setInterval(() => {
      // In a real app, you would check actual network status
      const isConnected = Math.random() > 0.1; // 90% chance of being online
      handleConnectivityChange(isConnected);
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  };
  
  // Toggle theme
  const toggleTheme = useCallback((mode?: ThemeMode) => {
    const newMode = mode || (themeMode === 'light' ? 'dark' : 'light');
    setThemeMode(newMode);
    
    // Save to storage
    AsyncStorage.setItem('theme_preference', newMode);
    
    // Update dark mode based on theme preference
    if (newMode === 'system') {
      // In a real app, you would use the system theme
      const systemPrefersDark = false; // This would come from Appearance API in a real app
      setIsDarkMode(systemPrefersDark);
    } else {
      setIsDarkMode(newMode === 'dark');
    }
  }, [themeMode]);
  
  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotificationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);
  
  // Request location permission
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }, []);
  
  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<Location.LocationObject | null> => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Could not get your location. Please check your permissions.');
      return null;
    }
  }, [requestLocationPermission]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Context value
  const value = {
    // Theme
    themeMode,
    isDarkMode,
    toggleTheme,
    
    // Notifications
    notificationPermission,
    requestNotificationPermission,
    
    // Location
    locationPermission,
    requestLocationPermission,
    getCurrentLocation,
    
    // App State
    appState,
    isForeground,
    isOnline,
    
    // Device Info
    deviceInfo,
    
    // Loading States
    isLoading,
    setLoading,
    
    // Error Handling
    error,
    setError,
    clearError,
    
    // App Version
    appVersion,
    buildNumber,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
