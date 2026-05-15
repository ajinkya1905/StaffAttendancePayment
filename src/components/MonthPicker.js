import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthPicker({ selectedDate, onMonthChange }) {
  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  const goToPrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    // Don't allow future months
    if (newDate <= new Date()) {
      onMonthChange(newDate);
    }
  };

  const isNextDisabled = () => {
    const nextMonth = new Date(year, month + 1, 1);
    return nextMonth > new Date();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={goToPrevMonth} 
        style={styles.arrow}
        activeOpacity={0.7}
      >
        <Text style={styles.arrowText}>◀</Text>
      </TouchableOpacity>
      
      <View style={styles.monthContainer}>
        <Text style={styles.month}>{MONTHS[month]}</Text>
        <Text style={styles.year}>{year}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={goToNextMonth} 
        style={[styles.arrow, isNextDisabled() && styles.arrowDisabled]}
        disabled={isNextDisabled()}
        activeOpacity={0.7}
      >
        <Text style={[styles.arrowText, isNextDisabled() && styles.arrowTextDisabled]}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginHorizontal: SIZES.spacing.base,
    marginVertical: SIZES.spacing.sm,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  arrowText: {
    fontSize: SIZES.base,
    color: COLORS.white,
  },
  arrowTextDisabled: {
    color: COLORS.textLight,
  },
  monthContainer: {
    alignItems: 'center',
  },
  month: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    ...FONTS.bold,
  },
  year: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
});
