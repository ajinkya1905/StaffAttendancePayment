import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  error = null,
  helperText = null,
  leftIcon = null,
  rightIcon = null,
  editable = true,
  style,
  inputStyle,
  prefix = null,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.multiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacing.base,
  },
  label: {
    fontSize: SIZES.md,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputDisabled: {
    backgroundColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.regular,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: SIZES.spacing.sm,
  },
  rightIcon: {
    marginLeft: SIZES.spacing.sm,
  },
  prefix: {
    fontSize: SIZES.base,
    color: COLORS.text,
    ...FONTS.medium,
    marginRight: 4,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.danger,
    marginTop: SIZES.spacing.xs,
    ...FONTS.regular,
  },
  helperText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
    ...FONTS.regular,
  },
});
