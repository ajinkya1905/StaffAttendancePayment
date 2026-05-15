import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import Button from './Button';

export default function EmptyState({
  icon = '📋',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SIZES.spacing.base,
  },
  title: {
    fontSize: SIZES.xl,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
    ...FONTS.semiBold,
  },
  message: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.xl,
    ...FONTS.regular,
  },
  button: {
    marginTop: SIZES.spacing.base,
  },
});
