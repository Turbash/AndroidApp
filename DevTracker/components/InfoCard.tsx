import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

export function InfoCard({ children }: { children: React.ReactNode }) {
  const cardBg = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'background');
  return (
    <ThemedView style={[styles.infoCard, { backgroundColor: cardBg }]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});
