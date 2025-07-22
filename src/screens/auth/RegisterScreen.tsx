import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const theme = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      // TODO: Implement registration logic
      // await register(name, email, password);
      // Navigate to home or verification screen
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            error={!!errors.name}
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={!!errors.email}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.password}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.confirmPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
          
          <View style={styles.termsContainer}>
            <Checkbox
              status={acceptedTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              color={theme.colors.primary}
            />
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
          
          <Button 
            mode="contained" 
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
            contentStyle={styles.registerButtonContent}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <View style={styles.loginContainer}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  termsText: {
    flex: 1,
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  linkText: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  registerButtonContent: {
    height: 48,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 8,
    marginTop: -4,
    fontSize: 12,
  },
});

export default RegisterScreen;
