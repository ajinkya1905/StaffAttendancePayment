import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStaff } from '../context/StaffContext';
import { Button, Input, Modal } from '../components';
import { COLORS, FONTS, SIZES, SHADOWS, WORK_TYPES, DAYS_OF_WEEK, formatDate } from '../styles/theme';
import { getCustomWorkTypes, addCustomWorkType } from '../utils/storage';
import { useAds } from '../context/AdContext';

export default function AddStaffScreen({ navigation, route }) {
  const { addStaffMember, updateStaffMember, staff, settings } = useStaff();
  const { showInterstitial } = useAds();
  const editStaff = route.params?.staff;
  const isEditing = !!editStaff;

  const [name, setName] = useState(editStaff?.name || '');
  const [phone, setPhone] = useState(editStaff?.phone || '');
  const [workType, setWorkType] = useState(editStaff?.workType || 'maid');
  const [customWorkTypeName, setCustomWorkTypeName] = useState(editStaff?.customWorkTypeName || '');
  const [salary, setSalary] = useState(editStaff?.salary?.toString() || '');
  const [joiningDate, setJoiningDate] = useState(editStaff?.joiningDate || new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState(editStaff?.photo || null);
  const [notes, setNotes] = useState(editStaff?.notes || '');
  // Weekly offs - now stores objects with {dayId, type: 'full' | 'half'}
  const [weeklyOffDays, setWeeklyOffDays] = useState(editStaff?.weeklyOffDays || [0]); // Legacy format support
  const [weeklyOffs, setWeeklyOffs] = useState(editStaff?.weeklyOffs || [{ dayId: 0, type: 'full' }]); // New format
  const [paidLeavesPerMonth, setPaidLeavesPerMonth] = useState(editStaff?.paidLeavesPerMonth?.toString() || '0');
  // New: Salary Due Day for this staff (default from settings)
  const [salaryDueDay, setSalaryDueDay] = useState(editStaff?.salaryDueDay?.toString() || settings?.salaryDueDay?.toString() || '1');
  // New: Alternate offs configuration
  const [alternateOffs, setAlternateOffs] = useState(editStaff?.alternateOffs || {
    enabled: false,
    dayId: 6, // Default Saturday
    frequency: 'alternate', // 'alternate', 'first', 'second', 'third', 'fourth', 'last'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Custom work type state
  const [customWorkTypes, setCustomWorkTypes] = useState([]);
  const [showAddWorkTypeModal, setShowAddWorkTypeModal] = useState(false);
  const [newWorkTypeName, setNewWorkTypeName] = useState('');

  useEffect(() => {
    loadCustomWorkTypes();
  }, []);

  const loadCustomWorkTypes = async () => {
    const types = await getCustomWorkTypes();
    setCustomWorkTypes(types);
  };

  const handleAddCustomWorkType = async () => {
    if (!newWorkTypeName.trim()) {
      Alert.alert('Error', 'Please enter a work type name');
      return;
    }
    
    const newType = await addCustomWorkType(newWorkTypeName);
    if (newType) {
      setCustomWorkTypes(prev => [...prev, newType]);
      setWorkType(newType.id);
      setCustomWorkTypeName(newType.label);
      setNewWorkTypeName('');
      setShowAddWorkTypeModal(false);
    }
  };

  const getAllWorkTypes = () => {
    return [...WORK_TYPES.filter(t => t.id !== 'other'), ...customWorkTypes, { id: 'add_new', label: '+ Add', icon: '➕' }];
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos to add a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your camera to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Cycle through: none -> full -> half -> none
  const toggleWeeklyOff = (dayId) => {
    const existingOff = weeklyOffs.find(off => off.dayId === dayId);
    
    if (!existingOff) {
      // Add as full day off
      const newOffs = [...weeklyOffs, { dayId, type: 'full' }];
      setWeeklyOffs(newOffs);
      setWeeklyOffDays(newOffs.map(off => off.dayId));
    } else if (existingOff.type === 'full') {
      // Change to half day off
      const newOffs = weeklyOffs.map(off => 
        off.dayId === dayId ? { ...off, type: 'half' } : off
      );
      setWeeklyOffs(newOffs);
    } else {
      // Remove the off day
      const newOffs = weeklyOffs.filter(off => off.dayId !== dayId);
      setWeeklyOffs(newOffs);
      setWeeklyOffDays(newOffs.map(off => off.dayId));
    }
  };

  const getWeeklyOffStatus = (dayId) => {
    const off = weeklyOffs.find(o => o.dayId === dayId);
    if (!off) return 'none';
    return off.type; // 'full' or 'half'
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (salary && (isNaN(Number(salary)) || Number(salary) <= 0)) {
      newErrors.salary = 'Please enter a valid salary amount';
    }

    if (!salary.trim()) {
      newErrors.salary = 'Monthly salary is required';
    }

    if (phone && !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const staffData = {
        name: name.trim(),
        phone: phone.trim(),
        workType,
        customWorkTypeName: customWorkTypeName || '',
        salary: Number(salary),
        joiningDate,
        photo,
        notes: notes.trim(),
        weeklyOffDays, // Keep for backward compatibility
        weeklyOffs, // New format with half-day support
        paidLeavesPerMonth: Number(paidLeavesPerMonth) || 0,
        salaryDueDay: Number(salaryDueDay) || 1,
        alternateOffs,
      };

      let success;
      if (isEditing) {
        success = await updateStaffMember(editStaff.id, staffData);
      } else {
        success = await addStaffMember(staffData);
      }

      if (success) {
        // Show interstitial ad when adding new staff (not when editing)
        if (!isEditing) {
          showInterstitial();
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save staff member. Please try again.');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Section */}
        <TouchableOpacity style={styles.photoSection} onPress={showPhotoOptions}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoText}>Add Photo</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>✏️</Text>
          </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Name *"
            value={name}
            onChangeText={setName}
            placeholder="Enter staff name"
            error={errors.name}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Text style={styles.label}>Work Type *</Text>
          <View style={styles.workTypeGrid}>
            {getAllWorkTypes().map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.workTypeButton,
                  type.id === 'add_new' && styles.addWorkTypeButton,
                  workType === type.id && styles.workTypeSelected,
                ]}
                onPress={() => {
                  if (type.id === 'add_new') {
                    setShowAddWorkTypeModal(true);
                  } else {
                    setWorkType(type.id);
                    if (type.isCustom) {
                      setCustomWorkTypeName(type.label);
                    } else {
                      setCustomWorkTypeName('');
                    }
                  }
                }}
              >
                <Text style={styles.workTypeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.workTypeLabel,
                  workType === type.id && styles.workTypeLabelSelected,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Monthly Salary *"
            value={salary}
            onChangeText={setSalary}
            placeholder="Enter monthly salary"
            keyboardType="numeric"
            prefix="₹"
            error={errors.salary}
          />

          <Input
            label="Salary Due Day"
            value={salaryDueDay}
            onChangeText={setSalaryDueDay}
            placeholder="1-28"
            keyboardType="numeric"
            helperText="Day of month when salary is due (1-28)"
          />

          <Text style={styles.label}>Weekly Off Days</Text>
          <Text style={styles.helperText}>Tap once for full day off, twice for half day off, thrice to remove</Text>
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map(day => {
              const status = getWeeklyOffStatus(day.id);
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    status === 'full' && styles.dayButtonSelected,
                    status === 'half' && styles.dayButtonHalf,
                  ]}
                  onPress={() => toggleWeeklyOff(day.id)}
                >
                  <Text style={[
                    styles.dayLabel,
                    (status === 'full' || status === 'half') && styles.dayLabelSelected,
                  ]}>
                    {day.label}
                  </Text>
                  {status === 'half' && (
                    <Text style={styles.halfLabel}>½</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Alternate Offs Section */}
          <View style={styles.alternateSection}>
            <View style={styles.alternateSwitchRow}>
              <Text style={styles.label}>Alternate Off Days</Text>
              <TouchableOpacity
                style={[
                  styles.toggleSwitch,
                  alternateOffs.enabled && styles.toggleSwitchOn,
                ]}
                onPress={() => setAlternateOffs(prev => ({ ...prev, enabled: !prev.enabled }))}
              >
                <View style={[
                  styles.toggleThumb,
                  alternateOffs.enabled && styles.toggleThumbOn,
                ]} />
              </TouchableOpacity>
            </View>
            
            {alternateOffs.enabled && (
              <>
                <Text style={styles.helperText}>Select which day and frequency</Text>
                <View style={styles.alternateOptions}>
                  <View style={styles.alternateRow}>
                    <Text style={styles.alternateLabel}>Day:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.alternateChips}>
                        {DAYS_OF_WEEK.map(day => (
                          <TouchableOpacity
                            key={day.id}
                            style={[
                              styles.alternateChip,
                              alternateOffs.dayId === day.id && styles.alternateChipSelected,
                            ]}
                            onPress={() => setAlternateOffs(prev => ({ ...prev, dayId: day.id }))}
                          >
                            <Text style={[
                              styles.alternateChipText,
                              alternateOffs.dayId === day.id && styles.alternateChipTextSelected,
                            ]}>
                              {day.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  <View style={styles.alternateRow}>
                    <Text style={styles.alternateLabel}>Pattern:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.alternateChips}>
                        {[
                          { id: 'alternate', label: 'Alternate' },
                          { id: 'first', label: '1st' },
                          { id: 'second', label: '2nd' },
                          { id: 'third', label: '3rd' },
                          { id: 'fourth', label: '4th' },
                          { id: 'last', label: 'Last' },
                        ].map(freq => (
                          <TouchableOpacity
                            key={freq.id}
                            style={[
                              styles.alternateChip,
                              alternateOffs.frequency === freq.id && styles.alternateChipSelected,
                            ]}
                            onPress={() => setAlternateOffs(prev => ({ ...prev, frequency: freq.id }))}
                          >
                            <Text style={[
                              styles.alternateChipText,
                              alternateOffs.frequency === freq.id && styles.alternateChipTextSelected,
                            ]}>
                              {freq.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </>
            )}
          </View>

          <Input
            label="Paid Leaves Per Month"
            value={paidLeavesPerMonth}
            onChangeText={setPaidLeavesPerMonth}
            placeholder="0"
            keyboardType="numeric"
            helperText="Leaves that count toward salary"
          />

          <Input
            label="Joining Date"
            value={formatDate(joiningDate)}
            editable={false}
            placeholder="Select joining date"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? 'Update Staff' : 'Add Staff'}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            variant="text"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>

      {/* Add Custom Work Type Modal */}
      <Modal
        visible={showAddWorkTypeModal}
        title="Add Work Type"
        onClose={() => {
          setShowAddWorkTypeModal(false);
          setNewWorkTypeName('');
        }}
      >
        <Input
          label="Work Type Name"
          value={newWorkTypeName}
          onChangeText={setNewWorkTypeName}
          placeholder="e.g., Helper, Electrician"
          autoFocus
        />
        <View style={styles.modalButtons}>
          <Button
            title="Add"
            onPress={handleAddCustomWorkType}
            style={{ flex: 1 }}
          />
          <Button
            title="Cancel"
            variant="text"
            onPress={() => {
              setShowAddWorkTypeModal(false);
              setNewWorkTypeName('');
            }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.spacing.base,
  },
  photoSection: {
    alignSelf: 'center',
    marginVertical: SIZES.spacing.xl,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  photoIcon: {
    fontSize: 32,
  },
  photoText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...FONTS.medium,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  editIcon: {
    fontSize: 16,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.base,
    ...SHADOWS.small,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.medium,
  },
  workTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.spacing.base,
    gap: 8,
  },
  workTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workTypeSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  addWorkTypeButton: {
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  workTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  workTypeLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  workTypeLabelSelected: {
    color: COLORS.white,
  },
  helperText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.spacing.base,
    gap: 8,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  dayButtonHalf: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  dayLabelSelected: {
    color: COLORS.white,
  },
  halfLabel: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    ...FONTS.bold,
    position: 'absolute',
    bottom: 2,
  },
  alternateSection: {
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  alternateSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  alternateOptions: {
    marginTop: SIZES.spacing.sm,
  },
  alternateRow: {
    marginBottom: SIZES.spacing.sm,
  },
  alternateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 6,
    ...FONTS.medium,
  },
  alternateChips: {
    flexDirection: 'row',
    gap: 8,
  },
  alternateChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alternateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  alternateChipText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  alternateChipTextSelected: {
    color: COLORS.white,
  },
  buttonContainer: {
    marginTop: SIZES.spacing.xl,
    gap: 12,
  },
  saveButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SIZES.spacing.md,
  },
});
