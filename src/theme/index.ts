import { DefaultTheme } from 'styled-components/native';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryLight: string;
      primaryDark: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      error: string;
      text: string;
      textSecondary: string;
      border: string;
      success: string;
      warning: string;
      info: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      full: number;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  }
}

export const theme: DefaultTheme = {
  colors: {
    primary: '#2563EB', // Blue-600
    primaryLight: '#3B82F6', // Blue-500
    primaryDark: '#1D4ED8', // Blue-700
    secondary: '#10B981', // Emerald-500
    accent: '#F59E0B', // Amber-500
    background: '#FFFFFF',
    surface: '#F9FAFB', // Gray-50
    error: '#EF4444', // Red-500
    text: '#111827', // Gray-900
    textSecondary: '#6B7280', // Gray-500
    border: '#E5E7EB', // Gray-200
    success: '#10B981', // Green-500
    warning: '#F59E0B', // Amber-500
    info: '#3B82F6', // Blue-500
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};

export default theme;
