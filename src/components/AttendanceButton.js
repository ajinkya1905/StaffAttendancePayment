import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES, ATTENDANCE_STATUS } from '../styles/theme';

export default function AttendanceButton({ date, status, onStatusChange, disabled = false, large = false, compact = false }) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
  const dayNumber = new Date(date).getDate();
  const isToday = new Date(date).toDateString() === new Date().toDateString();
  const isFuture = new Date(date) > new Date();
  const isDisabled = disabled || isFuture;
  
  const statusConfig = {
    [ATTENDANCE_STATUS.PRESENT]: { color: COLORS.present, label: 'P', bgColor: '#D1FAE5' },
    [ATTENDANCE_STATUS.ABSENT]: { color: COLORS.absent, label: 'A', bgColor: '#FEE2E2' },
    [ATTENDANCE_STATUS.HALF_DAY]: { color: COLORS.halfDay, label: 'H', bgColor: '#FEF3C7' },
    [ATTENDANCE_STATUS.LEAVE]: { color: COLORS.leave, label: 'L', bgColor: '#DBEAFE' },
  };

  const cycleStatus = () => {
    if (isDisabled) return;
    
    const statusOrder = [null, ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.HALF_DAY, ATTENDANCE_STATUS.ABSENT, ATTENDANCE_STATUS.LEAVE];
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(statusOrder[nextIndex]);
  };

  const currentConfig = status ? statusConfig[status] : null;

  // Compact mode for half-day weekly off in calendar view
  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          isToday && styles.compactToday,
          isDisabled && styles.future,
          currentConfig && { backgroundColor: currentConfig.bgColor, borderColor: currentConfig.color },
        ]}
        onPress={cycleStatus}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.compactDayNumber, isDisabled && styles.futureText]}>{dayNumber}</Text>
        {currentConfig ? (
          <View style={[styles.compactStatusBadge, { backgroundColor: currentConfig.color }]}>
            <Text style={styles.compactStatusText}>{currentConfig.label}</Text>
          </View>
        ) : (
          <View style={styles.compactEmptyBadge}>
            <Text style={styles.compactEmptyText}>-</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // For large mode (week view), we only show the status badge
  if (large) {
    return (
      <TouchableOpacity
        style={[
          styles.largeContainer,
          isToday && styles.largeToday,
          isDisabled && styles.largeFuture,
          currentConfig && { backgroundColor: currentConfig.bgColor, borderColor: currentConfig.color },
        ]}
        onPress={cycleStatus}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {currentConfig ? (
          <Text style={[styles.largeStatusText, { color: currentConfig.color }]}>
            {currentConfig.label}
          </Text>
        ) : (
          <Text style={styles.largeEmptyText}>-</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isToday && styles.today,
        isFuture && styles.future,
        currentConfig && { backgroundColor: currentConfig.bgColor },
      ]}
      onPress={cycleStatus}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
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
    width: 44,
    height: 70,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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
  dayNumber: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: 4,
  },
  futureText: {
    color: COLORS.textLight,
  },
  statusBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    ...FONTS.bold,
  },
  emptyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
  emptyText: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
  // Large button styles for week view
  largeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  largeToday: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  largeFuture: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.5,
  },
  largeStatusText: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
  largeEmptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textLight,
    ...FONTS.medium,
  },
  // Compact styles for half-day weekly off
  compactContainer: {
    width: 40,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compactToday: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  compactDayNumber: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: 2,
  },
  compactStatusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactStatusText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    ...FONTS.bold,
  },
  compactEmptyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
  compactEmptyText: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
});
