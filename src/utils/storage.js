import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  STAFF: '@staffpay_staff',
  ATTENDANCE: '@staffpay_attendance',
  PAYMENTS: '@staffpay_payments',
  ADVANCES: '@staffpay_advances',
  SETTINGS: '@staffpay_settings',
  CUSTOM_WORK_TYPES: '@staffpay_custom_work_types',
};

// Staff CRUD operations
export const getStaff = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STAFF);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting staff:', error);
    return [];
  }
};

export const saveStaff = async (staff) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    return true;
  } catch (error) {
    console.error('Error saving staff:', error);
    return false;
  }
};

export const addStaffMember = async (member) => {
  try {
    const staff = await getStaff();
    const newMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    staff.push(newMember);
    await saveStaff(staff);
    return newMember;
  } catch (error) {
    console.error('Error adding staff member:', error);
    return null;
  }
};

export const updateStaffMember = async (id, updates) => {
  try {
    const staff = await getStaff();
    const index = staff.findIndex(s => s.id === id);
    if (index !== -1) {
      staff[index] = { ...staff[index], ...updates, updatedAt: new Date().toISOString() };
      await saveStaff(staff);
      return staff[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating staff member:', error);
    return null;
  }
};

export const deleteStaffMember = async (id) => {
  try {
    const staff = await getStaff();
    const filtered = staff.filter(s => s.id !== id);
    await saveStaff(filtered);
    // Also delete related attendance and payments
    await deleteStaffAttendance(id);
    await deleteStaffPayments(id);
    await deleteStaffAdvances(id);
    return true;
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return false;
  }
};

// Attendance operations
export const getAttendance = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting attendance:', error);
    return {};
  }
};

export const saveAttendance = async (attendance) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
};

export const markAttendance = async (staffId, date, status) => {
  try {
    const attendance = await getAttendance();
    if (!attendance[staffId]) {
      attendance[staffId] = {};
    }
    attendance[staffId][date] = {
      status,
      markedAt: new Date().toISOString(),
    };
    await saveAttendance(attendance);
    return true;
  } catch (error) {
    console.error('Error marking attendance:', error);
    return false;
  }
};

export const getStaffAttendance = async (staffId, monthKey = null) => {
  try {
    const attendance = await getAttendance();
    const staffAttendance = attendance[staffId] || {};
    
    if (monthKey) {
      // Filter by month
      const filtered = {};
      Object.keys(staffAttendance).forEach(date => {
        if (date.startsWith(monthKey)) {
          filtered[date] = staffAttendance[date];
        }
      });
      return filtered;
    }
    
    return staffAttendance;
  } catch (error) {
    console.error('Error getting staff attendance:', error);
    return {};
  }
};

export const deleteStaffAttendance = async (staffId) => {
  try {
    const attendance = await getAttendance();
    delete attendance[staffId];
    await saveAttendance(attendance);
    return true;
  } catch (error) {
    console.error('Error deleting staff attendance:', error);
    return false;
  }
};

// Advance payments operations
export const getAdvances = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVANCES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting advances:', error);
    return {};
  }
};

export const saveAdvances = async (advances) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
    return true;
  } catch (error) {
    console.error('Error saving advances:', error);
    return false;
  }
};

export const addAdvance = async (staffId, advance) => {
  try {
    const advances = await getAdvances();
    if (!advances[staffId]) {
      advances[staffId] = [];
    }
    const newAdvance = {
      ...advance,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    advances[staffId].push(newAdvance);
    await saveAdvances(advances);
    return newAdvance;
  } catch (error) {
    console.error('Error adding advance:', error);
    return null;
  }
};

export const getStaffAdvances = async (staffId, monthKey = null) => {
  try {
    const advances = await getAdvances();
    const staffAdvances = advances[staffId] || [];
    
    if (monthKey) {
      return staffAdvances.filter(adv => adv.date && adv.date.startsWith(monthKey));
    }
    
    return staffAdvances;
  } catch (error) {
    console.error('Error getting staff advances:', error);
    return [];
  }
};

export const deleteStaffAdvances = async (staffId) => {
  try {
    const advances = await getAdvances();
    delete advances[staffId];
    await saveAdvances(advances);
    return true;
  } catch (error) {
    console.error('Error deleting staff advances:', error);
    return false;
  }
};

// Payment history operations
export const getPayments = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting payments:', error);
    return {};
  }
};

export const savePayments = async (payments) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    return true;
  } catch (error) {
    console.error('Error saving payments:', error);
    return false;
  }
};

