import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { 
  Text, 
  Title, 
  Button, 
  useTheme, 
  Avatar, 
  Divider, 
  List, 
  IconButton, 
  ActivityIndicator,
  Menu,
  Portal,
  Dialog,
  TextInput,
  HelperText,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../api/types';
import { authApi } from '../../api/api';

const ProfileScreen = () => {
  const theme = useTheme();
  const { user: currentUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      // Prepare update data
      const updateData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      
      // Only include password fields if they're being changed
      if (formData.newPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.password = formData.newPassword;
        updateData.password_confirmation = formData.confirmPassword;
      }
      
      // Call API to update user
      const updatedUser = await authApi.updateProfile(updateData);
      
      // Update avatar if changed
      if (avatar) {
        // In a real app, you would upload the avatar to your server
        // and then update the user's avatar URL
        console.log('Would upload avatar:', avatar);
      }
      
      // Update auth context with new user data
      updateUser(updatedUser);
      
      // Exit edit mode
      setEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogVisible(false);
    await logout();
  };

  const handleDeleteAccount = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setSaving(true);
      setDeleteDialogVisible(false);
      
      // Call API to delete account
      await authApi.deleteAccount();
      
      // Logout after account deletion
      await logout();
      
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', error.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access to take a photo.');
      return;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  if (loading || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Image 
              size={120} 
              source={avatar ? { uri: avatar } : user.avatar_url ? { uri: user.avatar_url } : require('../../assets/default-avatar.png')} 
              style={styles.avatar}
            />
            {editing && (
              <IconButton
                icon="camera"
                size={24}
                mode="contained"
                style={styles.editAvatarButton}
                onPress={() => setMenuVisible(true)}
              />
            )}
          </View>
          
          <Title style={[styles.name, { color: theme.colors.text }]}>
            {editing ? (
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                error={!!errors.name}
                style={styles.input}
                mode="outlined"
              />
            ) : (
              user.name || 'User'
            )}
          </Title>
          
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {editing ? (
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                style={styles.input}
                mode="outlined"
              />
            ) : (
              user.email
            )}
          </Text>
          
          {editing && (
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
              error={!!errors.phone}
              style={[styles.input, styles.phoneInput]}
              mode="outlined"
              left={<TextInput.Icon icon="phone" />}
            />
          )}
          
          {!editing ? (
            <Button 
              mode="outlined" 
              onPress={() => setEditing(true)}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          ) : (
            <View style={styles.editActions}>
              <Button 
                mode="contained" 
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={[styles.saveButton, { marginRight: 8 }]}
              >
                Save Changes
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setEditing(false);
                  // Reset form data
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }
                  setErrors({});
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </View>
          )}
        </View>
        
        {editing && (
          <View style={styles.section}>
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Change Password
            </Title>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Leave blank to keep current password
            </Text>
            
            <TextInput
              label="Current Password"
              value={formData.currentPassword}
              onChangeText={(text) => handleChange('currentPassword', text)}
              secureTextEntry
              error={!!errors.currentPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />
            {errors.currentPassword && (
              <HelperText type="error" visible={!!errors.currentPassword}>
                {errors.currentPassword}
              </HelperText>
            )}
            
            <TextInput
              label="New Password"
              value={formData.newPassword}
              onChangeText={(text) => handleChange('newPassword', text)}
              secureTextEntry
              error={!!errors.newPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />
            {errors.newPassword && (
              <HelperText type="error" visible={!!errors.newPassword}>
                {errors.newPassword}
              </HelperText>
            )}
            
            <TextInput
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              secureTextEntry
              error={!!errors.confirmPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />
            {errors.confirmPassword && (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            )}
          </View>
        )}
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Account Settings */}
        <View style={styles.section}>
          <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Account Settings
          </Title>
          
          <List.Section>
            <List.Item
              title="Notification Settings"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <List.Item
              title="Help & Support"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
          </List.Section>
        </View>
        
        <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        
        {/* Danger Zone */}
        <View style={styles.section}>
          <Title style={[styles.sectionTitle, { color: theme.colors.error }]}>
            Danger Zone
          </Title>
          
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            textColor={theme.colors.error}
            icon="logout"
            style={[styles.dangerButton, { borderColor: theme.colors.error }]}
          >
            Logout
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleDeleteAccount}
            textColor={theme.colors.error}
            icon="delete"
            style={[styles.dangerButton, { borderColor: theme.colors.error }]}
          >
            Delete Account
          </Button>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            SeRepairs App v1.0.0
          </Text>
        </View>
      </ScrollView>
      
      {/* Avatar Menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{
            x: 0,
            y: 0,
          }}
          contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              pickImage();
            }} 
            title="Choose from Library" 
            leadingIcon="image"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              takePhoto();
            }} 
            title="Take Photo" 
            leadingIcon="camera"
          />
          {avatar && (
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                setAvatar(null);
              }} 
              title="Remove Photo" 
              leadingIcon="delete"
            />
          )}
        </Menu>
        
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
        
        {/* Delete Account Confirmation Dialog */}
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Account</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete your account? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeleteAccount} textColor={theme.colors.error}>
              Delete
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    marginTop: 8,
    borderRadius: 20,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
    width: '100%',
  },
  phoneInput: {
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
    height: 1,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  dangerButton: {
    marginTop: 8,
    borderColor: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
  },
  menuContent: {
    padding: 8,
  },
});

export default ProfileScreen;
