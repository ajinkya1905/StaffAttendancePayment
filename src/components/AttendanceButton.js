import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, ATTENDANCE_STATUS } from '../styles/theme';

export default function AttendanceButton({ date, status, onStatusChange, disabled = false }) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
  const dayNumber = new Date(date).getDate();
  const isToday = new Date(date).toDateString() === new Date().toDateString();
  const isFuture = new Date(date) > new Date();
  
  const statusConfig = {
    [ATTENDANCE_STATUS.PRESENT]: { color: COLORS.present, label: 'P', bgColor: '#D1FAE5' },
    [ATTENDANCE_STATUS.ABSENT]: { color: COLORS.absent, label: 'A', bgColor: '#FEE2E2' },
    [ATTENDANCE_STATUS.HALF_DAY]: { color: COLORS.halfDay, label: 'H', bgColor: '#FEF3C7' },
    [ATTENDANCE_STATUS.LEAVE]: { color: COLORS.leave, label: 'L', bgColor: '#DBEAFE' },
  };

  const cycleStatus = () => {
    if (disabled || isFuture) return;
    
    const statusOrder = [null, ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.HALF_DAY, ATTENDANCE_STATUS.ABSENT, ATTENDANCE_STATUS.LEAVE];
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(statusOrder[nextIndex]);
  };

  const currentConfig = status ? statusConfig[status] : null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isToday && styles.today,
        isFuture && styles.future,
        currentConfig && { backgroundColor: currentConfig.bgColor },
      ]}
      onPress={cycleStatus}
      disabled={disabled || isFuture}
      activeOpacity={0.7}
    >
      <Text style={[styles.dayOfWeek, isFuture && styles.futureText]}>{dayOfWeek}</Text>
      <Text style={[styles.dayNumber, isFuture && styles.futureText]}>{dayNumber}</Text>
      {currentConfig ? (
        <View style={[styles.statusBadge, { backgroundColor: currentConfig.color }]}>
          <Text style={styles.statusText}>{currentConfig.label}</Text>
        </View>
      ) : (
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyText}>-</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  today: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  future: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.6,
  },
  dayOfWeek: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  dayNumber: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    ...FONTS.bold,
  },
  futureText: {
    color: COLORS.textLight,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    ...FONTS.bold,
  },
  emptyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
  emptyText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
});
