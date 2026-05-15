import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS, WORK_TYPES, formatCurrency } from '../styles/theme';

export default function StaffCard({ staff, onPress, salaryInfo = null }) {
  const workType = WORK_TYPES.find(w => w.id === staff.workType) || WORK_TYPES[6];
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {staff.photo ? (
            <Image source={{ uri: staff.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {staff.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.name}>{staff.name}</Text>
          <View style={styles.workTypeContainer}>
            <Text style={styles.workTypeIcon}>{workType.icon}</Text>
            <Text style={styles.workType}>{workType.label}</Text>
          </View>
        </View>
        
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryLabel}>Monthly</Text>
          <Text style={styles.salary}>{formatCurrency(staff.salary)}</Text>
        </View>
      </View>
      
      {salaryInfo && (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{salaryInfo.presentDays}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{salaryInfo.halfDays}</Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>{salaryInfo.absentDays}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {formatCurrency(salaryInfo.netPayable)}
            </Text>
            <Text style={styles.statLabel}>Payable</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.base,
    marginHorizontal: SIZES.spacing.base,
    marginVertical: SIZES.spacing.sm,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SIZES.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: SIZES.xxl,
    color: COLORS.white,
    ...FONTS.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    ...FONTS.semiBold,
  },
  workTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workTypeIcon: {
    fontSize: SIZES.base,
    marginRight: 4,
  },
  workType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
  salary: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.base,
    paddingTop: SIZES.spacing.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.lg,
    color: COLORS.success,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
    ...FONTS.regular,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 8,
  },
});
