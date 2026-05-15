import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getStaff,
  saveStaff,
  addStaffMember as addStaffStorage,
  updateStaffMember as updateStaffStorage,
  deleteStaffMember as deleteStaffStorage,
  getAttendance,
  markAttendance as markAttendanceStorage,
  getStaffAttendance,
  getAdvances,
  addAdvance as addAdvanceStorage,
  getStaffAdvances,
  getPayments,
  addPayment as addPaymentStorage,
  getStaffPayments,
  getSettings,
  saveSettings,
  calculateSalary,
} from '../utils/storage';

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_STAFF: 'SET_STAFF',
  ADD_STAFF: 'ADD_STAFF',
  UPDATE_STAFF: 'UPDATE_STAFF',
  DELETE_STAFF: 'DELETE_STAFF',
  SET_ATTENDANCE: 'SET_ATTENDANCE',
  SET_ADVANCES: 'SET_ADVANCES',
  SET_PAYMENTS: 'SET_PAYMENTS',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_SELECTED_MONTH: 'SET_SELECTED_MONTH',
  SET_ERROR: 'SET_ERROR',
};

// Initial state
const initialState = {
  staff: [],
  attendance: {},
  advances: {},
  payments: {},
  settings: {
    salaryDueDay: 1,
    reminderEnabled: true,
    reminderDaysBefore: 2,
  },
  selectedMonth: new Date(),
  loading: true,
  error: null,
};

// Reducer
function staffReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_STAFF:
      return { ...state, staff: action.payload, loading: false };
    
    case ACTIONS.ADD_STAFF:
      return { ...state, staff: [...state.staff, action.payload] };
    
    case ACTIONS.UPDATE_STAFF:
      return {
        ...state,
        staff: state.staff.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    
    case ACTIONS.DELETE_STAFF:
      return {
        ...state,
        staff: state.staff.filter(s => s.id !== action.payload),
      };
    
    case ACTIONS.SET_ATTENDANCE:
      return { ...state, attendance: action.payload };
    
    case ACTIONS.SET_ADVANCES:
      return { ...state, advances: action.payload };
    
    case ACTIONS.SET_PAYMENTS:
      return { ...state, payments: action.payload };
    
    case ACTIONS.SET_SETTINGS:
      return { ...state, settings: action.payload };
    
    case ACTIONS.SET_SELECTED_MONTH:
      return { ...state, selectedMonth: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    default:
      return state;
  }
}

// Context
const StaffContext = createContext(null);

// Provider component
export function StaffProvider({ children }) {
  const [state, dispatch] = useReducer(staffReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const [staff, attendance, advances, payments, settings] = await Promise.all([
        getStaff(),
        getAttendance(),
        getAdvances(),
        getPayments(),
        getSettings(),
      ]);
      
      dispatch({ type: ACTIONS.SET_STAFF, payload: staff });
      dispatch({ type: ACTIONS.SET_ATTENDANCE, payload: attendance });
      dispatch({ type: ACTIONS.SET_ADVANCES, payload: advances });
      dispatch({ type: ACTIONS.SET_PAYMENTS, payload: payments });
      dispatch({ type: ACTIONS.SET_SETTINGS, payload: settings });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Staff operations
  const addStaffMember = useCallback(async (member) => {
    const newMember = await addStaffStorage(member);
    if (newMember) {
      dispatch({ type: ACTIONS.ADD_STAFF, payload: newMember });
      return newMember;
    }
    return null;
  }, []);

  const updateStaffMember = useCallback(async (id, updates) => {
    const updated = await updateStaffStorage(id, updates);
    if (updated) {
      dispatch({ type: ACTIONS.UPDATE_STAFF, payload: updated });
      return updated;
    }
    return null;
  }, []);

  const deleteStaffMember = useCallback(async (id) => {
    const success = await deleteStaffStorage(id);
    if (success) {
      dispatch({ type: ACTIONS.DELETE_STAFF, payload: id });
      // Reload attendance and advances after deletion
      const [attendance, advances, payments] = await Promise.all([
        getAttendance(),
        getAdvances(),
        getPayments(),
      ]);
      dispatch({ type: ACTIONS.SET_ATTENDANCE, payload: attendance });
      dispatch({ type: ACTIONS.SET_ADVANCES, payload: advances });
      dispatch({ type: ACTIONS.SET_PAYMENTS, payload: payments });
    }
    return success;
  }, []);

  // Attendance operations
  const markAttendance = useCallback(async (staffId, date, status) => {
    const success = await markAttendanceStorage(staffId, date, status);
    if (success) {
      const attendance = await getAttendance();
      dispatch({ type: ACTIONS.SET_ATTENDANCE, payload: attendance });
    }
    return success;
  }, []);

  const getMonthAttendance = useCallback(async (staffId, monthKey) => {
    return await getStaffAttendance(staffId, monthKey);
  }, []);

  // Advance operations
  const addAdvance = useCallback(async (staffId, advance) => {
    const newAdvance = await addAdvanceStorage(staffId, advance);
    if (newAdvance) {
      const advances = await getAdvances();
      dispatch({ type: ACTIONS.SET_ADVANCES, payload: advances });
      return newAdvance;
    }
    return null;
  }, []);

  const getMonthAdvances = useCallback(async (staffId, monthKey) => {
    return await getStaffAdvances(staffId, monthKey);
  }, []);

  // Payment operations
  const addPayment = useCallback(async (staffId, payment) => {
    const newPayment = await addPaymentStorage(staffId, payment);
    if (newPayment) {
      const payments = await getPayments();
      dispatch({ type: ACTIONS.SET_PAYMENTS, payload: payments });
      return newPayment;
    }
    return null;
  }, []);

  const getPaymentHistory = useCallback(async (staffId) => {
    return await getStaffPayments(staffId);
  }, []);

  // Settings operations
  const updateSettings = useCallback(async (newSettings) => {
    const success = await saveSettings(newSettings);
    if (success) {
      dispatch({ type: ACTIONS.SET_SETTINGS, payload: newSettings });
    }
    return success;
  }, []);

  // Salary calculation
  const getSalaryDetails = useCallback(async (staffMember, monthKey) => {
    return await calculateSalary(staffMember, monthKey);
  }, []);

  // Set selected month
  const setSelectedMonth = useCallback((date) => {
    dispatch({ type: ACTIONS.SET_SELECTED_MONTH, payload: date });
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadData();
  }, []);

  const value = {
    ...state,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    markAttendance,
    getMonthAttendance,
    addAdvance,
    getMonthAdvances,
    addPayment,
    getPaymentHistory,
    updateSettings,
    getSalaryDetails,
    setSelectedMonth,
    refreshData,
  };

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
}

// Custom hook to use the context
export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}

export default StaffContext;
