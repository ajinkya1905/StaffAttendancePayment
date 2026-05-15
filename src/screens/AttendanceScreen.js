import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStaff } from '../context/StaffContext';
import { MonthPicker, AttendanceButton, LoadingScreen } from '../components';
import {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  getMonthKey,
  getDaysInMonth,
  ATTENDANCE_STATUS,
} from '../styles/theme';

export default function AttendanceScreen({ route }) {
  const { staffId } = route.params;
  const { staff, selectedMonth, setSelectedMonth, markAttendance, getMonthAttendance } = useStaff();
  
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(null);

  const staffMember = staff.find(s => s.id === staffId);
  const monthKey = getMonthKey(selectedMonth);
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [staffId, monthKey])
  );

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await getMonthAttendance(staffId, monthKey);
      setAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (date, status) => {
    const dateKey = date.toISOString().split('T')[0];
    const success = await markAttendance(staffId, dateKey, status);
    if (success) {
      setAttendance(prev => ({
        ...prev,
        [dateKey]: status ? { status } : undefined,
      }));
    }
  };

  const handleBulkMark = async (status) => {
    const today = new Date();
    const promises = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= today) {
        const dateKey = date.toISOString().split('T')[0];
        if (!attendance[dateKey]) {
          promises.push(markAttendance(staffId, dateKey, status));
        }
      }
    }
    
    await Promise.all(promises);
    await loadAttendance();
    setBulkMode(null);
  };

  const getStats = () => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;
    let unmarked = 0;

    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      
      if (date <= today) {
        const record = attendance[dateKey];
        if (!record) {
          unmarked++;
        } else {
          switch (record.status) {
            case ATTENDANCE_STATUS.PRESENT:
              present++;
              break;
            case ATTENDANCE_STATUS.ABSENT:
              absent++;
              break;
            case ATTENDANCE_STATUS.HALF_DAY:
              halfDay++;
              break;
            case ATTENDANCE_STATUS.LEAVE:
              leave++;
              break;
          }
        }
      }
    }

    return { present, absent, halfDay, leave, unmarked };
  };

  const renderCalendar = () => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const record = attendance[dateKey];
      
      days.push(
        <AttendanceButton
          key={day}
          date={date}
          status={record?.status || null}
          onStatusChange={(status) => handleStatusChange(date, status)}
        />
      );
    }
    
    return days;
  };

  if (!staffMember) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Staff member not found</Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading attendance..." />;
  }

  const stats = getStats();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MonthPicker
          selectedDate={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.present }]} />
            <Text style={styles.statValue}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.halfDay }]} />
            <Text style={styles.statValue}>{stats.halfDay}</Text>
            <Text style={styles.statLabel}>Half Day</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.absent }]} />
            <Text style={styles.statValue}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.leave }]} />
            <Text style={styles.statValue}>{stats.leave}</Text>
            <Text style={styles.statLabel}>Leave</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: COLORS.textLight }]} />
            <Text style={styles.statValue}>{stats.unmarked}</Text>
            <Text style={styles.statLabel}>Unmarked</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Mark All Unmarked</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: COLORS.present }]}
              onPress={() => handleBulkMark(ATTENDANCE_STATUS.PRESENT)}
            >
              <Text style={styles.quickButtonText}>All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickButton, { backgroundColor: COLORS.absent }]}
              onPress={() => handleBulkMark(ATTENDANCE_STATUS.ABSENT)}
            >
              <Text style={styles.quickButtonText}>All Absent</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Tap to cycle: No mark → P → H → A → L → No mark</Text>
        </View>

        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>

        <View style={styles.statusLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: COLORS.present }]}>
              <Text style={styles.legendBadgeText}>P</Text>
            </View>
            <Text style={styles.legendLabel}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: COLORS.halfDay }]}>
              <Text style={styles.legendBadgeText}>H</Text>
            </View>
            <Text style={styles.legendLabel}>Half Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: COLORS.absent }]}>
              <Text style={styles.legendBadgeText}>A</Text>
            </View>
            <Text style={styles.legendLabel}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBadge, { backgroundColor: COLORS.leave }]}>
              <Text style={styles.legendBadgeText}>L</Text>
            </View>
            <Text style={styles.legendLabel}>Leave</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.lg,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 100,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.base,
    marginVertical: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    ...FONTS.bold,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
  quickActions: {
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.medium,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quickButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  legend: {
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
  },
  legendTitle: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.sm,
  },
  weekDay: {
    width: 48,
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: SIZES.spacing.base,
    paddingHorizontal: 4,
  },
  emptyDay: {
    width: 48,
    height: 80,
    marginHorizontal: 4,
  },
  statusLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.small,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  legendBadgeText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    ...FONTS.bold,
  },
  legendLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  bottomSpacer: {
    height: 40,
  },
});
