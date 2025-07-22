import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      // Navigation is handled by the AuthContext after successful login
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>SeRepairs</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Truck Maintenance Portal</Text>
      </View>

      <View style={styles.formContainer}>
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        ) : null}
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon 
              icon={showPassword ? "eye-off" : "eye"} 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={{ color: theme.colors.primary }}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <Button 
          mode="contained" 
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        
        <View style={styles.signupContainer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  loginButtonContent: {
    height: 48,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;
