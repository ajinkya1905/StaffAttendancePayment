// Theme configuration for Helper Hisaab app
export const COLORS = {
  // Primary colors
  primary: '#6366F1',        // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#F59E0B',      // Amber
  secondaryLight: '#FBBF24',
  
  // Status colors
  success: '#10B981',        // Green - Present
  warning: '#F59E0B',        // Amber - Half day
  danger: '#EF4444',         // Red - Absent
  info: '#3B82F6',           // Blue - Leave
  
  // Attendance specific
  present: '#10B981',
  absent: '#EF4444',
  halfDay: '#F59E0B',
  leave: '#3B82F6',
  
  // Background colors
  background: '#F3F4F6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Other
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const FONTS = {
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  semiBold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  // Border radius
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Work types for helpers
export const WORK_TYPES = [
  { id: 'maid', label: 'Maid', icon: '🧹' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'nanny', label: 'Nanny', icon: '👶' },
  { id: 'gardener', label: 'Gardener', icon: '🌱' },
  { id: 'watchman', label: 'Watchman', icon: '👮' },
  { id: 'other', label: 'Other', icon: '👤' },
];

// Days of week for weekly off selection
export const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', fullLabel: 'Sunday' },
  { id: 1, label: 'Mon', fullLabel: 'Monday' },
  { id: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { id: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { id: 4, label: 'Thu', fullLabel: 'Thursday' },
  { id: 5, label: 'Fri', fullLabel: 'Friday' },
  { id: 6, label: 'Sat', fullLabel: 'Saturday' },
];

// Attendance statuses
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'halfDay',
  LEAVE: 'leave',
};

export const ATTENDANCE_LABELS = {
  present: 'Present',
  absent: 'Absent',
  halfDay: 'Half Day',
  leave: 'Leave',
};

// Helper function to format Indian Rupee
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Helper function to format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Helper function to get month-year key
export const getMonthKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Helper function to get days in month
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  WORK_TYPES,
  DAYS_OF_WEEK,
  ATTENDANCE_STATUS,
  ATTENDANCE_LABELS,
  formatCurrency,
  formatDate,
  getMonthKey,
  getDaysInMonth,
};
