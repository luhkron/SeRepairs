// User types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Report types
export interface MaintenanceReport {
  id: number;
  truck_id: string;
  issue_description: string;
  reported_date: string;
  status: 'reported' | 'in_progress' | 'completed' | 'cancelled';
  image_url: string | null;
  driver_id: number;
  repair?: Repair;
}

// Workshop types
export interface Workshop {
  id: number;
  name: string;
  location: string;
  contact: string;
  created_at: string;
}

// Repair types
export interface Repair {
  id: number;
  report_id: number;
  workshop_id: number;
  start_date: string | null;
  end_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  workshop: Workshop;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Report form types
export interface ReportFormData {
  truck_id: string;
  issue_description: string;
  image?: {
    uri: string;
    type: string;
    name: string;
  };
}

// Error handling
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Filter params
export interface ReportFilterParams {
  status?: string;
  start_date?: string;
  end_date?: string;
  truck_id?: string;
  page?: number;
  per_page?: number;
}

// Status counts for dashboard
export interface StatusCounts {
  reported: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Dashboard stats
export interface DashboardStats {
  counts: StatusCounts;
  recent_reports: MaintenanceReport[];
  recent_repairs: Repair[];
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

// Settings types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}
