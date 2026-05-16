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
  DAYS_OF_WEEK,
  getMonthKey,
  getDaysInMonth,
  ATTENDANCE_STATUS,
} from '../styles/theme';

export default function AttendanceScreen({ route }) {
  const { staffId } = route.params;
  const { staff, selectedMonth, setSelectedMonth, markAttendance, getMonthAttendance, getMonthAdvances, getPaymentHistory } = useStaff();
  
  const [attendance, setAttendance] = useState({});
  const [advances, setAdvances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month' - default to month
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const staffMember = staff.find(s => s.id === staffId);
  const monthKey = getMonthKey(selectedMonth);
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [staffId, monthKey, currentWeekStart, viewMode])
  );

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // Load advances and payments for the month
      const [advancesData, paymentsData] = await Promise.all([
        getMonthAdvances(staffId, monthKey),
        getPaymentHistory(staffId),
      ]);
      setAdvances(advancesData || []);
      // Filter payments for this month
      const monthPayments = (paymentsData || []).filter(p => p.date && p.date.startsWith(monthKey));
      setPayments(monthPayments);

      // In week view, we might need to load two months if week spans month boundary
      if (viewMode === 'week') {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const startMonthKey = getMonthKey(currentWeekStart);
        const endMonthKey = getMonthKey(weekEnd);
        
        const data = await getMonthAttendance(staffId, startMonthKey);
        if (startMonthKey !== endMonthKey) {
          const endMonthData = await getMonthAttendance(staffId, endMonthKey);
          setAttendance({ ...data, ...endMonthData });
        } else {
          setAttendance(data);
        }
      } else {
        const data = await getMonthAttendance(staffId, monthKey);
        setAttendance(data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Week navigation
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
    // Update selected month if week crosses month boundary
    if (newStart.getMonth() !== selectedMonth.getMonth()) {
      setSelectedMonth(newStart);
    }
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
    // Update selected month if week crosses month boundary
    if (newStart.getMonth() !== selectedMonth.getMonth()) {
      setSelectedMonth(newStart);
    }
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
    setSelectedMonth(today);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    const startStr = currentWeekStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endStr = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - dayOfWeek);
    thisWeekStart.setHours(0, 0, 0, 0);
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  };

  // Returns 'full', 'half', or 'none' for the weekly off type
  const getWeeklyOffType = (date) => {
    const weeklyOffs = staffMember?.weeklyOffs || [];
    const dayOff = weeklyOffs.find(off => off.dayId === date.getDay());
    if (!dayOff) return 'none';
    return dayOff.type; // 'full' or 'half'
  };

  const isWeeklyOffDay = (date) => {
    return getWeeklyOffType(date) === 'full';
  };

  const isHalfDayWeeklyOff = (date) => {
    return getWeeklyOffType(date) === 'half';
  };

  // Check if a date has an advance payment
  const getAdvanceForDate = (dateKey) => {
    return advances.find(adv => adv.date === dateKey);
  };

  // Check if a date has a salary payment
  const getPaymentForDate = (dateKey) => {
    return payments.find(p => p.date === dateKey);
  };

  // Check if date is salary due date
  const isSalaryDueDate = (date) => {
    const dueDay = staffMember?.salaryDueDay || 1;
    return date.getDate() === dueDay;
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
    let weeklyOff = 0;
    let halfDayOff = 0;

    const today = new Date();
    const weeklyOffs = staffMember?.weeklyOffs || [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayOff = weeklyOffs.find(off => off.dayId === date.getDay());
      
      // Check if it's a full weekly off day
      if (dayOff?.type === 'full') {
        weeklyOff++;
        continue;
      }
      
      // Check if it's a half-day weekly off
      if (dayOff?.type === 'half') {
        halfDayOff++;
        // Still need to track attendance for the working half
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
        continue;
      }
      
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

    return { present, absent, halfDay, leave, unmarked, weeklyOff, halfDayOff };
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <View style={styles.weekViewContainer}>
        {weekDates.map((date, index) => {
          const dateKey = date.toISOString().split('T')[0];
          const record = attendance[dateKey];
          const isOff = isWeeklyOffDay(date);
          const isHalfOff = isHalfDayWeeklyOff(date);
          const isToday = date.toDateString() === today.toDateString();
          const isFuture = date > today;
          const dayInfo = DAYS_OF_WEEK[date.getDay()];

          return (
            <View key={index} style={styles.weekDayContainer}>
              <Text style={[
                styles.weekDayName,
                isOff && styles.weekDayOff,
                isHalfOff && styles.weekDayHalfOff,
                isToday && styles.weekDayToday,
              ]}>
                {dayInfo.label}
              </Text>
              <Text style={[
                styles.weekDayDate,
                isOff && styles.weekDayOff,
                isHalfOff && styles.weekDayHalfOff,
                isToday && styles.weekDayToday,
              ]}>
                {date.getDate()}
              </Text>
              {isOff ? (
                <View style={styles.weekOffBadge}>
                  <Text style={styles.weekOffText}>OFF</Text>
                </View>
              ) : isHalfOff ? (
                <View style={styles.halfOffContainer}>
                  <Text style={styles.halfOffLabel}>½ OFF</Text>
                  <AttendanceButton
                    date={date}
                    status={record?.status || null}
                    onStatusChange={(status) => handleStatusChange(date, status)}
                    large={true}
                    disabled={isFuture}
                  />
                </View>
              ) : (
                <AttendanceButton
                  date={date}
                  status={record?.status || null}
                  onStatusChange={(status) => handleStatusChange(date, status)}
                  large={true}
                  disabled={isFuture}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderCalendar = () => {
    const weeks = [];
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Build calendar as weeks (rows of 7 days)
    let currentWeek = [];
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <View key={`empty-start-${i}`} style={styles.calendarCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const record = attendance[dateKey];
      const isOff = isWeeklyOffDay(date);
      const isHalfOff = isHalfDayWeeklyOff(date);
      const isFuture = date > today;
      const advance = getAdvanceForDate(dateKey);
      const payment = getPaymentForDate(dateKey);
      const isDueDate = isSalaryDueDate(date);
      
      if (isOff) {
        currentWeek.push(
          <View key={day} style={styles.calendarCell}>
            <View style={[styles.weeklyOffCell, isDueDate && styles.salaryDueCell]}>
              <Text style={styles.weeklyOffDayNumber}>{day}</Text>
              <Text style={styles.weeklyOffLabel}>OFF</Text>
              {isDueDate && <View style={styles.dueDateDot} />}
            </View>
            {advance && <View style={styles.advanceDot} />}
            {payment && <View style={styles.paymentDot} />}
          </View>
        );
      } else if (isHalfOff) {
        currentWeek.push(
          <View key={day} style={styles.calendarCell}>
            <View style={[styles.halfDayOffCell, isDueDate && styles.salaryDueBorder]}>
              <Text style={styles.halfDayOffLabel}>½</Text>
              <AttendanceButton
                date={date}
                status={record?.status || null}
                onStatusChange={(status) => handleStatusChange(date, status)}
                disabled={isFuture}
                compact={true}
              />
            </View>
            {(advance || payment || isDueDate) && (
              <View style={styles.dayMarkers}>
                {isDueDate && <View style={styles.dueDateMarker} />}
                {advance && <View style={styles.advanceMarker} />}
                {payment && <View style={styles.paymentMarker} />}
              </View>
            )}
          </View>
        );
      } else {
        currentWeek.push(
          <View key={day} style={styles.calendarCell}>
            <View style={isDueDate ? styles.salaryDueBorder : null}>
              <AttendanceButton
                date={date}
                status={record?.status || null}
                onStatusChange={(status) => handleStatusChange(date, status)}
                disabled={isFuture}
              />
            </View>
            {(advance || payment || isDueDate) && (
              <View style={styles.dayMarkers}>
                {isDueDate && <View style={styles.dueDateMarker} />}
                {advance && <View style={styles.advanceMarker} />}
                {payment && <View style={styles.paymentMarker} />}
              </View>
            )}
          </View>
        );
      }
      
      // If we've completed a week (7 days), push it and start a new one
      if (currentWeek.length === 7) {
        weeks.push(
          <View key={`week-${weeks.length}`} style={styles.calendarRow}>
            {currentWeek}
          </View>
        );
        currentWeek = [];
      }
    }
    
    // Add empty cells at the end to complete the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(
          <View key={`empty-end-${currentWeek.length}`} style={styles.calendarCell}>
            <View style={styles.emptyDay} />
          </View>
        );
      }
      weeks.push(
        <View key={`week-${weeks.length}`} style={styles.calendarRow}>
          {currentWeek}
        </View>
      );
    }
    
    return weeks;
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
        {/* View Mode Toggle - Month on left, Week on right */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'week' ? (
          <>
            {/* Week Navigation */}
            <View style={styles.weekNavigation}>
              <TouchableOpacity style={styles.weekNavButton} onPress={goToPreviousWeek}>
                <Text style={styles.weekNavButtonText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weekRangeContainer} onPress={goToCurrentWeek}>
                <Text style={styles.weekRangeText}>{formatWeekRange()}</Text>
                {!isCurrentWeek() && (
                  <Text style={styles.goToTodayText}>Tap for current week</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.weekNavButton} onPress={goToNextWeek}>
                <Text style={styles.weekNavButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
            
            {/* Week View */}
            {renderWeekView()}
          </>
        ) : (
          <>
            <MonthPicker
              selectedDate={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </>
        )}

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

        {/* Month Calendar View - only show in month mode */}
        {viewMode === 'month' && (
          <>
            <View style={styles.weekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </>
        )}

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

        {/* Calendar Markers Legend */}
        <View style={styles.markersLegend}>
          <View style={styles.markerLegendItem}>
            <View style={[styles.markerDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.markerLegendText}>Salary Due</Text>
          </View>
          <View style={styles.markerLegendItem}>
            <View style={[styles.markerDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.markerLegendText}>Advance</Text>
          </View>
          <View style={styles.markerLegendItem}>
            <View style={[styles.markerDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.markerLegendText}>Payment</Text>
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
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radius.md,
    borderTopRightRadius: SIZES.radius.md,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },
  calendarGrid: {
    marginHorizontal: SIZES.spacing.base,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius.md,
    borderBottomRightRadius: SIZES.radius.md,
    paddingBottom: SIZES.spacing.sm,
    ...SHADOWS.small,
  },
  calendarRow: {
    flexDirection: 'row',
  },
  calendarCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  emptyDay: {
    width: 44,
    height: 70,
  },
  weeklyOffCell: {
    width: 44,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  weeklyOffDayNumber: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    ...FONTS.medium,
  },
  weeklyOffLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    ...FONTS.semiBold,
    marginTop: 2,
  },
  halfDayOffCell: {
    width: 44,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  halfDayOffLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 10,
    color: COLORS.warning,
    ...FONTS.bold,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 2,
    borderRadius: 4,
    zIndex: 1,
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
  markersLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.lg,
  },
  markerLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  markerLegendText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  // Calendar marker styles
  dayMarkers: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },
  dueDateMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  advanceMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  paymentMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  salaryDueBorder: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: SIZES.radius.sm + 2,
    padding: 1,
  },
  salaryDueCell: {
    borderColor: COLORS.secondary,
    borderStyle: 'solid',
  },
  dueDateDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  advanceDot: {
    position: 'absolute',
    bottom: 2,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  paymentDot: {
    position: 'absolute',
    bottom: 2,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  bottomSpacer: {
    height: 40,
  },
  // View Toggle Styles
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
    backgroundColor: COLORS.borderLight,
    borderRadius: SIZES.radius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
    alignItems: 'center',
    borderRadius: SIZES.radius.sm,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  toggleText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  toggleTextActive: {
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Week Navigation Styles
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  weekNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  weekNavButtonText: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  weekRangeContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  weekRangeText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.semiBold,
  },
  goToTodayText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
    ...FONTS.medium,
  },
  // Week View Styles
  weekViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.small,
  },
  weekDayContainer: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  weekDayName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  weekDayDate: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    ...FONTS.bold,
    marginBottom: 8,
  },
  weekDayOff: {
    color: COLORS.textLight,
  },
  weekDayToday: {
    color: COLORS.primary,
  },
  weekOffBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  weekOffText: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    ...FONTS.semiBold,
  },
  weekDayHalfOff: {
    color: COLORS.warning,
  },
  halfOffContainer: {
    alignItems: 'center',
  },
  halfOffLabel: {
    fontSize: 10,
    color: COLORS.warning,
    ...FONTS.bold,
    marginBottom: 2,
  },
});