export const addPayment = async (staffId, payment) => {
  try {
    const payments = await getPayments();
    if (!payments[staffId]) {
      payments[staffId] = [];
    }
    const newPayment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    payments[staffId].push(newPayment);
    await savePayments(payments);
    return newPayment;
  } catch (error) {
    console.error('Error adding payment:', error);
    return null;
  }
};

export const getStaffPayments = async (staffId) => {
  try {
    const payments = await getPayments();
    return payments[staffId] || [];
  } catch (error) {
    console.error('Error getting staff payments:', error);
    return [];
  }
};

export const deleteStaffPayments = async (staffId) => {
  try {
    const payments = await getPayments();
    delete payments[staffId];
    await savePayments(payments);
    return true;
  } catch (error) {
    console.error('Error deleting staff payments:', error);
    return false;
  }
};

// Settings operations
export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      salaryDueDay: 1, // Day of month for salary due
      reminderEnabled: true,
      reminderDaysBefore: 2,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      salaryDueDay: 1,
      reminderEnabled: true,
      reminderDaysBefore: 2,
    };
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Calculate salary for a staff member for a specific month
export const calculateSalary = async (staffMember, monthKey) => {
  const attendance = await getStaffAttendance(staffMember.id, monthKey);
  const advances = await getStaffAdvances(staffMember.id, monthKey);
  
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Calculate weekly off days in this month
  const weeklyOffDays = staffMember.weeklyOffDays || [];
  let weeklyOffCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (weeklyOffDays.includes(date.getDay())) {
      weeklyOffCount++;
    }
  }
  
  // Working days = total days - weekly offs
  const workableDays = daysInMonth - weeklyOffCount;
  const dailyRate = workableDays > 0 ? staffMember.salary / workableDays : 0;
  
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let leaves = 0;
  
  Object.values(attendance).forEach(record => {
    switch (record.status) {
      case 'present':
        presentDays++;
        break;
      case 'absent':
        absentDays++;
        break;
      case 'halfDay':
        halfDays++;
        break;
      case 'leave':
        leaves++;
        break;
    }
  });
  
  // Calculate paid leaves (up to the monthly allowance)
  const paidLeavesAllowed = staffMember.paidLeavesPerMonth || 0;
  const paidLeaves = Math.min(leaves, paidLeavesAllowed);
  const unpaidLeaves = leaves - paidLeaves;
  
  // Working days = present days + half days (0.5) + paid leaves
  const effectiveWorkDays = presentDays + (halfDays * 0.5) + paidLeaves;
  const earnedSalary = Math.round(dailyRate * effectiveWorkDays);
  const totalAdvances = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0);
  const netPayable = earnedSalary - totalAdvances;
  
  return {
    daysInMonth,
    workableDays,
    weeklyOffCount,
    presentDays,
    absentDays,
    halfDays,
    leaves,
    paidLeaves,
    unpaidLeaves,
    unmarkedDays: workableDays - presentDays - absentDays - halfDays - leaves,
    dailyRate: Math.round(dailyRate),
    earnedSalary,
    totalAdvances,
    netPayable,
  };
};

// Clear all data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.STAFF,
      STORAGE_KEYS.ATTENDANCE,
      STORAGE_KEYS.PAYMENTS,
      STORAGE_KEYS.ADVANCES,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Custom work types operations
export const getCustomWorkTypes = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_WORK_TYPES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom work types:', error);
    return [];
  }
};

export const addCustomWorkType = async (label) => {
  try {
    const customTypes = await getCustomWorkTypes();
    const id = `custom_${Date.now()}`;
    const newType = {
      id,
      label: label.trim(),
      icon: '👤',
      isCustom: true,
    };
    customTypes.push(newType);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_WORK_TYPES, JSON.stringify(customTypes));
    return newType;
  } catch (error) {
    console.error('Error adding custom work type:', error);
    return null;
  }
};

export const deleteCustomWorkType = async (id) => {
  try {
    const customTypes = await getCustomWorkTypes();
    const filtered = customTypes.filter(t => t.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_WORK_TYPES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom work type:', error);
    return false;
  }
};

export default {
  getStaff,
  saveStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getAttendance,
  saveAttendance,
  markAttendance,
  getStaffAttendance,
  getAdvances,
  addAdvance,
  getStaffAdvances,
  getPayments,
  addPayment,
  getStaffPayments,
  getSettings,
  saveSettings,
  calculateSalary,
  clearAllData,
};
