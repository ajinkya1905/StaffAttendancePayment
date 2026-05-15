import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStaff } from '../context/StaffContext';
import { LoadingScreen, EmptyState } from '../components';
import { COLORS, FONTS, SIZES, SHADOWS, formatCurrency, formatDate } from '../styles/theme';

export default function PaymentsScreen({ route }) {
  const { staffId } = route.params;
  const { staff, getPaymentHistory } = useStaff();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const staffMember = staff.find(s => s.id === staffId);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [staffId])
  );

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getPaymentHistory(staffId);
      setPayments(data.reverse());
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!staffMember) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Staff member not found</Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading payments..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Payments</Text>
          <Text style={styles.summaryValue}>{payments.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Amount Paid</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatCurrency(getTotalPaid())}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={payments.length === 0 && styles.emptyContainer}
        showsVerticalScrollIndicator={false}
      >
        {payments.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No Payments Yet"
            message="No salary payments have been recorded for this staff member"
          />
        ) : (
          payments.map((payment, index) => (
            <TouchableOpacity
              key={payment.id || index}
              style={styles.paymentCard}
              onPress={() => toggleExpand(payment.id)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentHeader}>
                <View style={styles.paymentIcon}>
                  <Text style={styles.iconText}>💳</Text>
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {formatDate(payment.date)}
                  </Text>
                </View>
                <Text style={styles.expandIcon}>
                  {expandedId === payment.id ? '▲' : '▼'}
                </Text>
              </View>

              {expandedId === payment.id && payment.salaryInfo && (
                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Month</Text>
                    <Text style={styles.detailValue}>{payment.monthKey}</Text>
                  </View>
                  {payment.note && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Note</Text>
                      <Text style={styles.detailValue}>{payment.note}</Text>
                    </View>
                  )}
                  <View style={styles.divider} />
                  <Text style={styles.breakdownTitle}>Salary Breakdown</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Present Days</Text>
                    <Text style={styles.detailValue}>{payment.salaryInfo.presentDays || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Half Days</Text>
                    <Text style={styles.detailValue}>{payment.salaryInfo.halfDays || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Absent Days</Text>
                    <Text style={styles.detailValue}>{payment.salaryInfo.absentDays || 0}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Earned Salary</Text>
                    <Text style={[styles.detailValue, { color: COLORS.success }]}>
                      {formatCurrency(payment.salaryInfo.earnedSalary)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Advances Deducted</Text>
                    <Text style={[styles.detailValue, { color: COLORS.danger }]}>
                      - {formatCurrency(payment.salaryInfo.totalAdvances)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, styles.netRow]}>
                    <Text style={styles.netLabel}>Net Payable</Text>
                    <Text style={styles.netValue}>
                      {formatCurrency(payment.salaryInfo.netPayable)}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SIZES.spacing.base,
    padding: SIZES.spacing.base,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.small,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  summaryValue: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    marginTop: 4,
    ...FONTS.bold,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SIZES.spacing.base,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.spacing.base,
    marginBottom: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.base,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: SIZES.lg,
    color: COLORS.success,
    ...FONTS.bold,
  },
  paymentDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    ...FONTS.regular,
  },
  expandIcon: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
  },
  paymentDetails: {
    padding: SIZES.spacing.base,
    backgroundColor: COLORS.borderLight + '50',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  detailValue: {
    fontSize: SIZES.md,
    color: COLORS.text,
    ...FONTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.spacing.md,
  },
  breakdownTitle: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.semiBold,
  },
  netRow: {
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  netLabel: {
    fontSize: SIZES.base,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  netValue: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  bottomSpacer: {
    height: 20,
  },
});
