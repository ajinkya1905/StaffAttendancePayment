import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStaff } from '../context/StaffContext';
import { Button, MonthPicker, Modal, Input, LoadingScreen } from '../components';
import {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  WORK_TYPES,
  formatCurrency,
  formatDate,
  getMonthKey,
  ATTENDANCE_LABELS,
} from '../styles/theme';

export default function StaffDetailScreen({ navigation, route }) {
  const { staffId } = route.params;
  const {
    staff,
    selectedMonth,
    setSelectedMonth,
    getSalaryDetails,
    getMonthAdvances,
    getPaymentHistory,
    addAdvance,
    addPayment,
    deleteStaffMember,
  } = useStaff();

  const [salaryInfo, setSalaryInfo] = useState(null);
  const [advances, setAdvances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const staffMember = staff.find(s => s.id === staffId);
  const workType = staffMember ? WORK_TYPES.find(w => w.id === staffMember.workType) : null;
  const monthKey = getMonthKey(selectedMonth);

  useFocusEffect(
    useCallback(() => {
      if (staffMember) {
        loadData();
      }
    }, [staffMember, monthKey])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [info, monthAdvances, paymentHistory] = await Promise.all([
        getSalaryDetails(staffMember, monthKey),
        getMonthAdvances(staffMember.id, monthKey),
        getPaymentHistory(staffMember.id),
      ]);
      setSalaryInfo(info);
      setAdvances(monthAdvances);
      setPayments(paymentHistory);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdvance = async () => {
    if (!advanceAmount || isNaN(Number(advanceAmount)) || Number(advanceAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid advance amount.');
      return;
    }

    const advance = {
      amount: Number(advanceAmount),
      note: advanceNote.trim(),
      date: new Date().toISOString(),
      monthKey,
    };

    const result = await addAdvance(staffMember.id, advance);
    if (result) {
      setShowAdvanceModal(false);
      setAdvanceAmount('');
      setAdvanceNote('');
      loadData();
    } else {
      Alert.alert('Error', 'Failed to add advance. Please try again.');
    }
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    const payment = {
      amount: Number(paymentAmount),
      note: paymentNote.trim(),
      date: new Date().toISOString(),
      monthKey,
      salaryInfo: { ...salaryInfo },
    };

    const result = await addPayment(staffMember.id, payment);
    if (result) {
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentNote('');
      loadData();
      Alert.alert('Success', 'Payment recorded successfully!');
    } else {
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    }
  };

  const handleDeleteStaff = () => {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to delete ${staffMember.name}? This will also delete all attendance and payment records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteStaffMember(staffMember.id);
            if (success) {
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete staff member.');
            }
          },
        },
      ]
    );
  };

  if (!staffMember) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Staff member not found</Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading details..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {staffMember.photo ? (
            <Image source={{ uri: staffMember.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {staffMember.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{staffMember.name}</Text>
          <View style={styles.workTypeContainer}>
            <Text style={styles.workTypeIcon}>{workType?.icon}</Text>
            <Text style={styles.workType}>{workType?.label}</Text>
          </View>
          {staffMember.phone && (
            <Text style={styles.phone}>📱 {staffMember.phone}</Text>
          )}
          <Text style={styles.joinDate}>
            Joined: {formatDate(staffMember.joiningDate)}
          </Text>
        </View>

        {/* Month Picker */}
        <MonthPicker
          selectedDate={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        {/* Salary Summary Card */}
        <View style={styles.salaryCard}>
          <Text style={styles.cardTitle}>Salary Summary</Text>
          
          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Monthly Salary</Text>
            <Text style={styles.salaryValue}>{formatCurrency(staffMember.salary)}</Text>
          </View>
          
          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Daily Rate</Text>
            <Text style={styles.salaryValue}>{formatCurrency(salaryInfo?.dailyRate)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceDot, { backgroundColor: COLORS.present }]} />
              <Text style={styles.attendanceCount}>{salaryInfo?.presentDays || 0}</Text>
              <Text style={styles.attendanceLabel}>Present</Text>
            </View>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceDot, { backgroundColor: COLORS.halfDay }]} />
              <Text style={styles.attendanceCount}>{salaryInfo?.halfDays || 0}</Text>
              <Text style={styles.attendanceLabel}>Half Day</Text>
            </View>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceDot, { backgroundColor: COLORS.absent }]} />
              <Text style={styles.attendanceCount}>{salaryInfo?.absentDays || 0}</Text>
              <Text style={styles.attendanceLabel}>Absent</Text>
            </View>
            <View style={styles.attendanceItem}>
              <View style={[styles.attendanceDot, { backgroundColor: COLORS.leave }]} />
              <Text style={styles.attendanceCount}>{salaryInfo?.leaves || 0}</Text>
              <Text style={styles.attendanceLabel}>Leave</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Earned Salary</Text>
            <Text style={[styles.salaryValue, { color: COLORS.success }]}>
              {formatCurrency(salaryInfo?.earnedSalary)}
            </Text>
          </View>

          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Total Advances</Text>
            <Text style={[styles.salaryValue, { color: COLORS.danger }]}>
              - {formatCurrency(salaryInfo?.totalAdvances)}
            </Text>
          </View>

          <View style={[styles.salaryRow, styles.netPayableRow]}>
            <Text style={styles.netPayableLabel}>Net Payable</Text>
            <Text style={styles.netPayableValue}>
              {formatCurrency(salaryInfo?.netPayable)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.info }]}
            onPress={() => navigation.navigate('Attendance', { staffId })}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
            onPress={() => setShowAdvanceModal(true)}
          >
            <Text style={styles.actionIcon}>💵</Text>
            <Text style={styles.actionText}>Advance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            onPress={() => {
              setPaymentAmount(salaryInfo?.netPayable?.toString() || '');
              setShowPaymentModal(true);
            }}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Pay Salary</Text>
          </TouchableOpacity>
        </View>

        {/* Advances List */}
        {advances.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.cardTitle}>Advances This Month</Text>
            {advances.map((advance, index) => (
              <View key={advance.id || index} style={styles.listItem}>
                <View>
                  <Text style={styles.listAmount}>{formatCurrency(advance.amount)}</Text>
                  <Text style={styles.listDate}>{formatDate(advance.date)}</Text>
                  {advance.note && <Text style={styles.listNote}>{advance.note}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Payments */}
        {payments.length > 0 && (
          <View style={styles.listCard}>
            <Text style={styles.cardTitle}>Recent Payments</Text>
            {payments.slice(-5).reverse().map((payment, index) => (
              <View key={payment.id || index} style={styles.listItem}>
                <View>
                  <Text style={[styles.listAmount, { color: COLORS.success }]}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={styles.listDate}>{formatDate(payment.date)}</Text>
                  {payment.note && <Text style={styles.listNote}>{payment.note}</Text>}
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Payments', { staffId })}
            >
              <Text style={styles.viewAllText}>View All Payments →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit/Delete Buttons */}
        <View style={styles.bottomButtons}>
          <Button
            title="Edit Staff"
            variant="outline"
            onPress={() => navigation.navigate('AddStaff', { staff: staffMember })}
            style={styles.editButton}
          />
          <Button
            title="Delete Staff"
            variant="danger"
            onPress={handleDeleteStaff}
            style={styles.deleteButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Advance Modal */}
      <Modal
        visible={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Give Advance"
      >
        <Input
          label="Amount"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          placeholder="Enter advance amount"
          keyboardType="numeric"
          prefix="₹"
        />
        <Input
          label="Note (Optional)"
          value={advanceNote}
          onChangeText={setAdvanceNote}
          placeholder="Add a note..."
        />
        <Button
          title="Add Advance"
          onPress={handleAddAdvance}
          style={styles.modalButton}
        />
      </Modal>

      {/* Make Payment Modal */}
      <Modal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <Text style={styles.modalInfo}>
          Net payable: {formatCurrency(salaryInfo?.netPayable)}
        </Text>
        <Input
          label="Payment Amount"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          placeholder="Enter payment amount"
          keyboardType="numeric"
          prefix="₹"
        />
        <Input
          label="Note (Optional)"
          value={paymentNote}
          onChangeText={setPaymentNote}
          placeholder="e.g., Paid via UPI, Cash, etc."
        />
        <Button
          title="Record Payment"
          onPress={handleMakePayment}
          style={styles.modalButton}
        />
      </Modal>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xl,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SIZES.radius.xl,
    borderBottomRightRadius: SIZES.radius.xl,
    ...SHADOWS.small,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    color: COLORS.white,
    ...FONTS.bold,
  },
  name: {
    fontSize: SIZES.xxl,
    color: COLORS.text,
    marginTop: SIZES.spacing.md,
    ...FONTS.bold,
  },
  workTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workTypeIcon: {
    fontSize: SIZES.lg,
    marginRight: 6,
  },
  workType: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  phone: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.sm,
  },
  joinDate: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
  salaryCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.base,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginBottom: SIZES.spacing.md,
    ...FONTS.semiBold,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  salaryLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  salaryValue: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SIZES.spacing.md,
  },
  attendanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceItem: {
    alignItems: 'center',
  },
  attendanceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  attendanceCount: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    ...FONTS.bold,
  },
  attendanceLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
  netPayableRow: {
    backgroundColor: COLORS.primaryLight + '20',
    marginHorizontal: -SIZES.spacing.base,
    marginBottom: -SIZES.spacing.base,
    paddingHorizontal: SIZES.spacing.base,
    paddingVertical: SIZES.spacing.md,
    borderBottomLeftRadius: SIZES.radius.lg,
    borderBottomRightRadius: SIZES.radius.lg,
  },
  netPayableLabel: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  netPayableValue: {
    fontSize: SIZES.xl,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.base,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    ...SHADOWS.small,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    ...FONTS.medium,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.base,
    ...SHADOWS.small,
  },
  listItem: {
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  listAmount: {
    fontSize: SIZES.base,
    color: COLORS.warning,
    ...FONTS.semiBold,
  },
  listDate: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  listNote: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  viewAllButton: {
    paddingTop: SIZES.spacing.md,
  },
  viewAllText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  bottomButtons: {
    flexDirection: 'row',
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.xl,
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
  modalInfo: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.base,
    ...FONTS.medium,
  },
  modalButton: {
    marginTop: SIZES.spacing.base,
  },
});
