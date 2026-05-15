import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useStaff } from '../context/StaffContext';
import { Button, Input } from '../components';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { clearAllData } from '../utils/storage';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, refreshData, staff } = useStaff();
  
  const [salaryDueDay, setSalaryDueDay] = useState(settings.salaryDueDay?.toString() || '1');
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(settings.reminderDaysBefore?.toString() || '2');

  const handleSaveSettings = async () => {
    const day = parseInt(salaryDueDay);
    const days = parseInt(reminderDaysBefore);

    if (isNaN(day) || day < 1 || day > 28) {
      Alert.alert('Invalid Day', 'Please enter a day between 1 and 28');
      return;
    }

    if (isNaN(days) || days < 1 || days > 10) {
      Alert.alert('Invalid Days', 'Please enter days between 1 and 10');
      return;
    }

    const success = await updateSettings({
      salaryDueDay: day,
      reminderEnabled,
      reminderDaysBefore: days,
    });

    if (success) {
      Alert.alert('Success', 'Settings saved successfully!');
    } else {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all staff, attendance records, payments, and advances. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllData();
            if (success) {
              await refreshData();
              Alert.alert('Success', 'All data has been cleared.');
              navigation.navigate('Home');
            } else {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Coming Soon', 'Data export feature will be available in a future update.');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Salary Settings</Text>
        
        <Input
          label="Salary Due Day of Month"
          value={salaryDueDay}
          onChangeText={setSalaryDueDay}
          placeholder="1-28"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>
          Day of month when salary is typically due (1-28)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Salary Due Reminders</Text>
            <Text style={styles.switchHint}>Get notified before salary is due</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={reminderEnabled ? COLORS.primary : COLORS.textLight}
          />
        </View>

        {reminderEnabled && (
          <Input
            label="Remind Days Before Due Date"
            value={reminderDaysBefore}
            onChangeText={setReminderDaysBefore}
            placeholder="1-10"
            keyboardType="numeric"
          />
        )}
      </View>

      <Button
        title="Save Settings"
        onPress={handleSaveSettings}
        style={styles.saveButton}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Staff</Text>
          <Text style={styles.infoValue}>{staff.length}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.dataButton} onPress={handleExportData}>
          <Text style={styles.dataButtonIcon}>📤</Text>
          <View>
            <Text style={styles.dataButtonTitle}>Export Data</Text>
            <Text style={styles.dataButtonHint}>Download all your data</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dataButton, styles.dangerButton]} 
          onPress={handleClearAllData}
        >
          <Text style={styles.dataButtonIcon}>🗑️</Text>
          <View>
            <Text style={[styles.dataButtonTitle, { color: COLORS.danger }]}>
              Clear All Data
            </Text>
            <Text style={styles.dataButtonHint}>Delete all staff and records</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Staff Attendance and Payment helps you track salary and attendance for your staff members. 
          Made with ❤️ for easy payroll management.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SIZES.spacing.base,
    marginBottom: 0,
    padding: SIZES.spacing.base,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    color: COLORS.text,
    marginBottom: SIZES.spacing.base,
    ...FONTS.semiBold,
  },
  hint: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: -SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.regular,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  switchLabel: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.medium,
  },
  switchHint: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
    ...FONTS.regular,
  },
  saveButton: {
    marginHorizontal: SIZES.spacing.base,
    marginTop: SIZES.spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    ...FONTS.regular,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: COLORS.text,
    ...FONTS.medium,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dataButtonIcon: {
    fontSize: 24,
    marginRight: SIZES.spacing.md,
  },
  dataButtonTitle: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.medium,
  },
  dataButtonHint: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
    ...FONTS.regular,
  },
  aboutText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    ...FONTS.regular,
  },
  bottomSpacer: {
    height: 40,
  },
});
