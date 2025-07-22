import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { HomeStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type ReportIssueScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ReportIssue'>;

const ReportIssueScreen = () => {
  const [truckId, setTruckId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const theme = useTheme();
  const navigation = useNavigation<ReportIssueScreenNavigationProp>();
  const { user } = useAuth();
  const descriptionRef = useRef<any>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please allow access to your photo library to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!truckId.trim()) {
      newErrors.truckId = 'Truck ID is required';
    }
    
    if (!issueDescription.trim()) {
      newErrors.issueDescription = 'Please describe the issue';
    } else if (issueDescription.trim().length < 10) {
      newErrors.issueDescription = 'Description should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('truck_id', truckId);
      // formData.append('issue_description', issueDescription);
      // if (image) {
      //   const localUri = image;
      //   const filename = localUri.split('/').pop();
      //   const match = /\\.(\w+)$/.exec(filename || '');
      //   const type = match ? `image/${match[1]}` : 'image';
      //   formData.append('image', { uri: localUri, name: filename, type } as any);
      // }
      // 
      // const response = await api.post('/reports', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Report Submitted',
        'Your maintenance report has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text variant="titleLarge" style={styles.title}>
            New Maintenance Report
          </Text>
          
          <TextInput
            label="Truck ID"
            value={truckId}
            onChangeText={setTruckId}
            mode="outlined"
            error={!!errors.truckId}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            blurOnSubmit={false}
            left={<TextInput.Icon icon="truck" />}
          />
          {errors.truckId && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.truckId}
            </Text>
          )}
          
          <TextInput
            ref={descriptionRef}
            label="Issue Description"
            value={issueDescription}
            onChangeText={setIssueDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            error={!!errors.issueDescription}
            style={[styles.input, styles.textArea]}
            blurOnSubmit={true}
            left={<TextInput.Icon icon="text" style={styles.textAreaIcon} />}
          />
          {errors.issueDescription && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.issueDescription}
            </Text>
          )}
          
          <View style={styles.imageSection}>
            <Text variant="labelLarge" style={styles.sectionTitle}>
              Add Photo (Optional)
            </Text>
            <Text variant="bodySmall" style={styles.sectionSubtitle}>
              Take a photo or select from gallery
            </Text>
            
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.imageButton, { borderColor: theme.colors.primary }]}
                  onPress={takePhoto}
                >
                  <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.imageButton, { borderColor: theme.colors.primary }]}
                  onPress={pickImage}
                >
                  <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
  },
  textAreaIcon: {
    marginTop: Platform.OS === 'ios' ? 12 : 0,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 12,
  },
  imageSection: {
    marginTop: 16,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#6B7280',
    marginBottom: 12,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  submitButton: {
    borderRadius: 8,
  },
  submitButtonContent: {
    height: 48,
  },
});

export default ReportIssueScreen;
