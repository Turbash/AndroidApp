import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function SettingButton({
  title,
  subtitle,
  onPress,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const dangerColor = useThemeColor({}, 'error');
  const subtleColor = useThemeColor({}, 'secondary');
  
  const cardColor = useThemeColor({}, 'card');
  return (
    <TouchableOpacity
      style={[styles.settingButton, { width: '100%' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.buttonContent, { backgroundColor: cardColor, borderRadius: 16 }]}> 
        <View style={styles.textContainer}>
          <ThemedText type="body" style={[styles.title, danger && { color: dangerColor }]}> 
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText type="caption" style={[styles.subtitle, { color: subtleColor }]}> 
              {subtitle}
            </ThemedText>
          )}
        </View>
        <ThemedText style={[styles.chevron, danger && { color: dangerColor }]}>›</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingButton: {
    marginBottom: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    opacity: 0.5,
    marginLeft: 12,
  },
});