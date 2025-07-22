import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Linking, Platform } from 'react-native';
import { 
  Text, 
  Title, 
  Button, 
  useTheme, 
  Divider, 
  List, 
  IconButton,
  Menu,
  Portal,
  Dialog,
  TextInput,
  HelperText,
  Avatar,
  Badge,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';
import { useAuth } from '../../context/AuthContext';

// Types
type ThemePreference = 'light' | 'dark' | 'system';
type LanguagePreference = 'en' | 'es' | 'fr' | 'de' | 'auto';

const SettingsScreen = () => {
  const theme = useTheme();
  const { logout } = useAuth();
  
  // App Settings
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>('auto');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricAuthEnabled, setBiometricAuthEnabled] = useState(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState('0 MB');
  
  // UI State
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [clearCacheDialogVisible, setClearCacheDialogVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem('app_settings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setThemePreference(parsedSettings.themePreference || 'system');
          setLanguagePreference(parsedSettings.languagePreference || 'auto');
          setNotificationsEnabled(parsedSettings.notificationsEnabled !== false);
          setBiometricAuthEnabled(parsedSettings.biometricAuthEnabled || false);
          setLocationServicesEnabled(parsedSettings.locationServicesEnabled !== false);
          setAutoSyncEnabled(parsedSettings.autoSyncEnabled !== false);
        }
        
        // Calculate cache size (simplified)
        const keys = await AsyncStorage.getAllKeys();
        const cacheSizeInBytes = keys.reduce((total, key) => {
          // In a real app, you would calculate the actual size of each item
          return total + (key.length * 2); // Rough estimate
        }, 0);
        setCacheSize(`${(cacheSizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings to storage
  const saveSettings = useCallback(async () => {
    try {
      const settings = {
        themePreference,
        languagePreference,
        notificationsEnabled,
        biometricAuthEnabled,
        locationServicesEnabled,
        autoSyncEnabled,
      };
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [themePreference, languagePreference, notificationsEnabled, biometricAuthEnabled, locationServicesEnabled, autoSyncEnabled]);
  
  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);
  
  // Handle theme preference change
  const handleThemeChange = (value: string) => {
    setThemePreference(value as ThemePreference);
    // In a real app, you would update the theme here
    // e.g., dispatch an action to update the theme in your state management
  };
  
  // Handle language preference change
  const handleLanguageChange = (value: string) => {
    setLanguagePreference(value as LanguagePreference);
    // In a real app, you would update the language here
  };
  
  // Handle notifications toggle
  const toggleNotifications = async (value: boolean) => {
    if (value) {
      // Request notification permissions if enabling
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    }
    setNotificationsEnabled(value);
  };
  
  // Handle biometric auth toggle
  const toggleBiometricAuth = async (value: boolean) => {
    // In a real app, you would check if biometric auth is available
    // and request the necessary permissions
    if (value) {
      Alert.alert(
        'Enable Biometric Authentication',
        'Do you want to enable biometric authentication for faster access to the app?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: () => {
              // In a real app, you would set up biometric authentication here
              setBiometricAuthEnabled(true);
            } 
          }
        ]
      );
    } else {
      setBiometricAuthEnabled(false);
    }
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    try {
      // In a real app, you would clear cached data here
      // For now, we'll just clear AsyncStorage (be careful with this in production!)
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(key => !key.startsWith('@app_settings'));
      await AsyncStorage.multiRemove(filteredKeys);
      
      // Update cache size display
      setCacheSize('0 MB');
      setClearCacheDialogVisible(false);
      
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  };
  
  // Handle submit feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      
      // In a real app, you would send the feedback to your server
      console.log('Submitting feedback:', feedbackText);
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFeedbackText('');
      
      // Show success message
      Alert.alert('Thank You', 'Your feedback has been submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };
  
  const confirmLogout = async () => {
    setLogoutDialogVisible(false);
    await logout();
  };
  
  // Render a settings section
  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {title}
      </Title>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
  
  // Render a settings item with a switch
  const renderSwitchItem = (label: string, value: boolean, onValueChange: (value: boolean) => void) => (
    <List.Item
      title={label}
      left={props => <List.Icon {...props} icon="bell" />}
      right={props => (
        <Switch
          value={value}
          onValueChange={onValueChange}
          color={theme.colors.primary}
        />
      )}
      style={styles.listItem}
      titleStyle={styles.listItemTitle}
    />
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Preferences */}
        {renderSection('Appearance', (
          <>
            <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
              Theme
            </List.Subheader>
            <SegmentedButtons
              value={themePreference}
              onValueChange={handleThemeChange}
              buttons={[
                {
                  value: 'light',
                  label: 'Light',
                  icon: 'weather-sunny',
                },
                {
                  value: 'dark',
                  label: 'Dark',
                  icon: 'weather-night',
                },
                {
                  value: 'system',
                  label: 'System',
                  icon: 'theme-light-dark',
                },
              ]}
              style={styles.segmentedButtons}
            />
            
            <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
              Language
            </List.Subheader>
            <SegmentedButtons
              value={languagePreference}
              onValueChange={handleLanguageChange}
              buttons={[
                {
                  value: 'en',
                  label: 'English',
                },
                {
                  value: 'es',
                  label: 'Español',
                },
                {
                  value: 'fr',
                  label: 'Français',
                },
                {
                  value: 'auto',
                  label: 'Auto',
                  icon: 'translate',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Notifications */}
        {renderSection('Notifications', (
          <>
            {renderSwitchItem(
              'Enable Notifications',
              notificationsEnabled,
              toggleNotifications
            )}
            <List.Item
              title="Notification Sounds"
              description="Customize notification sounds"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
              disabled={!notificationsEnabled}
            />
            <List.Item
              title="Notification Schedule"
              description="Set quiet hours"
              left={props => <List.Icon {...props} icon="clock-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
              disabled={!notificationsEnabled}
            />
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Security */}
        {renderSection('Security', (
          <>
            {renderSwitchItem(
              'Biometric Authentication',
              biometricAuthEnabled,
              toggleBiometricAuth
            )}
            <List.Item
              title="Change Password"
              left={props => <List.Icon {...props} icon="lock" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
            <List.Item
              title="Two-Factor Authentication"
              description="Add an extra layer of security"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Data & Storage */}
        {renderSection('Data & Storage', (
          <>
            {renderSwitchItem(
              'Auto Sync on Mobile Data',
              autoSyncEnabled,
              setAutoSyncEnabled
            )}
            <List.Item
              title="Clear Cache"
              description={`Currently using ${cacheSize}`}
              left={props => <List.Icon {...props} icon="delete" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => setClearCacheDialogVisible(true)}
            />
            <List.Item
              title="Data Usage"
              description="Manage data usage"
              left={props => <List.Icon {...props} icon="chart-bar" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Help & Support */}
        {renderSection('Help & Support', (
          <>
            <List.Item
              title="Help Center"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
            <List.Item
              title="Contact Support"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              onPress={() => {}}
            />
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Feedback */}
        {renderSection('Send Feedback', (
          <>
            <TextInput
              mode="outlined"
              label="Your feedback"
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              style={styles.feedbackInput}
            />
            <Button
              mode="contained"
              onPress={handleSubmitFeedback}
              loading={isSubmittingFeedback}
              disabled={isSubmittingFeedback || !feedbackText.trim()}
              style={styles.submitButton}
            >
              Submit Feedback
            </Button>
          </>
        ))}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            SeRepairs App v1.0.0
          </Text>
          <Text style={[styles.buildInfo, { color: theme.colors.textSecondary }]}>
            Build 123 • {new Date().getFullYear()} SeRepairs
          </Text>
          <Button 
            mode="text" 
            onPress={handleLogout}
            textColor={theme.colors.error}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
      
      {/* Clear Cache Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={clearCacheDialogVisible} 
          onDismiss={() => setClearCacheDialogVisible(false)}
        >
          <Dialog.Title>Clear Cache</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to clear the app cache? This will remove temporary files and data.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearCacheDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleClearCache} textColor={theme.colors.error}>
              Clear Cache
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Logout Confirmation Dialog */}
        <Dialog 
          visible={logoutDialogVisible} 
          onDismiss={() => setLogoutDialogVisible(false)}
        >
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmLogout} textColor={theme.colors.error}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'transparent',
  },
  subheader: {
    paddingHorizontal: 0,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listItemTitle: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
    height: 1,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  feedbackInput: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buildInfo: {
    fontSize: 12,
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default SettingsScreen;
