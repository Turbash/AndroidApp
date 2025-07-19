import React from 'react';
import { StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AIUnavailableStateProps {
  title: string;
  description?: string;
  icon: string;
}

export function AIUnavailableState({ 
  title, 
  description, 
  icon = "🤖" 
}: AIUnavailableStateProps) {
  const subtleTextColor = useThemeColor({ light: '#666', dark: '#999' }, 'text');
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.icon}>{icon}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {description && (
        <ThemedText style={[styles.description, { color: subtleTextColor }]}>
          {description}
        </ThemedText>
      )}
      <ThemedText style={[styles.note, { color: subtleTextColor }]}>
        ❌ AI analysis failed for this component
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  note: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
