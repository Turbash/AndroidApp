import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function MLInsightsSummary({ summary }: { summary: string }) {
  return (
    <ThemedView variant="card" style={styles.section}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        📝 AI Summary
      </ThemedText>
      <ThemedText type="body" style={styles.summaryText}>{summary}</ThemedText>
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
  summaryText: {
    lineHeight: 22,
  },
});
