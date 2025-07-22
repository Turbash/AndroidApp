import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function MLInsightsMotivation({ motivation, accentColor }: { motivation: string; accentColor: string }) {
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        💡 Motivation
      </ThemedText>
      <ThemedText type="body" style={[styles.motivationText, { color: accentColor }]}>
        {motivation}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  motivationText: {
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
  },
});
