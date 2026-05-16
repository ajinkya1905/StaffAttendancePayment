import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStaff } from '../context/StaffContext';
import { StaffCard, MonthPicker, LoadingScreen, EmptyState, AdBanner } from '../components';
import { COLORS, FONTS, SIZES, SHADOWS, getMonthKey, formatCurrency } from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { staff, loading, selectedMonth, setSelectedMonth, getSalaryDetails, refreshData } = useStaff();
  const [salaryInfoMap, setSalaryInfoMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const monthKey = getMonthKey(selectedMonth);

  // Load salary info for all staff
  useFocusEffect(
    useCallback(() => {
      loadSalaryInfo();
    }, [staff, monthKey])
  );

  const loadSalaryInfo = async () => {
    const infoMap = {};
    for (const member of staff) {
      try {
        const info = await getSalaryDetails(member, monthKey);
        infoMap[member.id] = info;
      } catch (error) {
        console.error('Error loading salary info:', error);
      }
    }
    setSalaryInfoMap(infoMap);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadSalaryInfo();
    setRefreshing(false);
  };

  const getTotalStats = () => {
    let totalPayable = 0;
    let totalAdvances = 0;
    let totalStaff = staff.length;

    Object.values(salaryInfoMap).forEach(info => {
      totalPayable += info.netPayable || 0;
      totalAdvances += info.totalAdvances || 0;
    });

    return { totalPayable, totalAdvances, totalStaff };
  };

  if (loading) {
    return <LoadingScreen message="Loading staff..." />;
  }

  const stats = getTotalStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Staff Attendance</Text>
          <Text style={styles.subtitle}>Track your staff salary & attendance</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Month Picker */}
      <MonthPicker
        selectedDate={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Stats Summary */}
      {staff.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalStaff}</Text>
            <Text style={styles.statLabel}>Staff</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {formatCurrency(stats.totalAdvances)}
            </Text>
            <Text style={styles.statLabel}>Advances</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {formatCurrency(stats.totalPayable)}
            </Text>
            <Text style={styles.statLabel}>Total Due</Text>
          </View>
        </View>
      )}

      {/* Staff List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={staff.length === 0 && styles.emptyContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {staff.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Staff Added"
            message="Add your first staff member to start tracking their attendance and salary"
            actionLabel="Add Staff"
            onAction={() => navigation.navigate('AddStaff')}
          />
        ) : (
          staff.map(member => (
            <StaffCard
              key={member.id}
              staff={member}
              salaryInfo={salaryInfoMap[member.id]}
              onPress={() => navigation.navigate('StaffDetail', { staffId: member.id })}
            />
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Banner Ad */}
      <AdBanner style={styles.bannerAd} />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddStaff')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.base,
    paddingTop: 48,
    paddingBottom: SIZES.spacing.md,
  },
  greeting: {
    fontSize: SIZES.xxl,
    color: COLORS.text,
    ...FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...FONTS.regular,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  settingsIcon: {
    fontSize: 22,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.base,
    marginVertical: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.base,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.xl,
    color: COLORS.success,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...FONTS.regular,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  bottomSpacer: {
    height: 140, // Extra space for banner ad
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Positioned above the banner ad
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    marginTop: -2,
  },
  bannerAd: {
    backgroundColor: COLORS.surface,
  },
});
