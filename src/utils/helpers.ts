import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates a password (at least 6 characters)
 * @param {string} password - The password to validate
 * @returns {boolean} - True if the password is valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Formats a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param {string} dateString - The date string to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 
        ? `${interval} ${unit} ago`
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @returns {string} - The truncated string
 */
export const truncateString = (str: string, maxLength: number = 100): string => {
  if (!str) return '';
  return str.length > maxLength 
    ? `${str.substring(0, maxLength)}...` 
    : str;
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a phone number for display
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  // Return original if format doesn't match
  return phoneNumber;
};

/**
 * Picks an image from the device's library or takes a new photo
 * @param {boolean} allowEditing - Whether to allow image editing
 * @returns {Promise<string | null>} - The URI of the selected/taken image, or null if cancelled
 */
export const pickImage = async (allowEditing: boolean = true): Promise<string | null> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to upload images.'
      );
      return null;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (result.canceled) {
      return null;
    }
    
    // Return the URI of the selected image
    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

/**
 * Takes a photo using the device's camera
 * @param {boolean} allowEditing - Whether to allow image editing
 * @returns {Promise<string | null>} - The URI of the taken photo, or null if cancelled
 */
export const takePhoto = async (allowEditing: boolean = true): Promise<string | null> => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow camera access to take photos.'
      );
      return null;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (result.canceled) {
      return null;
    }
    
    // Return the URI of the taken photo
    return result.assets[0].uri;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
};

/**
 * Converts a local file URI to a base64 string
 * @param {string} uri - The file URI to convert
 * @returns {Promise<string | null>} - The base64 string, or null if conversion fails
 */
export const fileToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // Read the file as a base64 string
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Get the file extension
    const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Return the data URI
    return `data:image/${fileExtension};base64,${base64}`;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return null;
  }
};

/**
 * Opens a URL in the device's default browser
 * @param {string} url - The URL to open
 */
export const openUrl = async (url: string): Promise<void> => {
  const supported = await Linking.canOpenURL(url);
  
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.error(`Don't know how to open this URL: ${url}`);
    Alert.alert('Error', `Cannot open URL: ${url}`);
  }
};

/**
 * Copies text to the clipboard
 * @param {string} text - The text to copy
 * @param {string} [successMessage] - Optional success message to show
 */
export const copyToClipboard = async (text: string, successMessage?: string): Promise<void> => {
  try {
    await Clipboard.setStringAsync(text);
    if (successMessage) {
      Alert.alert('Success', successMessage);
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    Alert.alert('Error', 'Failed to copy to clipboard');
  }
};

/**
 * Debounces a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttles a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle = false;
  
  return function executedFunction(...args: Parameters<F>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Generates a unique ID
 * @returns {string} - A unique ID
 */
export const generateId = (): string => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * Formats a number as a currency string
 * @param {number} amount - The amount to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Checks if the device is an iOS device
 * @returns {boolean} - True if the device is iOS, false otherwise
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Checks if the device is an Android device
 * @returns {boolean} - True if the device is Android, false otherwise
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Checks if the app is running in development mode
 * @returns {boolean} - True if in development mode, false otherwise
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};

/**
 * Delays execution for a specified amount of time
 * @param {number} ms - The number of milliseconds to delay
 * @returns {Promise<void>}
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validates a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
