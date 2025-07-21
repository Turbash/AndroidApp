import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

export function SettingButton({
  title,
  onPress,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  const dangerColor = useThemeColor({ light: '#dc3545', dark: '#ff6b6b' }, 'text');
  return (
    <TouchableOpacity
      style={[styles.settingButton, { backgroundColor: cardBg }]}
      onPress={onPress}
    >
      <ThemedText style={danger ? { color: dangerColor } : {}}>{title}</ThemedText>
      <ThemedText style={styles.chevron}>›</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  chevron: {
    fontSize: 18,
    opacity: 0.5,
  },
});
