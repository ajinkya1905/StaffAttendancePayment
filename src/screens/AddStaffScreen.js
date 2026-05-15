import React, { useState } from 'react';
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
import { Button, Input } from '../components';
import { COLORS, FONTS, SIZES, SHADOWS, WORK_TYPES, formatDate } from '../styles/theme';

export default function AddStaffScreen({ navigation, route }) {
  const { addStaffMember, updateStaffMember, staff } = useStaff();
  const editStaff = route.params?.staff;
  const isEditing = !!editStaff;

  const [name, setName] = useState(editStaff?.name || '');
  const [phone, setPhone] = useState(editStaff?.phone || '');
  const [workType, setWorkType] = useState(editStaff?.workType || 'maid');
  const [salary, setSalary] = useState(editStaff?.salary?.toString() || '');
  const [joiningDate, setJoiningDate] = useState(editStaff?.joiningDate || new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState(editStaff?.photo || null);
  const [notes, setNotes] = useState(editStaff?.notes || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
        salary: Number(salary),
        joiningDate,
        photo,
        notes: notes.trim(),
      };

      let success;
      if (isEditing) {
        success = await updateStaffMember(editStaff.id, staffData);
      } else {
        success = await addStaffMember(staffData);
      }

      if (success) {
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
            {WORK_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.workTypeButton,
                  workType === type.id && styles.workTypeSelected,
                ]}
                onPress={() => setWorkType(type.id)}
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
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
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
});
