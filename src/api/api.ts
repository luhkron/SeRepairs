import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ApiResponse, ApiError, PaginatedResponse, ReportFilterParams } from './types';

// Use environment variable for API URL with fallbacks for different environments
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    process.env.EXPO_PUBLIC_API_URL || 
                    (process.env.NODE_ENV === 'production' ? 'https://windsurf-backend.onrender.com/api/v1' : 'http://localhost:5000/api/v1');

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          return Promise.reject(error);
        }
        
        // Try to refresh the token
        const response = await axios.post<{ access_token: string; refresh_token: string }>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        const { access_token, refresh_token } = response.data;
        
        // Save the new tokens
        await Promise.all([
          SecureStore.setItemAsync('access_token', access_token),
          SecureStore.setItemAsync('refresh_token', refresh_token),
        ]);
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await clearAuthTokens();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'An unknown error occurred');
};

// Helper function to handle API errors
const handleError = (error: AxiosError<ApiError>): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    const errors = error.response.data?.errors;
    
    const apiError: ApiError = {
      message,
      status,
      errors,
    };
    
    throw apiError;
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An error occurred');
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<{ access_token: string; refresh_token: string; user: any }>>(
        '/auth/login',
        { email, password }
      );
      const { access_token, refresh_token, user } = response.data.data;
      
      // Save tokens securely
      await Promise.all([
        SecureStore.setItemAsync('access_token', access_token),
        SecureStore.setItemAsync('refresh_token', refresh_token),
      ]);
      
      return user;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await api.post<ApiResponse<{ user: any }>>('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      return response.data.data.user;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await clearAuthTokens();
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/auth/me');
      return response.data.data;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
};

// Reports API
export const reportsApi = {
  getReports: async (params?: ReportFilterParams) => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<any>>>('/reports', { params });
      return handleResponse<PaginatedResponse<any>>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  getReport: async (id: number) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/reports/${id}`);
      return handleResponse<any>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  createReport: async (data: FormData) => {
    try {
      const response = await api.post<ApiResponse<any>>('/reports', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleResponse<any>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  updateReport: async (id: number, data: any) => {
    try {
      const response = await api.put<ApiResponse<any>>(`/reports/${id}`, data);
      return handleResponse<any>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  deleteReport: async (id: number) => {
    try {
      await api.delete<ApiResponse<void>>(`/reports/${id}`);
      return true;
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
};

// Workshops API
export const workshopsApi = {
  getWorkshops: async (params?: any) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/workshops', { params });
      return handleResponse<any[]>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
  
  getWorkshop: async (id: number) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/workshops/${id}`);
      return handleResponse<any>(response);
    } catch (error) {
      return handleError(error as AxiosError<ApiError>);
    }
  },
};

// Helper function to clear auth tokens
const clearAuthTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync('access_token'),
    SecureStore.deleteItemAsync('refresh_token'),
  ]);
};

// Helper function to create form data for file uploads
export const createFormData = (uri: string, name: string, type: string, body: any = {}) => {
  const formData = new FormData();
  
  // @ts-ignore
  formData.append('image', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    name,
    type,
  });
  
  // Append other fields to form data
  Object.keys(body).forEach(key => {
    formData.append(key, body[key]);
  });
  
  return formData;
};

export default api;
