import { NavigatorScreenParams } from '@react-navigation/native';
import { MaintenanceReport } from '../api/types';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Home (Main) Stack
export type HomeStackParamList = {
  Home: undefined;
  ReportIssue: undefined;
  ReportDetail: { reportId: number };
  EditReport: { reportId: number };
  WorkshopList: undefined;
  WorkshopDetail: { workshopId: number };
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Help: undefined;
};

// Bottom Tab Navigator
export type BottomTabParamList = {
  Dashboard: undefined;
  Reports: undefined;
  Scan: undefined;
  Workshops: undefined;
  Profile: undefined;
};

// Root Stack (combines all navigators)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<BottomTabParamList>;
  Onboarding: undefined;
  // Add any modal screens that should be outside the main navigation
  ImageViewer: { uri: string; title?: string };
  WebViewer: { uri: string; title?: string };
  // Add other modal screens as needed
};

// Combine all param list types for use with useNavigation hook
export type RootNavigationProp = {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    goBack: () => void;
    // Add other navigation methods as needed
  };
};

// Route prop types for screens
export type ReportDetailRouteProp = {
  route: {
    params: {
      reportId: number;
    };
  };
};

export type EditReportRouteProp = {
  route: {
    params: {
      reportId: number;
    };
  };
};

// Navigation prop types for type-safe navigation
export type HomeScreenNavigationProp = {
  navigation: {
    navigate: (screen: keyof HomeStackParamList, params?: any) => void;
    goBack: () => void;
    // Add other navigation methods as needed
  };
};

// Props for components that receive navigation props
export type WithNavigationProps = {
  navigation: any; // Use more specific type if possible
  route?: any; // Use more specific type if possible
};

// Type for the report form data
export type ReportFormData = {
  truckId: string;
  issueDescription: string;
  imageUri?: string;
};

// Type for the report filter options
export type ReportFilterOptions = {
  status?: 'all' | 'reported' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: Date | null;
  endDate?: Date | null;
  truckId?: string;
};

// Type for the sort options
export type SortOption = {
  key: string;
  label: string;
  value: 'asc' | 'desc';
};

// Type for the report list item props
export type ReportListItemProps = {
  report: MaintenanceReport;
  onPress: (report: MaintenanceReport) => void;
  onLongPress?: (report: MaintenanceReport) => void;
  showMenu?: boolean;
};

// Type for the status badge props
export type StatusBadgeProps = {
  status: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  style?: any;
};

// Type for the empty state component
export type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};
